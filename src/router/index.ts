import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/LandingView.vue') },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/search', component: () => import('../views/SitterSearchView.vue') },
    { path: '/owner/profile', component: () => import('../views/OwnerProfileView.vue') },
    { path: '/sitter/profile', component: () => import('../views/SitterProfileView.vue') },
    { path: '/sitters', component: () => import('../views/FindSitterView.vue') },
    { path: '/admin/petsitters', alias: '/admin/sitters', component: () => import('../views/Admin/AdminPetSitterView.vue') },
    { path: '/admin/petsitters/profile', component: () => import('../views/Admin/AdminPetSitterView-Profile.vue') },
    { path: '/admin/petsitters/profile/reject', component: () => import('../views/Admin/AdminPetSitterView-Profile-RejectComfirmation.vue') },
  ],
})
