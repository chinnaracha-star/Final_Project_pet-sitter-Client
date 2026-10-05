const key = 'petSitterUseMock'

export function isSitterDemo() {
  if (new URLSearchParams(location.search).get('demo') === 'true') {
    localStorage.setItem(key, 'true')
  }
  return localStorage.getItem(key) === 'true'
}

export function setSitterDemo(enabled: boolean) {
  if (enabled) localStorage.setItem(key, 'true')
  else localStorage.removeItem(key)
  location.reload()
}

export function resetSitterDemo() {
  localStorage.removeItem('petSitterDemoBookingsV1')
  localStorage.removeItem('petSitterDemoBankV1')
  location.reload()
}
