import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' }, // dev1 can replace this with Landing Page
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/owner/profile', component: () => import('../views/OwnerProfileView.vue') },
    { path: '/sitter/profile', component: () => import('../views/SitterProfileView.vue') },
  ],
})
