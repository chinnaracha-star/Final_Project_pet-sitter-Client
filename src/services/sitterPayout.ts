import { api } from './http'

export type BankAccount = { bankName: string; accountName: string; accountNumber: string; bankCode: string; bookBankImageUrl: string }
export type Payout = { totalEarning: number; bankAccount: BankAccount; transactions: { bookingId: number; completedAt: string; ownerName: string; transactionNo: string | null; amount: number }[] }

export function getPayout(): Promise<Payout> {
  return api<Payout>('/api/sitter/payout')
}

export function updateBankAccount(bank: BankAccount): Promise<BankAccount> {
  return api<BankAccount>('/api/sitter/payout/bank-account', { method: 'PUT', body: JSON.stringify(bank) })
}

export function uploadBookBankImage(file: File): Promise<{ url: string }> {
  const body = new FormData()
  body.append('file', file)
  return api<{ url: string }>('/api/sitter/payout/book-bank-image', { method: 'POST', body })
}
