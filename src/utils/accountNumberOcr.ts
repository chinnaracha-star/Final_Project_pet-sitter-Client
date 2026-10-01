const ACCOUNT_PATTERNS = [
  /(?<!\d)(\d{3})-(\d)-(\d{5})-(\d)(?!\d)/,
  /(?<!\d)(\d{3})-(\d{3})-(\d{4})(?!\d)/,
  /(?<!\d)(\d{10})(?!\d)/,
  /(?<!\d)(\d{12})(?!\d)/,
]

export function extractAccountNumber(text: string): string {
  const normalized = text.replace(/[.–—]/g, '-').replace(/[^\d-]+/g, ' ')
  const tight = normalized.replace(/\s+/g, '').replace(/-+/g, '-')
  for (const source of [tight, normalized.replace(/\s+/g, '')]) {
    for (const pattern of ACCOUNT_PATTERNS) {
      const match = source.match(pattern)
      if (match) return match[0]
    }
  }
  return ''
}

export function formatAccountNumber(accountNumber: string, bankName = ''): string {
  const digits = accountNumber.replace(/\D/g, '')
  if (digits.length !== 10 || accountNumber.includes('-')) return accountNumber
  if (bankName === 'SCB') return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`
}
