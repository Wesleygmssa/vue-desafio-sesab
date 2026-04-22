<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatCPF, formatDate } from '@/utils/formatters';
import { api } from '@/services/api';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const loading = ref(true);

// Buscar usuário
onMounted(async () => {
  try {
    loading.value = true;

    const response = await api.get(`/users/${route.params.id}`);
    user.value = response.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-8xl mx-auto mt-0 px-4 min-h-screen py-5">
    <!-- CARD -->
    <div
      class="relative bg-white rounded-2xl shadow-sm p-6 min-h-[75vh] flex flex-col"
    >
      <LoadingOverlay :show="loading" />

      <!-- HEADER -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Detalhes do Usuário</h1>
      </div>

      <!-- CONTEÚDO -->
      <div
        class="space-y-6 flex-1"
        :class="{ 'opacity-50 pointer-events-none': loading }"
        v-if="user"
      >
        <!-- GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500">Nome</span>
            <p class="font-semibold text-gray-800">{{ user.nome }}</p>
          </div>

          <div class="p-4 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500">CPF</span>
            <p class="font-semibold text-gray-800">
              {{ formatCPF(user.cpf) }}
            </p>
          </div>

          <div class="p-4 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500">Email</span>
            <p class="font-semibold text-gray-800">{{ user.email }}</p>
          </div>

          <!-- PERFIL (ROXO PADRÃO) -->
          <div class="p-4 rounded-xl border bg-purple-50 border-purple-200">
            <span class="text-xs text-purple-600">Perfil</span>
            <p class="font-semibold text-purple-700">
              {{ user.profile?.nome || 'Não informado' }}
            </p>
          </div>
        </div>

        <!-- ENDEREÇOS -->
        <div>
          <span class="text-xs text-gray-500">Endereços</span>

          <div v-if="user.addresses?.length" class="mt-3 space-y-3">
            <div
              v-for="(address, index) in user.addresses"
              :key="address.id || index"
              class="p-4 bg-gray-50 rounded-xl border"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><strong>Logradouro:</strong> {{ address.logradouro }}</p>
                <p><strong>Número:</strong> {{ address.numero }}</p>
                <p><strong>Bairro:</strong> {{ address.bairro }}</p>
                <p><strong>Cidade:</strong> {{ address.cidade }}</p>
                <p><strong>Estado:</strong> {{ address.estado }}</p>
                <p><strong>CEP:</strong> {{ address.cep }}</p>
              </div>
            </div>
          </div>

          <p v-else class="text-gray-400 mt-2">Nenhum endereço cadastrado</p>
        </div>

        <!-- DATAS -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500">Criado em</span>
            <p class="font-semibold text-gray-800">
              {{ formatDate(user.created_at) }}
            </p>
          </div>

          <div class="p-4 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500">Atualizado em</span>
            <p class="font-semibold text-gray-800">
              {{ formatDate(user.updated_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- AÇÕES -->
      <div class="flex justify-end gap-3 mt-auto pt-6">
        <button
          class="px-5 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          @click="router.back()"
        >
          Voltar
        </button>

        <button
          class="px-5 py-2 rounded-xl text-white font-medium transition hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer bg-purple-600 hover:bg-purple-700"
          @click="router.push(`/users/${user.id}/edit`)"
        >
          Editar
        </button>
      </div>
    </div>
  </div>
</template>
