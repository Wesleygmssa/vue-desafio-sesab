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
        'text-white flex flex-col py-5 transition-all duration-300 border-r border-white/10',
        isCollapsed ? 'w-20' : 'w-64',
      ]"
      style="background: linear-gradient(to bottom, #3448eb, #1f2fd6)"
    >
      <!-- HEADER -->
      <div class="flex items-center justify-between px-4 mb-8">
        <h2 v-if="!isCollapsed" class="text-lg font-semibold tracking-wide">
          SESAB
        </h2>

        <button
          @click="toggleSidebar"
          class="cursor-pointer hover:bg-white/10 active:scale-95 p-2 rounded-lg transition"
          :aria-label="isCollapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 transition-transform duration-300"
            :class="isCollapsed ? 'rotate-180' : ''"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <!-- NAV -->
      <nav class="flex flex-col gap-1 px-2">
        <!-- USERS -->
        <router-link
          to="/users"
          class="group flex items-center gap-3 px-3 py-2 rounded-lg transition relative"
          :class="route.path === '/users' ? 'bg-white/15' : 'hover:bg-white/10'"
        >
          <div class="text-lg">👥</div>

          <span v-if="!isCollapsed" class="text-sm font-medium">
            Usuários
          </span>

          <!-- indicador ativo -->
          <span
            v-if="route.path === '/users'"
            class="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r-full"
          ></span>
        </router-link>

        <!-- PERFIL -->
        <div
          class="flex items-center gap-3 px-3 py-2 rounded-lg opacity-40 cursor-not-allowed"
        >
          <div class="text-lg">👤</div>
          <span v-if="!isCollapsed" class="text-sm">Perfis</span>
        </div>

        <!-- ENDEREÇOS -->
        <div
          class="flex items-center gap-3 px-3 py-2 rounded-lg opacity-40 cursor-not-allowed"
        >
          <div class="text-lg">📍</div>
          <span v-if="!isCollapsed" class="text-sm">Endereços</span>
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
            class="flex items-center gap-2 cursor-pointer bg-white/20 hover:bg-white/30 active:scale-95 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <!-- Ícone logout -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>

            <span>Sair</span>
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
