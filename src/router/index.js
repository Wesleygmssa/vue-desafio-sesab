import { createRouter, createWebHistory } from 'vue-router';
import Users from '../views/User/Users.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },

  {
    path: '/login',
    component: Login,
  },

  {
    path: '/users',
    component: Users,
    meta: { requiresAuth: true },
  },

  {
    path: '/users/create',
    component: () => import('../views/User/CreateUser.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/users/:id',
    component: () => import('../views/User/UserDetails.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/users/:id/edit',
    component: () => import('../views/User/EditUser.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

//  PROTEÇÃO DE ROTAS
router.beforeEach((to) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    return '/login';
  }

  if (to.path === '/login' && token) {
    return '/users';
  }
});

export default router;
