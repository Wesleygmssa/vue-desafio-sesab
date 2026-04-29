<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { formatCPF, formatDate } from '@/utils/formatters';
import { api } from '@/services/api';
import Toast from '@/components/Toast.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import Tooltip from '@/components/Tooltip.vue';

const router = useRouter();

/* STATE */
const users = ref([]);
const page = ref(1);
const lastPage = ref(1);

const total = ref(0);
const perPage = ref(0);

const nome = ref('');
const cpf = ref('');
const dataInicio = ref('');
const dataFim = ref('');

const loading = ref(false);

/* PAGINAÇÃO TEXTO */
const showingText = computed(() => {
  const start = (page.value - 1) * perPage.value + 1;
  const end = Math.min(page.value * perPage.value, total.value);

  if (!total.value) return 'Nenhum registro';

  return `Mostrando ${start} até ${end} de ${total.value} registros`;
});

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
const isAdmin = computed(() => currentUser.value.role === 'admin');
const isSelf = (user) => user.id === currentUser.value.id;

const canEdit = (user) => isAdmin.value && !isSelf(user);
const canDelete = (user) => isAdmin.value && !isSelf(user);

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

    total.value = response.data.total;
    perPage.value = response.data.per_page;
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
  if (!canEdit(user)) return;
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
    <div v-if="isAdmin" class="flex items-center mb-6">
      <button
        class="flex items-center gap-3 group cursor-pointer"
        @click="$router.push('/users/create')"
      >
        <div
          class="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 text-white text-xl font-bold shadow-md group-hover:bg-purple-700 transition"
        >
          +
        </div>

        <span
          class="text-gray-700 font-medium group-hover:text-purple-600 transition"
        >
          Novo Usuário
        </span>
      </button>
    </div>

    <!-- FILTROS -->
    <div class="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-gray-700">Filtros de busca</h3>
        <p class="text-xs text-gray-400">
          Use os filtros abaixo para refinar os resultados
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <input
            v-model="nome"
            placeholder="Buscar por nome"
            class="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition w-full"
          />
        </div>

        <div>
          <input
            v-model="cpf"
            @input="cpf = formatCPF($event.target.value)"
            placeholder="000.000.000-00"
            class="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition w-full"
          />
        </div>

        <div>
          <input
            type="date"
            v-model="dataInicio"
            class="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-600 w-full"
          />
        </div>

        <div>
          <input
            type="date"
            v-model="dataFim"
            class="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:border-purple-600 w-full"
          />
        </div>

        <div class="flex items-end gap-2">
          <button
            @click="buscarUsers(1)"
            class="cursor-pointer flex-1 py-2.5 rounded-xl text-white font-medium bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all shadow-sm"
          >
            Filtrar
          </button>

          <button
            @click="limparFiltros"
            class="cursor-pointer px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE DESKTOP -->
    <div class="hidden md:block">
      <div class="relative bg-white rounded-2xl overflow-hidden shadow-sm">
        <LoadingOverlay :show="loading" />

        <table class="w-full text-sm">
          <thead class="bg-purple-50">
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
                  <Tooltip text="Ver detalhes">
                    <button @click="detalhes(user)" class="cursor-pointer">
                      🔍
                    </button>
                  </Tooltip>

                  <Tooltip text="Editar usuário">
                    <button
                      :disabled="!canEdit(user)"
                      @click="editar(user)"
                      class="text-purple-600 disabled:opacity-30 cursor-pointer"
                    >
                      ✏️
                    </button>
                  </Tooltip>

                  <Tooltip text="Excluir usuário">
                    <button
                      :disabled="!canDelete(user)"
                      @click="openConfirm(user)"
                      class="text-red-500 disabled:opacity-30 cursor-pointer"
                    >
                      🗑️
                    </button>
                  </Tooltip>
                </div>
              </td>
            </tr>

            <tr v-if="!loading && users.length === 0">
              <td colspan="7" class="text-center py-10 text-gray-400">
                Nenhum usuário encontrado
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MOBILE -->
    <div class="md:hidden space-y-3 mt-4">
      <LoadingOverlay :show="loading" />

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
          <button @click="detalhes(user)">🔍</button>

          <button
            :disabled="!canEdit(user)"
            @click="editar(user)"
            class="text-purple-600 disabled:opacity-30 cursor-pointer"
          >
            ✏️
          </button>

          <button
            :disabled="!canDelete(user)"
            @click="openConfirm(user)"
            class="text-red-500 disabled:opacity-30 cursor-pointer"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- PAGINAÇÃO -->
    <div
      class="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
    >
      <!-- INFO -->
      <div class="text-sm text-gray-500">
        {{ showingText }}
      </div>

      <!-- PAGINAÇÃO -->
      <div
        class="flex items-center gap-2 bg-white border rounded-xl p-1 shadow-sm"
      >
        <button
          :disabled="page === 1"
          @click="buscarUsers(page - 1)"
          class="cursor-pointer px-3 py-2 rounded-lg transition flex items-center gap-1 hover:bg-purple-50 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← <span class="hidden sm:inline">Anterior</span>
        </button>

        <div
          class="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold shadow"
        >
          {{ page }}
        </div>

        <button
          :disabled="page === lastPage"
          @click="buscarUsers(page + 1)"
          class="cursor-pointer px-3 py-2 rounded-lg transition flex items-center gap-1 hover:bg-purple-50 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span class="hidden sm:inline">Próxima</span> →
        </button>
      </div>
    </div>
  </div>
</template>
