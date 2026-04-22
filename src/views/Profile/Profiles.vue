<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import Toast from '@/components/Toast.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

/* STATE FORM */
const profile = ref({
  nome: '',
});

/* LISTA */
const profiles = ref([]);

/* LOADING */
const loadingSave = ref(false);
const loadingProfile = ref(false);
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

/* VALIDAR */
function validateForm() {
  if (!profile.value.nome || !profile.value.nome.trim()) {
    return 'O campo nome é obrigatório';
  }
  return null;
}

/* CARREGAR PERFIL (individual opcional) */
async function loadProfile() {
  try {
    loadingProfile.value = true;

    const res = await api.get('/profile');

    const response = res.data;

    const profileData = Array.isArray(response)
      ? response[0]
      : (response.data ?? response);

    profile.value = {
      nome: profileData?.nome || '',
    };
  } catch (error) {
    console.error(error);
  } finally {
    loadingProfile.value = false;
  }
}

/* LISTAR PERFIS */
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

/* SALVAR PERFIL */
async function salvar() {
  const errorMsg = validateForm();

  if (errorMsg) {
    showToast(errorMsg, 'error');
    return;
  }

  try {
    loadingSave.value = true;

    const payload = {
      nome: profile.value.nome.trim(),
    };

    await api.post('/profiles', payload);

    showToast('Perfil criado com sucesso!', 'success');

    profile.value.nome = '';

    await loadProfiles();
  } catch (error) {
    console.error(error);

    const message =
      error.response?.data?.message ||
      Object.values(error.response?.data?.errors || {})?.[0]?.[0] ||
      'Erro ao salvar perfil';

    showToast(message, 'error');
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

onMounted(() => {
  loadProfile();
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
      <!-- HEADER -->
      <h1 class="text-2xl font-bold text-gray-800 mb-8">Gerenciar Perfis</h1>

      <!-- FORM -->
      <form @submit.prevent="salvar" class="space-y-6">
        <div>
          <label class="text-sm font-medium text-gray-600"> Nome </label>

          <input
            v-model="profile.nome"
            type="text"
            class="input"
            placeholder="Digite o nome do perfil"
          />
        </div>

        <div class="flex justify-end pt-4 border-t">
          <button
            type="submit"
            :disabled="loadingSave"
            class="cursor-pointer px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
          >
            <span v-if="loadingSave">Salvando...</span>
            <span v-else>Salvar perfil</span>
          </button>
        </div>
      </form>

      <!-- LISTA -->
      <div class="mt-10">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          Perfis cadastrados
        </h2>

        <LoadingOverlay v-if="loadingList" :show="true" />

        <div v-else class="space-y-3">
          <div
            v-for="p in profiles"
            :key="p.id"
            class="flex justify-between items-center p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition"
          >
            <div>
              <p class="font-medium text-gray-800">
                {{ p.nome }}
              </p>
            </div>

            <button
              @click="deleteProfile(p.id)"
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
