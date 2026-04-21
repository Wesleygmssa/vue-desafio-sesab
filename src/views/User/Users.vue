<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatCPF, formatDate } from '@/utils/formatters';
import { api } from '@/services/api';
import Toast from '@/components/Toast.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const router = useRouter();

/* STATE */
const users = ref([]);
const page = ref(1);
const lastPage = ref(1);

const nome = ref('');
const cpf = ref('');
const dataInicio = ref('');
const dataFim = ref('');

const loading = ref(false);

/* TOAST */
const toast = ref({ show: false, message: '', type: 'success' });

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3000);
}

/* MODAL */
const confirmModal = ref({ show: false, user: null });

function openConfirm(user) {
  confirmModal.value = { show: true, user };
}

/* USER LOGADO */
const currentUser = ref({
  id: 1,
  role: 'admin',
});

/* REGRAS */
const isSelf = (user) => user.id === currentUser.value.id;
const isAdmin = (user) => user.profile?.nome?.toLowerCase() === 'admin';

/* BUSCAR */
async function buscarUsers(p = 1) {
  loading.value = true;

  try {
    const response = await api.get('/users', {
      params: {
        page: p,
        nome: nome.value || undefined,
        cpf: cpf.value.replace(/\D/g, ''),
        data_inicio: dataInicio.value || undefined,
        data_fim: dataFim.value || undefined,
      },
    });

    users.value = response.data.data;
    page.value = response.data.current_page;
    lastPage.value = response.data.last_page;
  } catch (error) {
    showToast('Erro ao buscar usuários', 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => buscarUsers(1));

/* DELETE */
async function deleteUser() {
  const user = confirmModal.value.user;

  try {
    await api.delete(`/users/${user.id}`);
    showToast('Usuário excluído com sucesso!', 'success');

    if (users.value.length === 1 && page.value > 1) {
      buscarUsers(page.value - 1);
    } else {
      buscarUsers(page.value);
    }
  } catch (error) {
    showToast('Erro ao excluir usuário', 'error');
  } finally {
    confirmModal.value.show = false;
  }
}

/* AÇÕES */
function editar(user) {
  router.push(`/users/${user.id}/edit`);
}

function detalhes(user) {
  router.push(`/users/${user.id}`);
}

function limparFiltros() {
  nome.value = '';
  cpf.value = '';
  dataInicio.value = '';
  dataFim.value = '';
  buscarUsers(1);
}
</script>

<template>
  <div class="max-w-8xl mx-auto mt-8 px-4">
    <!-- TOAST -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      position="top-right"
      size="md"
    />

    <!-- MODAL -->
    <div
      v-if="confirmModal.show"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-40"
    >
      <ConfirmModal
        :show="confirmModal.show"
        title="Confirmar exclusão"
        :itemName="confirmModal.user?.nome"
        confirmText="Excluir"
        confirmColor="red"
        @close="confirmModal.show = false"
        @confirm="deleteUser"
      />
    </div>

    <!-- NOVO USUÁRIO -->
    <div class="flex items-center mb-6">
      <button
        class="flex items-center gap-3 group cursor-pointer"
        @click="$router.push('/users/create')"
      >
        <div
          class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold shadow-md group-hover:bg-blue-700 transition"
        >
          +
        </div>

        <span
          class="text-gray-700 font-medium group-hover:text-blue-600 transition"
        >
          Novo Usuário
        </span>
      </button>
    </div>

    <!-- FILTROS -->
    <div class="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <input
          v-model="nome"
          placeholder="Nome"
          class="px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition"
        />

        <input
          v-model="cpf"
          placeholder="CPF"
          class="px-4 py-2.5 rounded-xl border bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition"
        />

        <input
          type="date"
          v-model="dataInicio"
          class="px-4 py-2.5 rounded-xl border bg-gray-50"
        />

        <input
          type="date"
          v-model="dataFim"
          class="px-4 py-2.5 rounded-xl border bg-gray-50"
        />

        <div class="flex flex-col sm:flex-row gap-2 sm:items-end">
          <button
            @click="buscarUsers(1)"
            class="flex-1 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Filtrar
          </button>

          <button
            @click="limparFiltros"
            class="px-4 py-2.5 rounded-xl border hover:bg-gray-100 transition"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- 🖥️ TABLE DESKTOP -->
    <div class="hidden md:block bg-white rounded-2xl overflow-hidden shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-[#f1f3ff]">
          <tr>
            <th class="p-4 text-left">Nome</th>
            <th class="p-4 text-left">CPF</th>
            <th class="p-4 text-left">Email</th>
            <th class="p-4 text-left">Perfil</th>
            <th class="p-4 text-left">Criado</th>
            <th class="p-4 text-left">Atualizado</th>
            <th class="p-4 text-center">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-10 text-gray-400">
              Carregando...
            </td>
          </tr>

          <tr
            v-for="user in users"
            :key="user.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-4">{{ user.nome }}</td>
            <td class="p-4">{{ formatCPF(user.cpf) }}</td>
            <td class="p-4">{{ user.email }}</td>
            <td class="p-4">{{ user.profile?.nome }}</td>
            <td class="p-4">{{ formatDate(user.created_at) }}</td>
            <td class="p-4">{{ formatDate(user.updated_at) }}</td>

            <td class="p-4">
              <div class="flex justify-end gap-2">
                <button @click="detalhes(user)" class="cursor-pointer">
                  🔍
                </button>

                <button
                  :disabled="isSelf(user) || isAdmin(user)"
                  @click="editar(user)"
                  class="transition"
                  :class="
                    isSelf(user) || isAdmin(user)
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-blue-50 text-blue-600'
                  "
                >
                  ✏️
                </button>

                <button
                  :disabled="isSelf(user) || isAdmin(user)"
                  @click="openConfirm(user)"
                  class="transition"
                  :class="
                    isSelf(user) || isAdmin(user)
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-red-50 text-red-600'
                  "
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 📱 MOBILE CARDS (AGORA VOLTOU CERTINHO) -->
    <div class="md:hidden space-y-3 mt-4">
      <div
        v-for="user in users"
        :key="user.id"
        class="bg-white rounded-xl p-4 shadow-sm border"
      >
        <p class="font-semibold">{{ user.nome }}</p>
        <p class="text-xs text-gray-500">{{ user.email }}</p>

        <div class="mt-3 text-sm space-y-1">
          <p><strong>CPF:</strong> {{ formatCPF(user.cpf) }}</p>
          <p><strong>Perfil:</strong> {{ user.profile?.nome }}</p>
          <p><strong>Criado:</strong> {{ formatDate(user.created_at) }}</p>
        </div>

        <div class="flex justify-end gap-2 mt-3">
          <button @click="detalhes(user)" class="cursor-pointer">🔍</button>

          <button
            :disabled="isSelf(user) || isAdmin(user)"
            @click="editar(user)"
            :class="
              isSelf(user) || isAdmin(user)
                ? 'opacity-40 cursor-not-allowed'
                : 'cursor-pointer'
            "
          >
            ✏️
          </button>

          <button
            :disabled="isSelf(user) || isAdmin(user)"
            @click="openConfirm(user)"
            :class="
              isSelf(user) || isAdmin(user)
                ? 'opacity-40 cursor-not-allowed'
                : 'cursor-pointer'
            "
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- 📄 PAGINAÇÃO -->
    <div class="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
      <div class="text-sm text-gray-600">
        Página <strong>{{ page }}</strong> de <strong>{{ lastPage }}</strong>
      </div>

      <div class="flex gap-2">
        <button
          :disabled="page === 1"
          @click="buscarUsers(page - 1)"
          class="cursor-pointer px-3 py-2 border rounded-lg disabled:opacity-40"
        >
          ←
        </button>

        <button
          :disabled="page === lastPage"
          @click="buscarUsers(page + 1)"
          class="cursor-pointer px-3 py-2 border rounded-lg disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>
