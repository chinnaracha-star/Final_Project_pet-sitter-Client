import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' }, // dev1 can replace this with Landing Page
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/sitter/profile', component: () => import('../views/SitterProfileView.vue') },
    { path: '/admin/petsitters', component: () => import('../views/Admin/AdminPetSitterView.vue') },
    { path: '/admin/petsitters/profile', component: () => import('../views/Admin/AdminPetSitterView-Profile.vue') },
    { path: '/admin/petsitters/profile/reject', component: () => import('../views/Admin/AdminPetSitterView-Profile-RejectComfirmation.vue') }
  ],
})
