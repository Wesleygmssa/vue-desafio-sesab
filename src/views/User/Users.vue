<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { formatCPF, formatDate } from '@/utils/formatters';
import BaseButton from '@/components/BaseButton.vue';
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

/* VALIDAÇÃO */
function validarDatas() {
  if (dataInicio.value && dataFim.value) {
    if (dataInicio.value > dataFim.value) {
      showToast('Data início não pode ser maior que data fim', 'error');
      return false;
    }
  }
  return true;
}

/* TOAST */
const toast = ref({
  show: false,
  message: '',
  type: 'success',
});

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3000);
}

/* MODAL */
const confirmModal = ref({
  show: false,
  user: null,
});

function openConfirm(user) {
  confirmModal.value = { show: true, user };
}

/* BUSCAR */
async function buscarUsers(p = 1) {
  if (!validarDatas()) return;

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
    console.error(error);
    showToast('Erro ao buscar usuários', 'error');
  } finally {
    loading.value = false;
  }
}

/* LIFE */
onMounted(() => {
  buscarUsers(1);
});

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
    console.error(error);
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

const currentUser = ref({
  id: 1,
  role: 'admin',
});

const isSelf = (user) => user.id === currentUser.value.id;
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

      <!-- <div class="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        <h2 class="text-lg font-bold mb-3">Confirmar exclusão</h2>

        <p class="mb-6">
          Deseja excluir <strong>{{ confirmModal.user?.nome }}</strong
          >?
        </p>

        <div class="flex justify-end gap-3">
          <BaseButton
            label="Cancelar"
            color="gray"
            @click="confirmModal.show = false"
          />
          <BaseButton label="Excluir" color="red" @click="deleteUser" />
        </div>
      </div> -->
    </div>

    <!-- HEADER -->
    <!-- <div class="flex mb-6">
      <BaseButton
        label="Novo Usuário"
        color="blue"
        class="shadow-md"
        @click="$router.push('/users/create')"
      />
    </div> -->

    <!-- HEADER -->
    <div class="flex items-center mb-6">
      <button
        class="flex items-center gap-3 group cursor-pointer"
        @click="$router.push('/users/create')"
      >
        <!-- BOTÃO REDONDO -->
        <div
          class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold shadow-md group-hover:bg-blue-700 transition"
        >
          +
        </div>

        <!-- TEXTO -->
        <span
          class="text-gray-700 font-medium group-hover:text-blue-600 transition"
        >
          Novo Usuário
        </span>
      </button>
    </div>

    <!-- FILTROS -->
    <div class="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
      <!-- HEADER (opcional, dá cara de painel) -->
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-gray-700">Filtros de busca</h3>
        <p class="text-xs text-gray-400">
          Use os filtros abaixo para refinar os resultados
        </p>
      </div>

      <!-- GRID -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- NOME -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-500 mb-1">Nome</label>
          <input
            v-model="nome"
            placeholder="Buscar por nome"
            class="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3448EB] focus:ring-2 focus:ring-[#3448EB]/10 outline-none transition"
          />
        </div>

        <!-- CPF -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-500 mb-1">CPF</label>
          <input
            v-model="cpf"
            @input="cpf = formatCPF($event.target.value)"
            placeholder="000.000.000-00"
            class="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3448EB] focus:ring-2 focus:ring-[#3448EB]/10 outline-none transition"
          />
        </div>

        <!-- DATA INÍCIO -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-500 mb-1"
            >Data início</label
          >
          <input
            type="date"
            v-model="dataInicio"
            class="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3448EB] focus:ring-2 focus:ring-[#3448EB]/10 outline-none transition"
          />
        </div>

        <!-- DATA FIM -->
        <div class="flex flex-col">
          <label class="text-xs font-medium text-gray-500 mb-1">Data fim</label>
          <input
            type="date"
            v-model="dataFim"
            class="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3448EB] focus:ring-2 focus:ring-[#3448EB]/10 outline-none transition"
          />
        </div>

        <!-- AÇÕES -->
        <div class="flex items-end gap-2">
          <button
            @click="buscarUsers(1)"
            class="cursor-pointer flex-1 py-2.5 rounded-xl text-white font-medium bg-[#3448EB] hover:bg-[#2f3ed6] active:scale-[0.98] transition-all shadow-sm"
          >
            Filtrar
          </button>

          <button
            @click="limparFiltros"
            class="cursor-pointer px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 active:scale-[0.98] transition"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- TABELA -->
    <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
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
              <div
                class="flex justify-end items-center gap-2 opacity-80 hover:opacity-100 transition"
              >
                <button
                  class="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
                  @click="detalhes(user)"
                  title="Detalhes"
                >
                  🔍
                </button>

                <button
                  class="cursor-pointer p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  @click="editar(user)"
                  :disabled="isSelf(user)"
                  title="Editar"
                >
                  ✏️
                </button>

                <button
                  class="cursor-pointer p-2 rounded-lg hover:bg-red-50 text-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  @click="openConfirm(user)"
                  :disabled="isSelf(user)"
                  title="Excluir"
                >
                  🗑️
                </button>
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

    <!-- PAGINAÇÃO MODERNA -->
    <!-- PAGINAÇÃO -->
    <div class="mt-6 flex justify-end items-center gap-6">
      <!-- INFO -->
      <div class="text-sm text-gray-600">
        Página <strong>{{ page }}</strong> de <strong>{{ lastPage }}</strong>
      </div>

      <!-- CONTROLES -->
      <div class="flex items-center gap-2">
        <!-- ANTERIOR -->
        <button
          :disabled="page === 1"
          @click="buscarUsers(page - 1)"
          class="px-3 py-2 rounded-lg border text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
          :class="page !== 1 ? 'cursor-pointer' : 'cursor-not-allowed'"
        >
          ←
        </button>

        <!-- PÁGINAS -->
        <button
          v-for="p in pages"
          :key="p"
          @click="buscarUsers(p)"
          class="px-3 py-2 rounded-lg text-sm font-medium transition"
          :class="[
            p === page
              ? 'text-white'
              : 'text-gray-600 hover:bg-gray-100 cursor-pointer',
          ]"
          :style="p === page ? 'background:#3448EB' : ''"
        >
          {{ p }}
        </button>

        <!-- PRÓXIMO -->
        <button
          :disabled="page === lastPage"
          @click="buscarUsers(page + 1)"
          class="px-3 py-2 rounded-lg border text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
          :class="page !== lastPage ? 'cursor-pointer' : 'cursor-not-allowed'"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>
