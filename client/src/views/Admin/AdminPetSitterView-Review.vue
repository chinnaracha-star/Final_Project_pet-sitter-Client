<script setup lang="ts">
import AdminSidebar from '../../components/AdminSidebar.vue'
import { useAdminPetSitterStore, type AdminTab } from '../../stores/adminPetSitter'

const store = useAdminPetSitterStore()
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

				<section class="rounded-xl bg-white p-8 text-center shadow-[0_1px_3px_rgba(40,45,70,0.02)]">
					<h2 class="text-sm font-semibold text-[#30343f]">Reviews</h2>
					<p class="mt-2 text-xs text-[#9298ab]">No review records are available in this mock view.</p>
				</section>
			</div>
		</main>
	</div>
</template>
