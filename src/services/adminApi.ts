import axios from 'axios'
import { supabase } from '../lib/supabase'
import { apiUrl } from './http'

export const adminApi = axios.create({ baseURL: apiUrl('/api') })

adminApi.interceptors.request.use(async config => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
