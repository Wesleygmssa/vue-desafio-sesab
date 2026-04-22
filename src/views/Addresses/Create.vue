<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import Toast from '@/components/Toast.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

/* FORM */
const address = ref({
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
});

/* LISTA */
const addresses = ref([]);

/* LOADING */
const loadingSave = ref(false);
const loadingList = ref(false);

/* TOAST */
const toast = ref({
  show: false,
  message: '',
  type: 'success',
});

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };

  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

/* VALIDAR CAMPOS */
function validateForm() {
  const fields = Object.entries(address.value);

  for (const [key, value] of fields) {
    if (!value || !value.toString().trim()) {
      return `O campo ${key} é obrigatório`;
    }
  }

  return null;
}

/* CARREGAR LISTA */
async function loadAddresses() {
  try {
    loadingList.value = true;
    const res = await api.get('/addresses');
    addresses.value = res.data;
  } catch (error) {
    console.error(error);
    showToast('Erro ao carregar endereços', 'error');
  } finally {
    loadingList.value = false;
  }
}

/* SALVAR */
async function salvar() {
  const errorMsg = validateForm();

  if (errorMsg) {
    showToast(errorMsg, 'error');
    return;
  }

  try {
    loadingSave.value = true;

    const payload = {
      logradouro: address.value.logradouro.trim(),
      numero: address.value.numero.trim(),
      bairro: address.value.bairro.trim(),
      cidade: address.value.cidade.trim(),
      estado: address.value.estado.trim(),
      cep: address.value.cep.trim(),
    };

    await api.post('/addresses', payload);

    showToast('Endereço criado com sucesso!', 'success');

    address.value = {
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    };

    await loadAddresses();
  } catch (error) {
    console.error(error);

    const message =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})?.[0]?.[0] ||
      'Erro ao criar endereço';

    showToast(message, 'error');
  } finally {
    loadingSave.value = false;
  }
}

/* DELETE */
async function deleteAddress(id) {
  try {
    await api.delete(`/addresses/${id}`);
    showToast('Endereço removido com sucesso!', 'success');
    loadAddresses();
  } catch (error) {
    console.error(error);
    showToast('Erro ao excluir endereço', 'error');
  }
}

onMounted(() => {
  loadAddresses();
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 min-h-screen py-10">
    <!-- TOAST -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      position="top-right"
    />

    <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <!-- HEADER -->
      <h1 class="text-2xl font-bold text-gray-800 mb-8">Gerenciar Endereços</h1>

      <!-- FORM -->
      <form @submit.prevent="salvar" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="text-sm font-medium text-gray-600">Logradouro</label>
            <input v-model="address.logradouro" class="input" />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-600">Número</label>
            <input v-model="address.numero" class="input" />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-600">Bairro</label>
            <input v-model="address.bairro" class="input" />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-600">Cidade</label>
            <input v-model="address.cidade" class="input" />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-600">Estado</label>
            <input v-model="address.estado" maxlength="2" class="input" />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-600">CEP</label>
            <input v-model="address.cep" maxlength="9" class="input" />
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t">
          <button
            type="submit"
            :disabled="loadingSave"
            class="cursor-pointer px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
          >
            <span v-if="loadingSave">Salvando...</span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </form>

      <!-- LISTA -->
      <div class="mt-10">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          Endereços cadastrados
        </h2>

        <!-- LOADING LISTA -->
        <LoadingOverlay v-if="loadingList" :show="true" />

        <div v-else class="space-y-3">
          <div
            v-for="a in addresses"
            :key="a.id"
            class="flex justify-between items-center p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition"
          >
            <div>
              <p class="font-medium text-gray-800">
                {{ a.logradouro }}, {{ a.numero }}
              </p>

              <p class="text-sm text-gray-500">
                {{ a.bairro }} - {{ a.cidade }}/{{ a.estado }}
              </p>

              <p class="text-xs text-gray-400">CEP: {{ a.cep }}</p>
            </div>

            <button
              @click="deleteAddress(a.id)"
              class="cursor-pointer px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-lg transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.input {
  margin-top: 4px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  transition: 0.2s;
}

.input:focus {
  background: white;
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}
</style>
