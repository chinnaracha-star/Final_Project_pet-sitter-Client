import { currentSitterId } from './sitterApproval'
export type BankAccount={bankName:string;accountName:string;accountNumber:string;bankCode:string;bookBankImageUrl:string}
export type Payout={totalEarning:number;bankAccount:BankAccount;transactions:{bookingId:number;completedAt:string;ownerName:string;transactionNo:string|null;amount:number}[]}
const mockPayout:Payout={totalEarning:5500,bankAccount:{bankName:'SCB',accountName:'Jane Maison',accountNumber:'123-456-7890',bankCode:'014',bookBankImageUrl:''},transactions:[
  {bookingId:104,completedAt:new Date(Date.now()-86400000).toISOString(),ownerName:'Jane Wilson',transactionNo:'MOCK-104',amount:1500},
  {bookingId:99,completedAt:new Date(Date.now()-604800000).toISOString(),ownerName:'John Wick',transactionNo:'MOCK-099',amount:4000},
]}
const useMock=()=>localStorage.getItem('petSitterUseMock')==='true'||!currentSitterId()
async function request<T>(path:string,options:RequestInit={}){const id=currentSitterId();if(!id)throw new Error('Set petSitterUserId in localStorage or add ?userId=UUID');const r=await fetch(path,{...options,headers:{'Content-Type':'application/json','X-User-Id':id,...options.headers}});if(!r.ok)throw new Error((await r.json().catch(()=>null))?.detail||`Request failed (${r.status})`);return r.json() as Promise<T>}
export const getPayout=()=>useMock()?Promise.resolve(mockPayout):request<Payout>('/api/sitter/payout')
export const updateBankAccount=(bank:BankAccount)=>{if(useMock()){mockPayout.bankAccount={...bank};return Promise.resolve(mockPayout.bankAccount)}return request<BankAccount>('/api/sitter/payout/bank-account',{method:'PUT',body:JSON.stringify(bank)})}
