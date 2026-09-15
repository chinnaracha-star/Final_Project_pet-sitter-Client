<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Navbar,
  Footer,
  HeroSection,
  ServicesSection,
  BenefitsSection,
  CtaBanner,
  type SearchFilterState,
} from '../components'

const router = useRouter()

function handleSearch(filter: SearchFilterState) {
  void filter
  void router.push('/search')
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#161616] flex flex-col selection:bg-[#FF6525] selection:text-white">
    <!-- Main Top Navigation -->
    <Navbar />

    <!-- Main Landing Page Content -->
    <main class="flex-1 flex flex-col">
      <!-- 1. Hero & Floating Search Filter Section -->
      <HeroSection @search="handleSearch" />

      <!-- 2. Services Section ("Your Pets, Our Priority: Perfect Care, Anytime, Anywhere.") -->
      <ServicesSection />

      <!-- 3. Benefits & Value Proposition Section (Connect, Better, Calling) -->
      <BenefitsSection />

      <!-- 4. CTA Banner ("Perfect Pet Sitter For Your Pet") -->
      <CtaBanner />
    </main>

    <!-- 5. Footer -->
    <Footer />
  </div>
</template>
