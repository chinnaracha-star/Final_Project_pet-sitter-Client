import assert from 'node:assert/strict'
import test from 'node:test'
import { extractAccountNumber } from '../src/utils/accountNumberOcr.ts'

test('extracts the most likely bank account number', () => {
  assert.equal(extractAccountNumber('Date 21-09-2026 Account 11333-45-543-444'), '11333-45-543-444')
  assert.equal(extractAccountNumber('Account number: 1234567890'), '1234567890')
  assert.equal(extractAccountNumber('no account here'), '')
})
