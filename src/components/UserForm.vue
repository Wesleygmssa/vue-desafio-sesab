<script setup>
import { ref, watch, onMounted } from 'vue';
import { api } from '@/services/api';
import { formatCPF } from '../utils/formatters';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  modelValue: Object,
  loading: Boolean,
});

const emit = defineEmits(['submit']);

const form = ref({
  nome: '',
  cpf: '',
  email: '',
  profile_id: '',
  addresses: [],
});

//  listas dos combos
const perfis = ref([]);
const enderecos = ref([]);
const loadingCombos = ref(true);

//  carregar perfis e endereços
onMounted(async () => {
  try {
    const [resPerfis, resEnderecos] = await Promise.all([
      api.get('/profiles'),
      api.get('/addresses'),
    ]);

    perfis.value = resPerfis.data;
    enderecos.value = resEnderecos.data;
  } catch (error) {
    console.error(error);
    alert('Erro ao carregar perfis ou endereços');
  } finally {
    loadingCombos.value = false;
  }
});

//  sincroniza quando recebe dados (edição)
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      form.value = {
        nome: newVal.nome || '',
        cpf: newVal.cpf || '',
        email: newVal.email || '',
        profile_id: newVal.profile_id || newVal.profile?.id || '',
        //  transforma objetos em array de IDs
        addresses: Array.isArray(newVal.addresses)
          ? newVal.addresses.map((a) => a.id ?? a)
          : [],
      };
    }
  },
  { immediate: true }
);

// máscara de CPF
watch(
  () => form.value.cpf,
  (newVal) => {
    form.value.cpf = formatCPF(newVal);
  }
);

function enviar() {
  const data = {
    ...form.value,
    cpf: form.value.cpf.replace(/\D/g, ''),
  };

  emit('submit', data);
}
</script>

<template>
  <form @submit.prevent="enviar" class="form">
    <label>Nome</label>
    <input v-model="form.nome" required />

    <label>CPF</label>
    <input v-model="form.cpf" required />

    <label>Email</label>
    <input v-model="form.email" type="email" required />

    <!-- PERFIL -->
    <label>Perfil</label>
    <select v-model="form.profile_id" required :disabled="loadingCombos">
      <option value="">Selecione</option>
      <option v-for="p in perfis" :key="p.id" :value="p.id">
        {{ p.nome }}
      </option>
    </select>

    <!-- ENDEREÇOS -->
    <label>Endereços</label>
    <select v-model="form.addresses" multiple :disabled="loadingCombos">
      <option v-for="e in enderecos" :key="e.id" :value="e.id">
        {{ e.logradouro }} - {{ e.bairro }} ({{ e.cidade }}) - {{ e.cep }}
      </option>
    </select>

    <!-- botão -->
    <button class="btn salvar" :disabled="loading || loadingCombos">
      {{ loading ? 'Salvando...' : 'Salvar' }}
    </button>

    <!-- ACTIONS -->
    <button
      class="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer mt-2"
      @click="router.push('/users')"
    >
      Cancelar
    </button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
}

label {
  margin-top: 10px;
  font-weight: bold;
}

input,
select {
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

select[multiple] {
  height: 100px;
}

.btn.salvar {
  margin-top: 15px;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn.salvar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
