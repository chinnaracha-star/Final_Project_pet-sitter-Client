import { currentSitterId } from './sitterApproval'
import { isSitterDemo } from './sitterDemo'
import { useSitterBookingsStore } from '../stores/sitterBookings'
import { demoPayoutTransactions } from './sitterDemoLogic'

export type BankAccount = { bankName: string; accountName: string; accountNumber: string; bankCode: string; bookBankImageUrl: string }
export type Payout = { totalEarning: number; bankAccount: BankAccount; transactions: { bookingId: number; completedAt: string; ownerName: string; transactionNo: string | null; amount: number }[] }

const storageKey = 'petSitterDemoBankV1'
const defaultBank: BankAccount = { bankName: 'SCB', accountName: 'Jane Maison', accountNumber: '123-456-7890', bankCode: '014', bookBankImageUrl: '' }

function demoBank(): BankAccount {
  try {
    return { ...defaultBank, ...JSON.parse(localStorage.getItem(storageKey) || '{}') as Partial<BankAccount> }
  } catch {
    return { ...defaultBank }
  }
}

async function request<T>(path: string, options: RequestInit = {}) {
  const id = currentSitterId()
  if (!id) throw new Error('Server integration pending. Select “Use demo data” to preview payout.')
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', 'X-User-Id': id, ...options.headers } })
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail || `Request failed (${response.status})`)
  return response.json() as Promise<T>
}

export function getPayout(): Promise<Payout> {
  if (!isSitterDemo()) return request<Payout>('/api/sitter/payout')
  const transactions = demoPayoutTransactions(useSitterBookingsStore().bookings)
  return Promise.resolve({ totalEarning: transactions.reduce((sum, item) => sum + item.amount, 0), bankAccount: demoBank(), transactions })
}

export function updateBankAccount(bank: BankAccount): Promise<BankAccount> {
  if (!isSitterDemo()) return request<BankAccount>('/api/sitter/payout/bank-account', { method: 'PUT', body: JSON.stringify(bank) })
  try {
    localStorage.setItem(storageKey, JSON.stringify(bank))
    return Promise.resolve({ ...bank })
  } catch {
    return Promise.reject(new Error('Could not save demo bank account in this browser. Try a smaller image.'))
  }
}
