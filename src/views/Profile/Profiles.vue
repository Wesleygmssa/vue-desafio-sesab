<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import Toast from '@/components/Toast.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import DynamicModalForm from '@/components/DynamicModalForm.vue';
import BaseModal from '@/components/BaseModal.vue';

/* CREATE FORM */
const profile = ref({
  nome: '',
});

/* LIST */
const profiles = ref([]);

/* EDIT MODAL */
const showModal = ref(false);
const editingProfileId = ref(null);

const editForm = ref({
  nome: '',
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

const editFields = [
  {
    key: 'nome',
    label: 'Nome',
    type: 'text',
  },
];

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };

  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

/* VALIDATE CREATE */
function validateForm() {
  if (!profile.value.nome?.trim()) {
    return 'O campo nome é obrigatório';
  }
  return null;
}

/* LOAD LIST */
async function loadProfiles() {
  try {
    loadingList.value = true;

    const res = await api.get('/profiles');

    profiles.value = res.data || [];
  } catch (error) {
    console.error(error);
    showToast('Erro ao carregar perfis', 'error');
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

    await api.post('/profiles', {
      nome: profile.value.nome.trim(),
    });

    showToast('Perfil criado com sucesso!', 'success');

    profile.value.nome = '';

    await loadProfiles();
  } catch (error) {
    console.error(error);
    showToast('Erro ao salvar perfil', 'error');
  } finally {
    loadingSave.value = false;
  }
}

/* DELETE */
async function deleteProfile(id) {
  try {
    await api.delete(`/profiles/${id}`);

    showToast('Perfil removido com sucesso!', 'success');

    await loadProfiles();
  } catch (error) {
    console.error(error);
    showToast('Erro ao excluir perfil', 'error');
  }
}

/* OPEN EDIT MODAL */
function openEditModal(profileItem) {
  editingProfileId.value = profileItem.id;

  editForm.value = {
    nome: profileItem.nome,
  };

  showModal.value = true;
}

/* UPDATE */
async function updateProfile() {
  if (!editForm.value.nome?.trim()) {
    showToast('O nome é obrigatório', 'error');
    return;
  }

  try {
    loadingSave.value = true;

    await api.put(`/profiles/${editingProfileId.value}`, {
      nome: editForm.value.nome.trim(),
    });

    showToast('Perfil atualizado com sucesso!', 'success');

    showModal.value = false;

    await loadProfiles();
  } catch (error) {
    console.error(error);

    showToast(
      error.response?.data?.message || 'Erro ao atualizar perfil',
      'error'
    );
  } finally {
    loadingSave.value = false;
  }
}

onMounted(() => {
  loadProfiles();
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
      <!-- TITLE -->
      <h1 class="text-2xl font-bold text-gray-800 mb-8">Gerenciar Perfis</h1>

      <!-- CREATE FORM -->
      <form @submit.prevent="salvar" class="space-y-6">
        <div>
          <label class="text-sm font-medium text-gray-600">Nome</label>

          <input
            v-model="profile.nome"
            type="text"
            class="input"
            placeholder="Digite o nome"
          />
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
        <h2 class="text-lg font-semibold mb-4">Perfis cadastrados</h2>

        <LoadingOverlay v-if="loadingList" :show="true" />

        <div v-else class="space-y-3">
          <div
            v-for="p in profiles"
            :key="p.id"
            class="flex justify-between items-center p-4 border rounded-xl bg-gray-50"
          >
            <span class="font-medium">
              {{ p.nome }}
            </span>

            <div class="flex gap-2">
              <button
                @click="openEditModal(p)"
                class="cursor-pointer px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded-lg"
              >
                Editar
              </button>

              <button
                @click="deleteProfile(p.id)"
                class="cursor-pointer px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT -->
    <BaseModal
      :show="showModal"
      title="Editar Perfil"
      max-width="max-w-md"
      @close="showModal = false"
    >
      <input v-model="editForm.nome" type="text" class="input" />

      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="showModal = false"
          class="cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>

        <button
          @click="updateProfile"
          :disabled="loadingSave"
          class="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <span v-if="loadingSave">Salvando...</span>
          <span v-else>Salvar</span>
        </button>
      </div>
    </BaseModal>

    <!-- <DynamicModalForm
      v-model:show="showModal"
      v-model="editForm"
      :fields="editFields"
      title="Editar Perfil"
      :loading="loadingSave"
      @save="updateProfile"
    /> -->
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
