const ACCOUNT_PATTERNS = [
  /(?<!\d)(\d{3})-(\d)-(\d{5})-(\d)(?!\d)/,
  /(?<!\d)(\d{3})-(\d{3})-(\d{4})(?!\d)/,
  /(?<!\d)(\d{10})(?!\d)/,
  /(?<!\d)(\d{12})(?!\d)/,
]

function accountFromDigits(run: string) {
  if (run.length === 10 || run.length === 12) return run
  if (run.length > 12 && run.length <= 16 && run.slice(-12).startsWith('0')) return run.slice(-12)
  return ''
}

export function extractAccountNumber(text: string): string {
  const normalized = text
    .replace(/(?<=\d)[OoQ]|[OoQ](?=\d)/g, '0')
    .replace(/(?<=\d)[Il|]|[Il|](?=\d)/g, '1')
    .replace(/[.–—]/g, '-')
    .replace(/[^\d-]+/g, ' ')
  const tight = normalized.replace(/\s+/g, '').replace(/-+/g, '-')
  for (const source of [tight, normalized.replace(/\s+/g, '')]) {
    for (const pattern of ACCOUNT_PATTERNS) {
      const match = source.match(pattern)
      if (match && (match[0].includes('-') || match[0].length === 10 || match[0].length === 12)) return match[0]
    }
    for (const run of source.match(/\d{10,16}/g) || []) {
      const account = accountFromDigits(run)
      if (account) return account
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
