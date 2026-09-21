<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import { getPayout, updateBankAccount, type BankAccount, type Payout } from '../services/sitterPayout'
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

async function load() {
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
  if (!file.type.startsWith('image/') || file.size > 5_000_000) {
    error.value = 'Use an image no larger than 5 MB'
    return
  }
  const reader = new FileReader()
  reader.onload = () => (bank.value.bookBankImageUrl = String(reader.result))
  reader.readAsDataURL(file)
  void readAccountNumber(file)
}

async function save() {
  busy.value = true
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
      <p v-if="error" class="error">{{ error }}</p>
      <template v-if="payout">
        <section v-if="!editing">
          <h1>Payout Option</h1>
          <div class="summary">
            <article><small>Total Earning</small><strong>฿{{ payout.totalEarning.toLocaleString() }}</strong></article>
            <article><small>Bank Account</small><b>{{ payout.bankAccount.bankName || 'Not configured' }}</b><button @click="editing = true">Edit bank ›</button></article>
          </div>
          <div class="table"><table><thead><tr><th>Date</th><th>From</th><th>Transaction No.</th><th>Amount</th></tr></thead><tbody><tr v-for="t in payout.transactions" :key="t.bookingId"><td>{{ new Date(t.completedAt).toLocaleDateString('en-GB') }}</td><td>{{ t.ownerName }}</td><td>{{ t.transactionNo || '—' }}</td><td class="amount">฿{{ t.amount.toLocaleString() }}</td></tr><tr v-if="!payout.transactions.length"><td colspan="4">No payout transactions.</td></tr></tbody></table></div>
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
