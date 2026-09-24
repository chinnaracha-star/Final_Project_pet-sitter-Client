<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SitterPageShell from '../components/sitter/SitterPageShell.vue'
import { getSitterBookings, type BookingStatus, type SitterBooking } from '../services/sitterBookings'
const router=useRouter(), anchor=ref(new Date()), bookings=ref<SitterBooking[]>([]), query=ref(''), error=ref(''), loading=ref(false)
const allStatuses:BookingStatus[]=['waiting_confirm','waiting_service','in_service','success','cancelled'], selected=ref<BookingStatus[]>([...allStatuses])
const iso=(d:Date)=>d.toLocaleDateString('sv-SE',{timeZone:'Asia/Bangkok'})
const days=computed(()=>{const d=new Date(anchor.value);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return x})})
const visible=computed(()=>bookings.value.filter(b=>selected.value.includes(b.status)))
async function load(){loading.value=true;error.value='';try{bookings.value=await getSitterBookings(query.value,iso(days.value[0]),iso(days.value[6]))}catch(e){error.value=e instanceof Error?e.message:'Unable to load calendar'}finally{loading.value=false}}
function move(n:number){const d=new Date(anchor.value);d.setDate(d.getDate()+n*7);anchor.value=d;load()}
function today(){anchor.value=new Date();load()}
onMounted(load)
</script>
<template><SitterPageShell><main class="page"><div class="top"><h1>Calendar</h1><form @submit.prevent="load"><input v-model.trim="query" placeholder="Search..." aria-label="Search calendar"/></form></div><div class="tools"><button @click="today">Today</button><button @click="move(-1)">‹</button><b>{{days[0].toLocaleDateString('en-GB',{day:'numeric',month:'short'})}} – {{days[6].toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}}</b><button @click="move(1)">›</button><label v-for="s in allStatuses" :key="s"><input v-model="selected" type="checkbox" :value="s"/> {{s.replaceAll('_',' ')}}</label></div><p v-if="loading" role="status">Loading calendar...</p><p v-if="error" class="error" role="alert">{{error}}</p>
<div class="calendar"><div v-for="day in days" :key="iso(day)" class="day"><header><small>{{day.toLocaleDateString('en-US',{weekday:'short'})}}</small><b>{{day.getDate()}}</b></header><button v-for="b in visible.filter(x=>x.startDate===iso(day))" :key="b.id" class="event" :class="b.status" @click="router.push(`/sitter/bookings/${b.id}`)"><b>{{b.startTime.slice(0,5)}}</b>{{b.owner.name}}</button></div></div></main></SitterPageShell></template>
<style scoped>
.page{padding:32px;background:#f7f8fc;min-height:calc(100svh - 78px)}.top,.tools{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.top{justify-content:space-between}.top input{padding:10px;border:1px solid #dde0ef;border-radius:8px}.tools{margin:18px 0}.tools button{border:1px solid #ff7037;background:#fff;color:#ff7037;border-radius:999px;padding:8px 14px}.tools label{font-size:12px}.calendar{display:grid;grid-template-columns:repeat(7,minmax(120px,1fr));min-height:620px;background:#fff;border:1px solid #e5e7f0;overflow:auto}.day{border-right:1px solid #e5e7f0;padding:8px;background:repeating-linear-gradient(#fff 0 59px,#eef0f7 60px)}.day header{display:flex;justify-content:space-between;margin-bottom:16px}.event{display:flex;flex-direction:column;width:100%;margin:8px 0;padding:12px;border:1px solid currentColor;border-radius:4px;text-align:left;background:#fff}.waiting_confirm{color:#ee82c1}.waiting_service{color:#ff9c66}.in_service{color:#7ccfff}.success{color:#22c07f}.cancelled,.error{color:#e91010}@media(max-width:760px){.page{padding:20px}.calendar{grid-template-columns:repeat(7,140px)}}
</style>
