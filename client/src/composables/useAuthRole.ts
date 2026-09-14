import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AuthRole } from '../types/auth'

export function useAuthRole() {
  const route = useRoute()
  const router = useRouter()

  const role = computed<AuthRole>(() => (route.query.role === 'sitter' ? 'sitter' : 'owner'))
  const isOwner = computed(() => role.value === 'owner')

  const loginTo = computed(() =>
    role.value === 'sitter' ? { path: '/login', query: { role: 'sitter' } } : '/login',
  )
  const registerTo = computed(() =>
    role.value === 'sitter' ? { path: '/register', query: { role: 'sitter' } } : '/register',
  )

  function setRole(next: AuthRole) {
    const query = { ...route.query }
    if (next === 'owner') delete query.role
    else query.role = 'sitter'
    void router.replace({ query })
  }

  return { role, isOwner, loginTo, registerTo, setRole }
}
