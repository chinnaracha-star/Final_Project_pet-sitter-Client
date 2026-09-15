<script setup lang="ts">
import {
  Navbar,
  Footer,
  HeroSection,
  ServicesSection,
  BenefitsSection,
  CtaBanner,
  type SearchFilterState,
} from '../components'

function handleSearch(filter: SearchFilterState) {
  // เมื่อเพื่อนทำหน้าค้นหา/รายการเสร็จ สามารถเปิดใช้งาน router.push ไปยัง path นั้นได้
  console.log('Landing Page Search Query:', filter)
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
