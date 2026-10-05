import assert from 'node:assert/strict'
import test from 'node:test'
import { isLocalAdminLogin } from '../src/services/localAdminLogin.ts'

test('temporary admin login only accepts the local development credentials', () => {
  assert.equal(isLocalAdminLogin(true, 'localhost', 'adminnick@gmail.com', 'iamadmin555'), true)
  assert.equal(isLocalAdminLogin(true, '127.0.0.1', ' ADMINNICK@gmail.com ', 'iamadmin555'), true)
  assert.equal(isLocalAdminLogin(false, 'localhost', 'adminnick@gmail.com', 'iamadmin555'), false)
  assert.equal(isLocalAdminLogin(true, 'example.com', 'adminnick@gmail.com', 'iamadmin555'), false)
  assert.equal(isLocalAdminLogin(true, 'localhost', 'adminnick@gmail.com', 'wrong'), false)
  assert.equal(isLocalAdminLogin(true, 'localhost', 'other@example.com', 'iamadmin555'), false)
})
