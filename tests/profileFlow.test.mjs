import assert from 'node:assert/strict'
import test from 'node:test'
import { getProfileUiState } from '../src/components/sitter/profileFlow.ts'

test('maps every approval state to the expected sitter profile UI', () => {
  assert.deepEqual(getProfileUiState('Unverified', ''), {
    displayStatus: 'Unverified',
    showFullProfile: false,
    readOnly: false,
    canSubmit: true,
    actionText: 'Request for verification',
  })
  assert.equal(getProfileUiState('Unverified', 'Please fix your ID').displayStatus, 'Rejected')
  assert.equal(getProfileUiState('Unverified', 'Please fix your ID').showFullProfile, false)
  assert.equal(getProfileUiState('Waiting for verify', '').readOnly, true)
  assert.equal(getProfileUiState('Waiting for verify', '').showFullProfile, false)
  assert.equal(getProfileUiState('Verified', '').showFullProfile, true)
  assert.equal(getProfileUiState('Waiting for approve', '').readOnly, true)
  assert.equal(getProfileUiState('Waiting for approve', '').showFullProfile, true)
  assert.equal(getProfileUiState('Approved', '').actionText, 'Update Profile')
  assert.equal(getProfileUiState('Rejected', 'Please add photos').showFullProfile, true)
  assert.equal(getProfileUiState('Rejected', 'Please add photos').canSubmit, true)
})
