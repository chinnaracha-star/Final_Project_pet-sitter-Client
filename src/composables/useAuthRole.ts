import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AuthRole } from '../types/auth'

export function useAuthRole() {
  const route = useRoute()
  const router = useRouter()

  const role = computed<AuthRole>(() =>
    route.query.role === 'pet-sitter' || route.query.role === 'sitter' ? 'pet-sitter' : 'owner',
  )
  const isOwner = computed(() => role.value === 'owner')

  const loginTo = computed(() =>
    role.value === 'pet-sitter' ? { path: '/login', query: { role: 'pet-sitter' } } : '/login',
  )
  const registerTo = computed(() =>
    role.value === 'pet-sitter' ? { path: '/register', query: { role: 'pet-sitter' } } : '/register',
  )

  function setRole(next: AuthRole) {
    const query = { ...route.query }
    if (next === 'owner') delete query.role
    else query.role = 'pet-sitter'
    void router.replace({ query })
  }

  return { role, isOwner, loginTo, registerTo, setRole }
}
