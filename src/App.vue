<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/services/api';

const router = useRouter();
const route = useRoute();

const user = ref(null);

function loadUser() {
  const storedUser = localStorage.getItem('user');
  user.value = storedUser ? JSON.parse(storedUser) : null;
}

function handleUserUpdate() {
  loadUser();
}

onMounted(() => {
  loadUser();
  window.addEventListener('user-updated', handleUserUpdate);
});

onUnmounted(() => {
  window.removeEventListener('user-updated', handleUserUpdate);
});

// logout
async function logout() {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error(error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.dispatchEvent(new Event('user-updated'));

    router.push('/login');
  }
}
</script>
<template>
  <div class="flex h-screen bg-gray-100">
    <!-- SIDEBAR -->
    <aside
      v-if="route.path !== '/login'"
      class="w-64 text-white flex flex-col p-5"
      style="background: linear-gradient(to bottom, #3448eb, #1f2fd6)"
    >
      <h2 class="text-xl font-bold mb-8">SESAB</h2>

      <nav class="flex flex-col gap-3">
        <router-link
          to="/users"
          class="px-3 py-2 rounded-lg transition"
          :class="route.path === '/users' ? 'bg-white/20' : 'hover:bg-white/10'"
        >
          👥 Lista de Usuários
        </router-link>

        <router-link
          to="/perfil"
          class="px-3 py-2 rounded-lg transition"
          :class="
            route.path === '/perfil' ? 'bg-white/20' : 'hover:bg-white/10'
          "
        >
          👤 Cadastro de Perfil
        </router-link>

        <router-link
          to="/enderecos"
          class="px-3 py-2 rounded-lg transition"
          :class="
            route.path === '/enderecos' ? 'bg-white/20' : 'hover:bg-white/10'
          "
        >
          📍 Cadastro de Endereços
        </router-link>
      </nav>
    </aside>

    <!-- MAIN -->
    <div class="flex-1 flex flex-col">
      <!-- NAVBAR -->
      <nav
        v-if="route.path !== '/login'"
        class="text-white px-6 py-3 flex justify-between items-center shadow-md"
        style="background: linear-gradient(to right, #3448eb, #1f2fd6)"
      >
        <span class="font-semibold"></span>

        <!-- <span class="text-sm opacity-90"> Olá, {{ user?.nome }} </span> -->
        <div class="flex items-center gap-4">
          <button
            @click="logout"
            class="cursor-pointer bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition"
          >
            Sair
          </button>
        </div>
      </nav>

      <!-- CONTENT -->
      <main class="p-6 overflow-y-auto flex-1">
        <router-view />
      </main>
    </div>
  </div>
</template>
