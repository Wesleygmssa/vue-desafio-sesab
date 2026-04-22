<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import Toast from '@/components/Toast.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import BaseModal from '@/components/BaseModal.vue';

/* CREATE FORM */
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

/* MODAL EDIT */
const showModal = ref(false);
const editingAddressId = ref(null);

const editForm = ref({
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
});

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

/* VALIDATE CREATE */
function validateForm() {
  for (const [key, value] of Object.entries(address.value)) {
    if (!value?.trim()) {
      return `O campo ${key} é obrigatório`;
    }
  }
  return null;
}

/* VALIDATE EDIT */
function validateEditForm() {
  for (const [key, value] of Object.entries(editForm.value)) {
    if (!value?.trim()) {
      return `O campo ${key} é obrigatório`;
    }
  }
  return null;
}

/* LOAD */
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

/* CREATE */
async function salvar() {
  const error = validateForm();

  if (error) {
    showToast(error, 'error');
    return;
  }

  try {
    loadingSave.value = true;

    await api.post('/addresses', {
      logradouro: address.value.logradouro.trim(),
      numero: address.value.numero.trim(),
      bairro: address.value.bairro.trim(),
      cidade: address.value.cidade.trim(),
      estado: address.value.estado.trim(),
      cep: address.value.cep.trim(),
    });

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
    showToast('Erro ao criar endereço', 'error');
  } finally {
    loadingSave.value = false;
  }
}

/* DELETE */
async function deleteAddress(id) {
  try {
    await api.delete(`/addresses/${id}`);

    showToast('Endereço removido com sucesso!', 'success');

    await loadAddresses();
  } catch (error) {
    console.error(error);
    showToast('Erro ao excluir endereço', 'error');
  }
}

/* OPEN EDIT */
function openEditModal(item) {
  editingAddressId.value = item.id;

  editForm.value = {
    logradouro: item.logradouro,
    numero: item.numero,
    bairro: item.bairro,
    cidade: item.cidade,
    estado: item.estado,
    cep: item.cep,
  };

  showModal.value = true;
}

/* UPDATE */
async function updateAddress() {
  const error = validateEditForm();

  if (error) {
    showToast(error, 'error');
    return;
  }

  try {
    loadingSave.value = true;

    await api.put(`/addresses/${editingAddressId.value}`, {
      logradouro: editForm.value.logradouro.trim(),
      numero: editForm.value.numero.trim(),
      bairro: editForm.value.bairro.trim(),
      cidade: editForm.value.cidade.trim(),
      estado: editForm.value.estado.trim(),
      cep: editForm.value.cep.trim(),
    });

    showToast('Endereço atualizado com sucesso!', 'success');

    showModal.value = false;

    await loadAddresses();
  } catch (error) {
    console.error(error);

    showToast(
      error.response?.data?.message || 'Erro ao atualizar endereço',
      'error'
    );
  } finally {
    loadingSave.value = false;
  }
}

onMounted(() => {
  loadAddresses();
});
</script>

<template>
  <div class="max-w-8xl mx-auto px-4 min-h-screen py-10">
    <!-- TOAST -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      position="top-right"
    />

    <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <h1 class="text-2xl font-bold text-gray-800 mb-8">Gerenciar Endereços</h1>

      <!-- CREATE -->
      <form @submit.prevent="salvar" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            v-model="address.logradouro"
            class="input"
            placeholder="Logradouro"
          />
          <input v-model="address.numero" class="input" placeholder="Número" />
          <input v-model="address.bairro" class="input" placeholder="Bairro" />
          <input v-model="address.cidade" class="input" placeholder="Cidade" />
          <input
            v-model="address.estado"
            class="input"
            maxlength="2"
            placeholder="Estado"
          />
          <input v-model="address.cep" class="input" placeholder="CEP" />
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loadingSave"
            class="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
          >
            <span v-if="loadingSave">Salvando...</span>
            <span v-else>Salvar</span>
          </button>
        </div>
      </form>

      <!-- LIST -->
      <div class="mt-10">
        <h2 class="text-lg font-semibold mb-4">Endereços cadastrados</h2>

        <LoadingOverlay v-if="loadingList" :show="true" />

        <div v-else class="space-y-3">
          <div
            v-for="a in addresses"
            :key="a.id"
            class="flex justify-between items-center p-4 border rounded-xl bg-gray-50"
          >
            <div>
              <p class="font-medium">{{ a.logradouro }}, {{ a.numero }}</p>

              <p class="text-sm text-gray-500">
                {{ a.bairro }} - {{ a.cidade }}/{{ a.estado }}
              </p>

              <p class="text-xs text-gray-400">CEP: {{ a.cep }}</p>
            </div>

            <div class="flex gap-2">
              <button
                @click="openEditModal(a)"
                class="cursor-pointer px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-lg"
              >
                Editar
              </button>

              <button
                @click="deleteAddress(a.id)"
                class="cursor-pointer px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL COMPONENTE -->
    <BaseModal
      :show="showModal"
      title="Editar Endereço"
      @close="showModal = false"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          v-model="editForm.logradouro"
          class="input"
          placeholder="Logradouro"
        />
        <input v-model="editForm.numero" class="input" placeholder="Número" />
        <input v-model="editForm.bairro" class="input" placeholder="Bairro" />
        <input v-model="editForm.cidade" class="input" placeholder="Cidade" />
        <input
          v-model="editForm.estado"
          class="input"
          maxlength="2"
          placeholder="Estado"
        />
        <input v-model="editForm.cep" class="input" placeholder="CEP" />
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="showModal = false"
          class="cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>

        <button
          @click="updateAddress"
          :disabled="loadingSave"
          class="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <span v-if="loadingSave">Salvando...</span>
          <span v-else>Salvar</span>
        </button>
      </div>
    </BaseModal>
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
