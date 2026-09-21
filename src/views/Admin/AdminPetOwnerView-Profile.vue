<script setup lang="ts">
import { ref } from 'vue'
import AdminSidebar from '../../components/AdminSidebar.vue'

type OwnerTab = 'Profile' | 'Pets' | 'Reviews'

const activeTab = ref<OwnerTab>('Profile')
const isBanned = ref(false)

const owner = {
	name: 'John Wick',
	email: 'johnwicklovedogs@dogorg.com',
	phone: '099 996 6734',
	idNumber: '1122 21 236 8654',
	dateOfBirth: '2 Sep 1964',
	avatar: '/image/dog1.jpg',
}

const handleBanUser = () => {
	isBanned.value = true
}
</script>

<template>
	<div class="flex min-h-screen bg-[#f7f8fc] text-[#30343f]">
		<AdminSidebar />

		<main class="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7">
			<div class="mx-auto max-w-[1000px]">
				<header class="flex items-center gap-3 px-1">
					<RouterLink to="/admin/owners" class="text-xl leading-none text-[#9298ab]" aria-label="Back to pet owners">‹</RouterLink>
					<h1 class="truncate text-[15px] font-bold text-[#252733]">{{ owner.name }}</h1>
				</header>

				<nav class="mt-4 flex gap-2" aria-label="Pet owner sections">
					<button
						v-for="tab in (['Profile', 'Pets', 'Reviews'] as OwnerTab[])"
						:key="tab"
						type="button"
						class="rounded-t-md px-5 py-3 text-[11px] font-semibold transition"
						:class="activeTab === tab ? 'bg-white text-[#ff7040]' : 'bg-[#e2e5f1] text-[#858b9f] hover:bg-[#d9ddeb]'"
						@click="activeTab = tab"
					>
						{{ tab }}
					</button>
				</nav>

				<section class="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(40,45,70,0.02)] sm:p-7">
					<div v-if="activeTab === 'Profile'" class="grid gap-6 md:grid-cols-[145px_minmax(0,1fr)]">
						<img :src="owner.avatar" :alt="owner.name" class="mx-auto h-[140px] w-[140px] rounded-full object-cover md:mx-0" />

						<div class="rounded-md bg-[#fbfbfd] px-4 py-4 sm:px-5 sm:py-4">
							<dl class="grid gap-5 text-[10px]">
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">Pet Owner Name</dt>
									<dd class="mt-1 text-[#30343f]">{{ owner.name }}</dd>
								</div>
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">Email</dt>
									<dd class="mt-1 break-all text-[#30343f]">{{ owner.email }}</dd>
								</div>
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">Phone</dt>
									<dd class="mt-1 text-[#30343f]">{{ owner.phone }}</dd>
								</div>
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">ID Number</dt>
									<dd class="mt-1 text-[#30343f]">{{ owner.idNumber }}</dd>
								</div>
								<div>
									<dt class="text-[11px] font-semibold text-[#adb3c8]">Date of Birth</dt>
									<dd class="mt-1 text-[#30343f]">{{ owner.dateOfBirth }}</dd>
								</div>
							</dl>
						</div>

						<div class="md:col-span-2 flex justify-end">
							<button v-if="!isBanned" type="button" class="text-[10px] font-semibold text-[#ff7040] transition hover:text-[#f25d2c]" @click="handleBanUser">Ban This User</button>
							<span v-else class="text-[10px] font-semibold text-[#f04444]">User Banned</span>
						</div>
					</div>

					<div v-else class="flex min-h-[260px] items-center justify-center text-center">
						<p class="text-xs text-[#9298ab]">No {{ activeTab.toLowerCase() }} records are available in this mock view.</p>
					</div>
				</section>
			</div>
		</main>
	</div>
</template>
