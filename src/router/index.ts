import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/LandingView.vue') },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/search', component: () => import('../views/SitterSearchView.vue') },
    { path: '/sitters/:id', component: () => import('../views/PublicSitterProfileView.vue') },
    { path: '/owner/profile', component: () => import('../views/OwnerProfileView.vue'), meta: { owner: true } },
    { path: '/owner/pets', component: () => import('../views/OwnerPetsView.vue'), meta: { owner: true } },
    { path: '/owner/pets/new', component: () => import('../views/OwnerPetFormView.vue'), meta: { owner: true } },
    { path: '/owner/pets/:id', component: () => import('../views/OwnerPetFormView.vue'), meta: { owner: true } },
    { path: '/owner/bookings', component: () => import('../views/OwnerBookingsView.vue'), meta: { owner: true } },
    { path: '/owner/password', component: () => import('../views/OwnerPasswordView.vue'), meta: { owner: true } },
    { path: '/sitter/profile', component: () => import('../views/SitterProfileView.vue') },
    { path: '/sitter/bookings', component: () => import('../views/SitterBookingListView.vue') },
    { path: '/sitter/messages', component: () => import('../views/SitterMessagesView.vue') },
    { path: '/sitter/bookings/:id', component: () => import('../views/SitterBookingDetailView.vue') },
    { path: '/sitter/calendar', component: () => import('../views/SitterCalendarView.vue') },
    { path: '/sitter/payout', component: () => import('../views/SitterPayoutView.vue') },
    { path: '/booking', component: () => import('../views/BookingView.vue') },
    { path: '/booking/pet', component: () => import('../views/BookingView.vue') },
    { path: '/booking/information', component: () => import('../views/BookingView.vue') },
    { path: '/booking/payment', component: () => import('../views/BookingView.vue') },
    { path: '/booking/thank-you', component: () => import('../views/BookingView.vue') },
    { path: '/booking/:sitterId', component: () => import('../views/BookingView.vue') },
    { path: '/sitters', redirect: '/search' },
    { path: '/admin/petsitters', alias: '/admin/sitters', component: () => import('../views/Admin/AdminPetSitterView.vue') },
    { path: '/admin/owners', component: () => import('../views/Admin/AdminPetOwnerView.vue') },
      { path: '/admin/owners/profile/:id', component: () => import('../views/Admin/AdminPetOwnerView-Profile.vue') },
    { path: '/admin/owners/profile/:id/ban', component: () => import('../views/Admin/AdminPetOwnerView-Profile-Ban.vue') },
    { path: '/admin/owners/profile/:id/unban', component: () => import('../views/Admin/AdminPetOwnerView-Profile-Unban.vue') },
      { path: '/admin/owners/profile/:id/pets', component: () => import('../views/Admin/AdminPetOwnerView-Pet.vue') },
    { path: '/admin/owners/profile/:id/pets/:petId', component: () => import('../views/Admin/AdminPetOwnerView-Pet-Detail.vue') },
    { path: '/admin/owners/profile/:id/pets/:petId/suspend', component: () => import('../views/Admin/AdminPetOwnerView-Pet-Suspend.vue') },
    { path: '/admin/owners/profile/reviews', component: () => import('../views/Admin/AdminPetOwnerView-Review.vue') },
    { path: '/admin/map', component: () => import('../views/Admin/MapView.vue') },
    { path: '/admin/reports', component: () => import('../views/Admin/AdminPetSitterView-Report.vue') },
    { path: '/admin/reports/:id', component: () => import('../views/Admin/AdminPetSitterView-Report-Detail.vue') },
    { path: '/admin/petsitters/profile', component: () => import('../views/Admin/AdminPetSitterView-Profile.vue') },
    { path: '/admin/petsitters/profile/booking', component: () => import('../views/Admin/AdminPetSitterView-Booking.vue') },
    { path: '/admin/petsitters/profile/reviews', component: () => import('../views/Admin/AdminPetSitterView-Review.vue') },
    { path: '/admin/petsitters/profile/reject', component: () => import('../views/Admin/AdminPetSitterView-Profile-RejectConfirmation.vue') },
  ],
})

router.beforeEach(to => {
  if (!to.meta.owner) return true
  // Allow creating new pet without login if coming from booking flow for testing
  if (to.path === '/owner/pets/new' && String(to.query.redirect || '').includes('/booking')) {
    return true
  }
  const auth = useAuthStore()
  if (auth.isOwnerLoggedIn) return true
  return { path: '/login' }
})

export default router
