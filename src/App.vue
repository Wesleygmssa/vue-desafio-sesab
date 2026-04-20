<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/services/api';

const router = useRouter();
const route = useRoute();

const user = ref(null);

// desktop collapse
const isCollapsed = ref(false);

// mobile menu
const isMobileOpen = ref(false);

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

function toggleMobileMenu() {
  isMobileOpen.value = !isMobileOpen.value;
}

function closeMobileMenu() {
  isMobileOpen.value = false;
}

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

async function logout() {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error(error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- SIDEBAR -->
    <aside
      v-if="route.path !== '/login'"
      :class="[
        'text-white flex flex-col p-5 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
      ]"
      style="background: linear-gradient(to bottom, #3448eb, #1f2fd6)"
    >
      <!-- HEADER -->
      <div class="flex items-center justify-between mb-8">
        <h2 v-if="!isCollapsed" class="text-xl font-bold">SESAB</h2>

        <button
          @click="toggleSidebar"
          class="text-white hover:bg-white/20 p-2 rounded-lg cursor-pointer"
        >
          ☰
        </button>
      </div>

      <!-- NAV -->
      <nav class="flex flex-col gap-3">
        <router-link
          to="/users"
          class="px-3 py-2 rounded-lg transition flex items-center gap-2"
          :class="route.path === '/users' ? 'bg-white/20' : 'hover:bg-white/10'"
        >
          👥
          <span v-if="!isCollapsed">Lista de Usuários</span>
        </router-link>

        <div
          class="px-3 py-2 rounded-lg opacity-50 cursor-not-allowed pointer-events-none flex items-center gap-2"
        >
          👤
          <span v-if="!isCollapsed">Cadastro de Perfil</span>
        </div>

        <div
          class="px-3 py-2 rounded-lg opacity-50 cursor-not-allowed pointer-events-none flex items-center gap-2"
        >
          📍
          <span v-if="!isCollapsed">Cadastro de Endereços</span>
        </div>
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
