import assert from 'node:assert/strict'
import test from 'node:test'
import { accountFromWords, extractAccountNumber, formatAccountNumber } from '../src/utils/accountNumberOcr.ts'

test('keeps a Kasikorn account number and drops the dashed noise around it', () => {
  assert.equal(extractAccountNumber('A/C NO. 013-8-23988-8'), '013-8-23988-8')
  assert.equal(extractAccountNumber('O13 - 8 - 23988 - 8'), '013-8-23988-8')
  assert.equal(extractAccountNumber('11-8-4--8-23914---42-14-4'), '')
  assert.equal(extractAccountNumber('966020124355098'), '020124355098')
  assert.equal(extractAccountNumber('no account here'), '')
  assert.equal(formatAccountNumber('0138239888', 'Kasikornbank'), '013-8-23988-8')
  assert.equal(formatAccountNumber('1234567890', 'SCB'), '123-456-7890')
  assert.equal(accountFromWords([
    { text: '1700', confidence: 26, x0: 0, y0: 0, x1: 1, y1: 1 },
    { text: '020124355098', confidence: 96, x0: 0, y0: 0, x1: 1, y1: 1 },
    { text: '2143135', confidence: 60, x0: 0, y0: 0, x1: 1, y1: 1 },
  ]), '020124355098')
  assert.equal(accountFromWords([{ text: 'Tianforg_0-31873-5', confidence: 0, x0: 0, y0: 0, x1: 1, y1: 1 }]), '')
})
