export function isLocalAdminLogin(development: boolean, hostname: string, email: string, password: string) {
  return development
    && ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname)
    && email.trim().toLowerCase() === 'adminnick@gmail.com'
    && password === 'iamadmin555'
}
