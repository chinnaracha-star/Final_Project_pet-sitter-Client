<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetSitterStore, type SitterStatus, type AdminTab } from '../../stores/adminPetSitter'

const store = useAdminPetSitterStore()

const setApprovalStatus = (status: Exclude<SitterStatus, 'Waiting for approve'>) => {
	if (store.selectedSitterId !== null) store.setApprovalStatus(store.selectedSitterId, status)
}
</script>

<template>
	<div class="flex min-h-screen bg-[#f7f8fc] text-[#30343f]">
		<AdminSidebar />

		<main class="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7">
			<div class="mx-auto max-w-[1000px]">
				<header class="flex flex-wrap items-center justify-between gap-4 px-1">
					<div class="flex min-w-0 items-center gap-3">
						<RouterLink to="/admin/petsitters" class="text-xl leading-none text-[#9298ab]" aria-label="Back to pet sitters">‹</RouterLink>
						<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ store.selectedSitter?.name ?? 'Jane Maison' }}</h1>
						<span class="flex shrink-0 items-center gap-1.5 text-[10px] text-[#ef82b6]">
							<span class="h-1 w-1 rounded-full bg-current"></span>
							{{ store.selectedSitter?.status ?? 'Waiting for approve' }}
						</span>
					</div>

					<div class="flex items-center gap-3">
						<button type="button" class="rounded-full bg-[#fff4ef] px-5 py-2 text-[9px] font-semibold text-[#f47755] transition hover:bg-[#ffe6dc]" @click="setApprovalStatus('Rejected')">Reject</button>
						<button type="button" class="rounded-full bg-[#ff7040] px-5 py-2 text-[9px] font-semibold text-white transition hover:bg-[#f25d2c]" @click="setApprovalStatus('Approved')">Approve</button>
					</div>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Sitter profile sections">
					<button
						v-for="tab in (['Profile', 'Booking', 'Reviews', 'Report'] as AdminTab[])"
						:key="tab"
						type="button"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="store.activeTab === tab ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="store.activeTab = tab"
					>
						{{ tab }}
					</button>
				</nav>

				<section v-if="store.activeTab === 'Profile'" class="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:p-7">
					<div class="grid gap-7 md:grid-cols-[125px_minmax(0,1fr)]">
						<img src="/image/dog2.jpg" alt="Jane Maison" class="mx-auto h-32 w-32 rounded-full object-cover md:mx-0" />

						<div class="rounded-md bg-[#fbfbfd] p-4 sm:p-5">
							<dl class="grid gap-4 sm:grid-cols-2">
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Full Name</dt><dd class="mt-1 text-[10px]">Jane Maison</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Experience</dt><dd class="mt-1 text-[10px]">1.5 Years</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Phone</dt><dd class="mt-1 text-[10px]">099 996 0090</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">ID Number</dt><dd class="mt-1 text-[10px]">1122 21 236 8566</dd></div>
								<div><dt class="text-[11px] font-semibold text-[#aeb4c7]">Date of Birth</dt><dd class="mt-1 text-[10px]">12 March 1996</dd></div>
							</dl>
							<div class="mt-5">
								<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Introduction</h2>
								<p class="mt-1 max-w-3xl text-[10px] leading-[1.55] text-[#30343f]">Hello there! My name is Jane Maison, and I'm your friendly and reliable pet sitter in Senanikom, Bangkok. I am passionate about animals and have dedicated myself to ensuring the well-being and happiness of your furry, feathery, and hoppy companions. With a big heart and a spacious house, I provide a safe and loving environment for cats, dogs, and rabbits while you're away.</p>
							</div>
						</div>
					</div>

					<div class="mt-6 rounded-md bg-[#fbfbfd] p-4 sm:p-5">
						<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Pet sitter name (Trade Name)</h2>
						<p class="mt-1 text-[10px]">Happy House!</p>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Pet type</h2>
						<div class="mt-2 flex gap-2">
							<span class="rounded-full border border-[#6fe0bc] px-2.5 py-0.5 text-[9px] text-[#20c995]">Dog</span>
							<span class="rounded-full border border-[#f3a5c5] px-2.5 py-0.5 text-[9px] text-[#ed83b0]">Cat</span>
							<span class="rounded-full border border-[#ffb493] px-2.5 py-0.5 text-[9px] text-[#f58d68]">Rabbit</span>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Services</h2>
						<div class="mt-2 space-y-2 text-[10px] leading-[1.5]">
							<p>🐱 Cat Sitting: Cats are fascinating creatures, and I take joy in catering to their independent yet affectionate nature.</p>
							<p>🐶 Dog Sitting: Dogs are not just pets; they're family. From energetic walks and playtime to soothing belly rubs, I provide a balanced and fun experience for dogs of all sizes and breeds.</p>
							<p>🐰 Rabbit Sitting: With their adorable antics and gentle personalities, rabbits require a special kind of care. I am well-versed in providing them with a comfortable environment, appropriate diet, and ample playtime.</p>
						</div>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">My Place</h2>
						<p class="mt-1 text-[10px] leading-[1.5]">My residence is a spacious house nestled in the serene neighborhood of Senanikom. Your beloved pets will have plenty of room to roam and explore while enjoying a safe and secure environment. I have designated areas for play, relaxation, and sleep, ensuring your pets feel comfortable and at ease throughout their stay.</p>

						<h2 class="mt-6 text-[11px] font-semibold text-[#aeb4c7]">Image Gallery</h2>
						<div class="mt-2 grid max-w-[520px] grid-cols-3 gap-2">
							<img src="/image/dog1.jpg" alt="Pet care gallery" class="aspect-[1.35] w-full object-cover" />
							<img src="/image/dog2.jpg" alt="Pet care gallery" class="aspect-[1.35] w-full object-cover" />
							<img src="/image/cat.jpg" alt="Pet care gallery" class="aspect-[1.35] w-full object-cover" />
						</div>
					</div>

					<div class="mt-6 rounded-md bg-[#fbfbfd] p-4 sm:p-5">
						<h2 class="text-[11px] font-semibold text-[#aeb4c7]">Address</h2>
						<p class="mt-1 text-[10px]">33/445 Phaholyothin 41 Rd.<br />Senanikom, Chatuchak, Bangkok, 10400</p>
						<div class="relative mt-5 h-52 overflow-hidden rounded-md bg-[#e5e9e9] bg-[linear-gradient(25deg,transparent_48%,#f4b93c_49%,#f4b93c_51%,transparent_52%),linear-gradient(105deg,transparent_45%,#f7c746_46%,#f7c746_48%,transparent_49%),linear-gradient(160deg,transparent_50%,#b7dbbf_51%,#b7dbbf_64%,transparent_65%)] bg-[length:220px_170px,180px_200px,240px_220px]">
							<div class="absolute left-[52%] top-[48%] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ff7040] shadow-lg">
								<img src="/image/Map_Pin_Selected.svg" alt="Location" class="h-6 w-6 brightness-0 invert" />
							</div>
						</div>
					</div>
				</section>

				<section v-else class="rounded-xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(40,45,70,0.02)]">
					<h2 class="text-sm font-semibold text-[#30343f]">{{ store.activeTab }}</h2>
					<p class="mt-2 text-xs text-[#9298ab]">No {{ store.activeTab.toLowerCase() }} records are available in this mock view.</p>
				</section>
			</div>
		</main>
	</div>
</template>
