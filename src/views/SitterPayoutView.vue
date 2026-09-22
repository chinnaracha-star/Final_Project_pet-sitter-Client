<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import SitterDemoNotice from '../components/sitter/SitterDemoNotice.vue'
import { getPayout, updateBankAccount, type BankAccount, type Payout } from '../services/sitterPayout'
import { isSitterDemo } from '../services/sitterDemo'
import { extractAccountNumber } from '../utils/accountNumberOcr'

// Add or edit supported banks here. The code is saved with the selected name.
const bankOptions = [
  { name: 'SCB', code: '014' },
  { name: 'Kasikornbank', code: '004' },
  { name: 'Krung Thai Bank', code: '006' },
  { name: 'Bangkok Bank', code: '002' },
  { name: 'Bank of Ayudhya', code: '025' },
  { name: 'TMBThanachart Bank', code: '011' },
]

const payout = ref<Payout | null>(null)
const editing = ref(false)
const confirming = ref(false)
const busy = ref(false)
const error = ref('')
const ocrStatus = ref('')
const ocrProgress = ref(0)
const bank = ref<BankAccount>({ bankName: '', accountName: '', accountNumber: '', bankCode: '', bookBankImageUrl: '' })
const money = (amount: number) => `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB`
const date = (value: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)).replace(/ (\d{4})$/, ', $1')

async function load() {
  error.value = ''
  try {
    payout.value = await getPayout()
    bank.value = { ...payout.value.bankAccount }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load payout'
  }
}

function selectBank() {
  bank.value.bankCode = bankOptions.find(option => option.name === bank.value.bankName)?.code || ''
}

async function readAccountNumber(file: File) {
  ocrStatus.value = 'Reading account number from image...'
  ocrProgress.value = 0
  try {
    const { createWorker, PSM } = await import('tesseract.js')
    const worker = await createWorker('eng', 1, {
      logger: message => {
        if (message.status === 'recognizing text') ocrProgress.value = Math.round(message.progress * 100)
      },
    })
    try {
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789- ',
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      })
      const { data: { text } } = await worker.recognize(file)
      const accountNumber = extractAccountNumber(text)
      if (accountNumber) {
        bank.value.accountNumber = accountNumber
        ocrStatus.value = 'Account number detected. Please verify it before updating.'
      } else {
        ocrStatus.value = 'No account number detected. Please enter it manually.'
      }
    } finally {
      await worker.terminate()
    }
  } catch {
    ocrStatus.value = 'OCR could not read this image. Please enter the account number manually.'
  }
}

function image(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const maxSize = isSitterDemo() ? 1_000_000 : 5_000_000
  if (!file.type.startsWith('image/') || file.size > maxSize) {
    error.value = `Use an image no larger than ${isSitterDemo() ? 1 : 5} MB`
    return
  }
  error.value = ''
  const reader = new FileReader()
  reader.onload = () => (bank.value.bookBankImageUrl = String(reader.result))
  reader.readAsDataURL(file)
  void readAccountNumber(file)
}

