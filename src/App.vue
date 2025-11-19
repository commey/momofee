<script setup>
import { onMounted } from 'vue'
import FeeForm from './components/FeeForm.vue'
import { useTheme } from './composables/useTheme'

const { isDark, toggleTheme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors duration-500"
    :class="isDark ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-900' : 'bg-gradient-to-br from-orange-100 via-rose-100 to-white'"
  >
    <!-- Theme Toggle -->
    <button 
      @click="toggleTheme"
      class="absolute top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110"
      :class="isDark ? 'bg-white/10 text-yellow-300 hover:bg-white/20' : 'bg-white/80 text-orange-500 hover:bg-white'"
    >
      <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>

    <!-- Background decoration -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
        :class="isDark ? 'bg-purple-500/50' : 'bg-orange-300'"
      ></div>
      <div class="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
        :class="isDark ? 'bg-yellow-500/50' : 'bg-rose-300'"
      ></div>
      <div class="absolute bottom-[-20%] left-[20%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
        :class="isDark ? 'bg-pink-500/50' : 'bg-purple-300'"
      ></div>
    </div>

    <div class="w-full max-w-md z-10">
      <FeeForm />
    </div>
  </div>
</template>

<style>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
