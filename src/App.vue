<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/services/api';

const router = useRouter();
const route = useRoute();

/* STATE */
const user = ref(null);

// desktop collapse
const isCollapsed = ref(false);

// mobile menu
const isMobileOpen = ref(false);

/* TIMER AUTO LOGOUT */
let inactivityTimer = null;
const INACTIVITY_TIME = 10 * 60 * 1000;

/* USER */
function loadUser() {
  const storedUser = localStorage.getItem('user');
  user.value = storedUser ? JSON.parse(storedUser) : null;
}

function handleUserUpdate() {
  loadUser();
}

/* SIDEBAR */
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

function toggleMobileMenu() {
  isMobileOpen.value = !isMobileOpen.value;
}

function closeMobileMenu() {
  isMobileOpen.value = false;
}

/* LOGOUT */
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

/* AUTO LOGOUT */
function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    logout();
  }, INACTIVITY_TIME);
}

function setupActivityListeners() {
  window.addEventListener('mousemove', resetInactivityTimer);
  window.addEventListener('keydown', resetInactivityTimer);
  window.addEventListener('click', resetInactivityTimer);
  window.addEventListener('scroll', resetInactivityTimer);
}

function removeActivityListeners() {
  window.removeEventListener('mousemove', resetInactivityTimer);
  window.removeEventListener('keydown', resetInactivityTimer);
  window.removeEventListener('click', resetInactivityTimer);
  window.removeEventListener('scroll', resetInactivityTimer);
}

/* RESPONSIVE */
function checkScreenSize() {
  const width = window.innerWidth;

  if (width < 1024) {
    isCollapsed.value = false;
  }

  if (width < 768) {
    isMobileOpen.value = false;
  }
}

/* fechar menu ao trocar rota no mobile */
watch(
  () => route.path,
  () => {
    if (window.innerWidth < 768) {
      isMobileOpen.value = false;
    }
  }
);

/* LIFECYCLE */
onMounted(() => {
  loadUser();

  window.addEventListener('user-updated', handleUserUpdate);
  window.addEventListener('resize', checkScreenSize);

  checkScreenSize();

  setupActivityListeners();
  resetInactivityTimer();
});

onUnmounted(() => {
  window.removeEventListener('user-updated', handleUserUpdate);
  window.removeEventListener('resize', checkScreenSize);

  removeActivityListeners();

  if (inactivityTimer) clearTimeout(inactivityTimer);
});
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- OVERLAY MOBILE -->
    <div
      v-if="isMobileOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="closeMobileMenu"
    ></div>

    <!-- SIDEBAR -->
    <aside
      v-if="route.path !== '/login'"
      :class="[
        'text-white flex flex-col py-5 transition-all duration-300 border-r border-white/10 z-50',
        'fixed lg:static top-0 left-0 h-full',

        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',

        isCollapsed ? 'lg:w-20' : 'lg:w-64',
      ]"
      style="background: linear-gradient(to bottom, #7c3aed, #5b21b6)"
    >
      <!-- HEADER SIDEBAR -->
      <div class="flex items-center justify-between px-4 mb-8">
        <h2 v-if="!isCollapsed" class="text-lg font-semibold tracking-wide">
          SESAB
        </h2>

        <!-- botão collapse desktop -->
        <button
          class="hidden lg:block p-2 rounded-lg hover:bg-white/10"
          @click="toggleSidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 transition-transform duration-300"
            :class="isCollapsed ? 'rotate-180' : ''"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <!-- NAV -->
      <nav class="flex flex-col gap-1 px-2">
        <router-link
          to="/users"
          @click="closeMobileMenu"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition relative"
          :class="route.path === '/users' ? 'bg-white/15' : 'hover:bg-white/10'"
        >
          👥
          <span v-if="!isCollapsed" class="text-sm font-medium">Usuários</span>
          <span
            v-if="route.path === '/users'"
            class="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r-full"
          ></span>
        </router-link>

        <router-link
          to="/profiles"
          @click="closeMobileMenu"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition relative"
          :class="
            route.path === '/profiles' ? 'bg-white/15' : 'hover:bg-white/10'
          "
        >
          👤
          <span v-if="!isCollapsed" class="text-sm font-medium">Perfis</span>
          <span
            v-if="route.path === '/profiles'"
            class="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r-full"
          ></span>
        </router-link>

        <router-link
          to="/addresses/create"
          @click="closeMobileMenu"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition relative"
          :class="
            route.path === '/addresses/create'
              ? 'bg-white/15'
              : 'hover:bg-white/10'
          "
        >
          📍
          <span v-if="!isCollapsed" class="text-sm font-medium">Endereços</span>
          <span
            v-if="route.path === '/addresses/create'"
            class="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r-full"
          ></span>
        </router-link>
      </nav>
    </aside>

    <!-- MAIN -->
    <div class="flex-1 flex flex-col lg:ml-0">
      <!-- HEADER -->
      <nav
        v-if="route.path !== '/login'"
        class="text-white px-4 lg:px-6 py-3 flex justify-between items-center shadow-md"
        style="background: linear-gradient(to right, #7c3aed, #5b21b6)"
      >
        <!-- LEFT -->
        <div class="flex items-center gap-2">
          <!-- BOTÃO MOBILE MENU -->
          <button
            class="cursor-pointer lg:hidden p-2 rounded-lg hover:bg-white/20 active:scale-95 transition"
            @click="toggleMobileMenu"
          >
            ☰
          </button>
        </div>

        <!-- RIGHT -->
        <button
          @click="logout"
          class="cursor-pointer flex items-center gap-2 bg-white/20 hover:bg-white/30 active:scale-95 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>

          <span>Sair</span>
        </button>
      </nav>

      <!-- CONTENT -->
      <main class="p-4 lg:p-6 overflow-y-auto flex-1">
        <router-view />
      </main>
    </div>
  </div>
</template>
