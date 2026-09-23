// Central place to configure the backend API port/base URL.
// Change VITE_API_PORT in your .env file to switch ports across the whole app.
export const API_PORT = import.meta.env.VITE_API_PORT || '8082'
export const API_BASE_URL = `http://localhost:${API_PORT}/api`
