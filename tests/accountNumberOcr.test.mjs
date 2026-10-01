import assert from 'node:assert/strict'
import test from 'node:test'
import { extractAccountNumber, formatAccountNumber } from '../src/utils/accountNumberOcr.ts'

test('keeps a Kasikorn account number and drops the dashed noise around it', () => {
  assert.equal(extractAccountNumber('A/C NO. 013-8-23988-8'), '013-8-23988-8')
  assert.equal(extractAccountNumber('11-8-4--8-23914---42-14-4'), '')
  assert.equal(extractAccountNumber('Account number: 1234567890'), '1234567890')
  assert.equal(extractAccountNumber('no account here'), '')
  assert.equal(formatAccountNumber('0138239888', 'Kasikornbank'), '013-8-23988-8')
  assert.equal(formatAccountNumber('1234567890', 'SCB'), '123-456-7890')
})
