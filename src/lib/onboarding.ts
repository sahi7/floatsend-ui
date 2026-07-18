const FIRST_SEND_PREFIX = 'fs_first_send_'

export function getFirstSendDone(orgId: string): boolean {
  try {
    return localStorage.getItem(`${FIRST_SEND_PREFIX}${orgId}`) === '1'
  } catch {
    return false
  }
}

export function setFirstSendDone(orgId: string) {
  try {
    localStorage.setItem(`${FIRST_SEND_PREFIX}${orgId}`, '1')
  } catch {
    /* ignore */
  }
}

const SKIP_PREFIX = 'fs_onboarding_skip_'

export function getOnboardingSkipped(orgId: string): boolean {
  try {
    return localStorage.getItem(`${SKIP_PREFIX}${orgId}`) === '1'
  } catch {
    return false
  }
}

export function setOnboardingSkipped(orgId: string) {
  try {
    localStorage.setItem(`${SKIP_PREFIX}${orgId}`, '1')
  } catch {
    /* ignore */
  }
}
