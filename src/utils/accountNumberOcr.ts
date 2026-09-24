export function extractAccountNumber(text: string): string {
  return (text.match(/\d[\d\s.\-–—]{7,}\d/g) || [])
    .map(value => value.trim().replace(/[.–—]/g, '-').replace(/\s+/g, ''))
    .filter(value => {
      const digits = value.replace(/\D/g, '').length
      return digits >= 9 && digits <= 15
    })
    .sort((a, b) => {
      const score = (value: string) => (value.includes('-') ? 5 : 0) - Math.abs(10 - value.replace(/\D/g, '').length)
      return score(b) - score(a)
    })[0] || ''
}