async function save() {
  busy.value = true
  error.value = ''
  try {
    bank.value = await updateBankAccount(bank.value)
    if (payout.value) payout.value.bankAccount = { ...bank.value }
    editing.value = false
    confirming.value = false
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to update bank account'
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <SitterPageShell>
    <main class="page">
      <SitterDemoNotice />
      <p v-if="error" class="error">{{ error }}</p>
      <template v-if="payout">
        <section v-if="!editing">
          <h1>Payout Option</h1>
          <div class="summary">
            <article class="summary-card">
              <span class="summary-label"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M10 5.8v8.4M12 7.6H9.1a1.5 1.5 0 0 0 0 3h1.8a1.5 1.5 0 0 1 0 3H8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Total Earning</span>
              <strong>{{ money(payout.totalEarning) }}</strong>
            </article>
            <button class="summary-card bank-card" type="button" aria-label="Edit bank account" @click="editing = true">
              <span class="summary-label"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="5" width="15" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 8h15M14 11.5h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Bank Account</span>
              <span class="bank-value">{{ payout.bankAccount.bankName ? `${payout.bankAccount.bankName} *${payout.bankAccount.accountNumber.replace(/\D/g, '').slice(-3)}` : 'Not configured' }}</span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </div>
          <div class="table"><table><thead><tr><th>Date</th><th>From</th><th>Transaction No.</th><th>Amount</th></tr></thead><tbody><tr v-for="t in payout.transactions" :key="t.bookingId"><td>{{ date(t.completedAt) }}</td><td>{{ t.ownerName }}</td><td>{{ t.transactionNo || '—' }}</td><td class="amount">{{ money(t.amount) }}</td></tr><tr v-if="!payout.transactions.length"><td colspan="4">No payout transactions.</td></tr></tbody></table></div>
        </section>

        <form v-else @submit.prevent="confirming = true">
          <div class="form-head">
            <h1><button class="back" type="button" aria-label="Back" @click="editing = false">‹</button>Payout Option</h1>
            <button class="primary" type="submit">Update</button>
          </div>
          <section class="form-card">
            <label class="caption">Book Bank Image*</label>
            <label class="upload">
              <img v-if="bank.bookBankImageUrl" :src="bank.bookBankImageUrl" alt="Book bank preview" />
              <span v-else>Upload book bank image</span>
              <span class="plus" aria-hidden="true">＋</span>
              <input type="file" accept="image/*" @change="image" />
            </label>
            <div class="fields">
              <label>Bank Account Number*<input v-model.trim="bank.accountNumber" inputmode="numeric" required /><small v-if="ocrStatus" class="ocr-status">{{ ocrStatus }}<span v-if="ocrProgress > 0 && ocrProgress < 100"> {{ ocrProgress }}%</span></small></label>
              <label>Account Name*<input v-model.trim="bank.accountName" required /></label>
              <label>Bank Name*
                <select v-model="bank.bankName" required @change="selectBank">
                  <option disabled value="">Select bank</option>
                  <option v-for="option in bankOptions" :key="option.code" :value="option.name">{{ option.name }}</option>
                </select>
              </label>
            </div>
          </section>
        </form>
      </template>

      <div v-if="confirming" class="overlay"><div class="modal"><h2>Payout Confirmation</h2><p>Are you sure to change your account?</p><button class="secondary" @click="confirming = false">Cancel</button><button class="primary" :disabled="busy" @click="save">Yes, I'm sure</button></div></div>
    </main>
  </SitterPageShell>
</template>

<style scoped>
.page{padding:32px;background:#f7f8fc;min-height:calc(100svh - 78px)}h1{margin:0;font-size:24px}.summary{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:22px}.summary article,.table,.form-card{background:#fff;border-radius:12px;padding:24px}.summary small,.summary strong{display:block}.summary strong{font-size:28px}.summary button,.primary{float:right;border:0;border-radius:999px;background:#ff7037;color:#fff;padding:10px 22px}.table{margin-top:20px;overflow:auto}table{width:100%;border-collapse:collapse;min-width:650px}th{background:#111;color:#fff;text-align:left}th,td{padding:14px;border-bottom:1px solid #eef0f7}.amount{color:#22c07f}.form-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.form-head h1{display:flex;align-items:center;gap:10px}.back{border:0;background:transparent;color:#82869b;font-size:30px;line-height:1}.form-card{padding:36px}.caption{display:block;margin-bottom:12px;font-size:14px}.upload{position:relative;display:grid;place-items:center;width:440px;height:410px;background:#eef0fb;border-radius:5px;cursor:pointer;color:#82869b}.upload img{max-width:82%;max-height:94%;object-fit:contain}.upload input{display:none}.plus{position:absolute;right:10px;bottom:10px;display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:#fff2ec;color:#ff7037;font-size:24px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:28px 32px;margin-top:52px}.fields label{display:grid;gap:9px;font-size:14px}.fields input,.fields select{height:44px;padding:0 12px;border:1px solid #dde0ef;border-radius:6px;background:#fff;color:#30343f}.fields label:last-child{grid-column:1}.ocr-status{color:#82869b;line-height:1.4}.overlay{position:fixed;inset:0;background:#0009;display:grid;place-items:center;z-index:20}.modal{background:#fff;border-radius:12px;padding:28px;text-align:center}.modal button{float:none}.modal .secondary{border:1px solid #ff7037;border-radius:999px;background:#fff;color:#ff7037;padding:10px 22px}.error{color:#e91010}@media(max-width:760px){.page{padding:20px}.summary,.fields{grid-template-columns:1fr}.form-card{padding:20px}.upload{width:100%;height:300px}.fields{margin-top:32px}.fields label:last-child{grid-column:auto}}
</style>

<style scoped>
.page { background: #f8f9fd; }
.page h1 { font-size: 24px; font-weight: 700; line-height: 32px; }
.summary { gap: 20px; margin-top: 20px; }
.summary-card, .summary article { display: flex; align-items: center; justify-content: space-between; min-width: 0; min-height: 78px; padding: 0 24px; border: 0; border-radius: 12px; background: #fff; color: #111; font-size: 16px; }
.summary-label { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
.summary-label svg { width: 20px; height: 20px; color: #30343f; }
.summary-card strong { font-size: 16px; font-weight: 400; white-space: nowrap; }
.summary .bank-card { width: 100%; padding: 0 24px; border-radius: 12px; background: #fff; color: #111; text-align: left; }
.bank-value { margin-left: auto; color: #e2480a; white-space: nowrap; }
.chevron { margin-left: 20px; color: #adb1c6; font-size: 28px; line-height: 1; }
.table { margin-top: 20px; padding: 0; overflow: auto; border-radius: 12px; }
table { min-width: 650px; table-layout: fixed; font-size: 14px; color: #111; }
th { height: 50px; padding: 0 16px; background: #050505; font-size: 14px; font-weight: 400; }
td { height: 76px; padding: 0 16px; border-bottom: 1px solid #dde0ef; }
tr:last-child td { border-bottom: 0; }
th:nth-child(1), td:nth-child(1) { width: 21.5%; }
th:nth-child(2), td:nth-child(2) { width: 21.5%; }
th:nth-child(3), td:nth-child(3) { width: 32%; }
th:last-child, td:last-child { text-align: right; }
.amount { color: #00b66d; }
@media (max-width: 760px) {
  .summary { grid-template-columns: 1fr; }
}
</style>
