import assert from 'node:assert/strict'
import test from 'node:test'
import { parseApiError } from '../src/services/parseApiError.ts'

test('reads Spring problem details', async () => {
  const response = new Response(JSON.stringify({ detail: 'This phone number is already registered' }), {
    status: 409,
    headers: { 'content-type': 'application/problem+json' },
  })

  assert.equal(await parseApiError(response), 'This phone number is already registered')
})

test('shows plain-text security and gateway errors', async () => {
  const response = new Response('Invalid CORS request', {
    status: 403,
    headers: { 'content-type': 'text/plain;charset=UTF-8' },
  })

  assert.equal(await parseApiError(response), 'Invalid CORS request')
})

test('does not expose an HTML error page in the UI', async () => {
  const response = new Response('<html>gateway error</html>', {
    status: 503,
    headers: { 'content-type': 'text/html' },
  })

  assert.equal(await parseApiError(response), 'Request failed (503)')
})
