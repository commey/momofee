import { ref, watch } from 'vue'

// Singleton state
const isDark = ref(true)

// Helper to update DOM
const updateHtmlClass = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Global watcher - runs once when module is imported
watch(isDark, (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light')
  updateHtmlClass()
})

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    // Ensure DOM is in sync on init
    updateHtmlClass()
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
