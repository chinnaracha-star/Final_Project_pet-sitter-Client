import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/LandingView.vue') },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/search', component: () => import('../views/SitterSearchView.vue') },
    { path: '/owner/profile', component: () => import('../views/OwnerProfileView.vue'), meta: { owner: true } },
    { path: '/owner/pets', component: () => import('../views/OwnerPetsView.vue'), meta: { owner: true } },
    { path: '/owner/pets/new', component: () => import('../views/OwnerPetFormView.vue'), meta: { owner: true } },
    { path: '/owner/pets/:id', component: () => import('../views/OwnerPetFormView.vue'), meta: { owner: true } },
    { path: '/owner/bookings', component: () => import('../views/OwnerBookingsView.vue'), meta: { owner: true } },
    { path: '/owner/password', component: () => import('../views/OwnerPasswordView.vue'), meta: { owner: true } },
    { path: '/sitter/profile', component: () => import('../views/SitterProfileView.vue') },
    { path: '/sitters', redirect: '/search' },
    { path: '/admin/petsitters', alias: '/admin/sitters', component: () => import('../views/Admin/AdminPetSitterView.vue') },
    { path: '/admin/petsitters/profile', component: () => import('../views/Admin/AdminPetSitterView-Profile.vue') },
    { path: '/admin/petsitters/profile/reject', component: () => import('../views/Admin/AdminPetSitterView-Profile-RejectComfirmation.vue') },
  ],
})

router.beforeEach(to => {
  if (!to.meta.owner) return true
  const auth = useAuthStore()
  if (auth.isOwnerLoggedIn) return true
  return { path: '/login' }
})

export default router
