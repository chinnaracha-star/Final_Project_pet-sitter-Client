import type { ApprovalStatus } from '../../services/sitterApproval'

export type ProfileUiState = {
  displayStatus: ApprovalStatus
  showFullProfile: boolean
  readOnly: boolean
  canSubmit: boolean
  actionText: string
}

export function getProfileUiState(
  status: ApprovalStatus,
  rejectionReason: string,
): ProfileUiState {
  const rejectedFirstRound = status === 'Unverified' && Boolean(rejectionReason)

  if (status === 'Waiting for verify') {
    return {
      displayStatus: status,
      showFullProfile: false,
      readOnly: true,
      canSubmit: false,
      actionText: '',
    }
  }

  if (status === 'Waiting for approve') {
    return {
      displayStatus: status,
      showFullProfile: true,
      readOnly: true,
      canSubmit: false,
      actionText: '',
    }
  }

  if (status === 'Approved') {
    return {
      displayStatus: status,
      showFullProfile: true,
      readOnly: false,
      canSubmit: true,
      actionText: 'Update Profile',
    }
  }

  if (status === 'Verified' || status === 'Rejected') {
    return {
      displayStatus: status,
      showFullProfile: true,
      readOnly: false,
      canSubmit: true,
      actionText: 'Request for approval',
    }
  }

  return {
    displayStatus: rejectedFirstRound ? 'Rejected' : status,
    showFullProfile: false,
    readOnly: false,
    canSubmit: true,
    actionText: 'Request for verification',
  }
}
