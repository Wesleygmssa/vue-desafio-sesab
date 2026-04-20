<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatCPF } from '@/utils/formatters';

import { api } from '@/services/api';
import Toast from '@/components/Toast.vue';

const route = useRoute();
const router = useRouter();

const user = ref({
  nome: '',
  cpf: '',
  email: '',
  profile_id: '',
  addresses: [],
});

const perfis = ref([]);
const enderecos = ref([]);
const loading = ref(true);

//  TOAST
const toast = ref({
  show: false,
  message: '',
  type: 'success',
});

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };

  setTimeout(() => {
    toast.value.show = false;
  }, 12000);
}

// CARREGAR DADOS
onMounted(async () => {
  try {
    const [resUser, resPerfis, resEnderecos] = await Promise.all([
      api.get(`/users/${route.params.id}`),
      api.get('/profiles'),
      api.get('/addresses'),
    ]);

    const data = resUser.data;

    user.value = {
      nome: data.nome || '',
      cpf: formatCPF(data.cpf || ''), // já entra formatado
      email: data.email || '',
      profile_id: data.profile_id || data.profile?.id || '',
      addresses: Array.isArray(data.addresses)
        ? data.addresses.map((a) => a.id ?? a)
        : [],
    };

    perfis.value = resPerfis.data;
    enderecos.value = resEnderecos.data;
  } catch (error) {
    console.error(error);
    showToast('Erro ao carregar dados', 'error');
  } finally {
    loading.value = false;
  }
});

//  ATUALIZAR
async function atualizar() {
  try {
    const data = {
      ...user.value,
      cpf: user.value.cpf.replace(/\D/g, ''), // limpa máscara
    };

    await api.put(`/users/${route.params.id}`, data);

    showToast('Usuário atualizado com sucesso!', 'success');

    setTimeout(() => {
      router.push('/users');
    }, 800);
  } catch (error) {
    console.error(error);

    let message = 'Erro ao cadastrar usuário';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // pega o primeiro erro do objeto
      const errors = error.response.data.errors;
      message = Object.values(errors)[0][0];
    }

    showToast(message, 'error');
  }
}
</script>

<template>
  <div class="max-w-8xl mx-auto mt-0 px-4 min-h-screen py-10">
    <!-- TOAST -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      position="top-right"
      size="md"
    />

    <!-- CARD -->
    <div class="bg-white rounded-2xl shadow-sm p-6 min-h-[75vh] flex flex-col">
      <!-- HEADER -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Editar Usuário</h1>
      </div>

      <div v-if="loading" class="text-gray-400">Carregando...</div>

      <form
        v-else
        @submit.prevent="atualizar"
        class="space-y-6 flex-1 flex flex-col"
      >
        <!-- CONTEÚDO -->
        <div class="space-y-6">
          <!-- GRID -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- NOME -->
            <div>
              <label class="text-xs text-gray-500">Nome</label>
              <input
                v-model="user.nome"
                required
                placeholder="Digite o nome"
                class="w-full mt-1 px-4 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:border-[#3448EB] transition"
              />
            </div>

            <!-- CPF -->
            <div>
              <label class="text-xs text-gray-500">CPF</label>
              <input
                :value="user.cpf"
                @input="user.cpf = formatCPF($event.target.value)"
                maxlength="14"
                required
                placeholder="000.000.000-00"
                class="w-full mt-1 px-4 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:border-[#3448EB] transition"
              />
            </div>

            <!-- EMAIL -->
            <div>
              <label class="text-xs text-gray-500">Email</label>
              <input
                v-model="user.email"
                type="email"
                required
                placeholder="email@email.com"
                class="w-full mt-1 px-4 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:border-[#3448EB] transition"
              />
            </div>

            <!-- PERFIL -->
            <div>
              <label class="text-xs text-gray-500">Perfil</label>
              <select
                v-model="user.profile_id"
                required
                class="w-full mt-1 px-4 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:border-[#3448EB] transition"
              >
                <option value="">Selecione</option>
                <option v-for="p in perfis" :key="p.id" :value="p.id">
                  {{ p.nome }}
                </option>
              </select>
            </div>
          </div>

          <!-- ENDEREÇOS -->
          <div>
            <label class="text-xs text-gray-500">Endereços</label>

            <div
              class="mt-2 max-h-96 overflow-y-auto border rounded-xl p-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300"
            >
              <label
                v-for="e in enderecos"
                :key="e.id"
                class="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <input
                  type="checkbox"
                  :value="e.id"
                  v-model="user.addresses"
                  class="w-4 h-4"
                  style="accent-color: #3448eb"
                />

                <span class="text-sm text-gray-700">
                  {{ e.logradouro }}, {{ e.numero }} - {{ e.bairro }}
                  <br class="md:hidden" />
                  <span class="text-gray-500">
                    {{ e.cidade }}/{{ e.estado }}
                    <span v-if="e.cep"> - CEP: {{ e.cep }}</span>
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- BOTÕES -->
        <div class="flex justify-end gap-3 pt-4 mt-auto">
          <button
            type="button"
            @click="router.push('/users')"
            class="cursor-pointer px-5 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="cursor-pointer px-5 py-2 rounded-xl text-white font-medium transition hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            style="background: #3448eb"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
