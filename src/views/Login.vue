<script setup>
import { ref } from 'vue';
import { api } from '@/services/api';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function login() {
  error.value = '';
  loading.value = true;

  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    router.push('/users');
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao logar';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 flex overflow-hidden">
    <!-- IMAGEM -->
    <div
      class="hidden md:flex w-1/2 h-full bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-10"
    >
      <div class="text-center text-white">
        <h1 class="text-3xl lg:text-4xl font-bold mb-4">Bem-vindo 👋</h1>
        <p class="text-base lg:text-lg opacity-90">
          Sistema de gerenciamento de usuários desenvolvido como parte de um
          desafio técnico para vaga na Seab. Construído com Vue.js, Tailwind CSS
          e PHP Laravel, o projeto demonstra habilidades em desenvolvimento full
          stack, organização de código e construção de interfaces modernas. A
          aplicação permite login seguro e acesso a uma dashboard intuitiva,
          onde é possível criar, editar, visualizar e gerenciar usuários de
          forma rápida, simples e eficiente, com foco em usabilidade e
          performance.
        </p>
      </div>
    </div>

    <!-- LOGIN -->
    <div
      class="w-full md:w-1/2 h-full flex items-center justify-center bg-gray-100 px-6"
    >
      <div class="w-full max-w-md">
        <h2
          class="text-2xl lg:text-3xl font-bold mb-6 text-gray-800 text-center"
        >
          Faça login na sua conta
        </h2>

        <div class="space-y-4">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 transition"
          />

          <input
            v-model="password"
            type="password"
            placeholder="Senha"
            class="w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 transition"
            @keyup.enter="login"
          />

          <button
            @click="login"
            :disabled="loading"
            class="cursor-pointer w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50"
          >
            <span v-if="loading">Entrando...</span>
            <span v-else>Entrar</span>
          </button>

          <div class="mt-4 p-4 rounded-xl border bg-gray-50 text-center">
            <p class="text-sm text-gray-500 mb-2">Usuário e senha para teste</p>

            <div class="space-y-1">
              <div class="text-base font-semibold text-gray-700">
                admin@teste.com
              </div>

              <div class="text-base text-gray-600">
                Senha: <span class="font-medium text-gray-800">senha123</span>
              </div>
            </div>
          </div>

          <p v-if="error" class="text-red-500 text-sm text-center">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
