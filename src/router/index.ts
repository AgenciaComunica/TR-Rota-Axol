import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import InspectionListPage from '../views/InspectionListPage.vue';
import InspectionSyncPage from '../views/InspectionSyncPage.vue';
import InspectionStartPage from '../views/InspectionStartPage.vue';
import LoginPage from '../views/LoginPage.vue';
import MenuActionPage from '../views/MenuActionPage.vue';
import ResetPasswordPage from '../views/ResetPasswordPage.vue';
import TransformersSyncPage from '../views/TransformersSyncPage.vue';
import UserProfilePage from '../views/UserProfilePage.vue';
import { isAuthenticated } from '@/services/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/menu/sync-transformers',
    name: 'TransformersSync',
    component: TransformersSyncPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/menu/inspection',
    name: 'InspectionList',
    component: InspectionListPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/menu/sync-inspections',
    name: 'InspectionSync',
    component: InspectionSyncPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/inspection/:id',
    name: 'InspectionStart',
    component: InspectionStartPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/menu/:action',
    name: 'MenuAction',
    component: MenuActionPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfilePage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/profile/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordPage,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return '/login';
  }

  if (to.path === '/login' && isAuthenticated()) {
    return '/home';
  }

  return true;
});

export default router;
