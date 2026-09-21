import { currentSitterId } from './sitterApproval'
export type BankAccount={bankName:string;accountName:string;accountNumber:string;bankCode:string;bookBankImageUrl:string}
export type Payout={totalEarning:number;bankAccount:BankAccount;transactions:{bookingId:number;completedAt:string;ownerName:string;transactionNo:string|null;amount:number}[]}
async function request<T>(path:string,options:RequestInit={}){const id=currentSitterId();if(!id)throw new Error('Set petSitterUserId in localStorage or add ?userId=UUID');const r=await fetch(path,{...options,headers:{'Content-Type':'application/json','X-User-Id':id,...options.headers}});if(!r.ok)throw new Error((await r.json().catch(()=>null))?.detail||`Request failed (${r.status})`);return r.json() as Promise<T>}
export const getPayout=()=>request<Payout>('/api/sitter/payout')
export const updateBankAccount=(bank:BankAccount)=>request<BankAccount>('/api/sitter/payout/bank-account',{method:'PUT',body:JSON.stringify(bank)})
