<script setup>
import { ref, onMounted, computed } from 'vue'

const rules = ref({})
const network = ref('mtn')
const amount = ref('')
const fee = ref(null)
const loading = ref(true)
const error = ref(null)

const networks = [
  { id: 'mtn', name: 'MTN MoMo', image: `${import.meta.env.BASE_URL}images/mtn.webp` },
  { id: 'telecel', name: 'Telecel Cash', image: `${import.meta.env.BASE_URL}images/telecel.webp` },
  { id: 'airteltigo', name: 'AirtelTigo', image: `${import.meta.env.BASE_URL}images/at.webp` }
]

onMounted(async () => {
  try {
    // In a real app we might fetch this, but for now we import it or fetch relative
    // Since we are using Vite, we can import the JSON directly if configured, 
    // or fetch it if it's in public. 
    // The prompt asked to "fetch or import". Importing is easier with Vite.
    const response = await import('../data/fees.json')
    rules.value = response.default || response
    
    // Load last calculation from localStorage
    const saved = localStorage.getItem('momo-calculator-last')
    if (saved) {
      const parsed = JSON.parse(saved)
      network.value = parsed.network || 'mtn'
      amount.value = parsed.amount || ''
      calculate()
    }
    loading.value = false
  } catch (e) {
    error.value = "Failed to load fee rules."
    loading.value = false
    console.error(e)
  }
})

const calculate = () => {
  if (!amount.value || amount.value <= 0) {
    fee.value = null
    return
  }

  const val = parseFloat(amount.value)
  const netRules = rules.value[network.value]

  if (!netRules) return

  let calculatedFee = 0

  if (Array.isArray(netRules)) {
    // Tiered rules (MTN)
    const rule = netRules.find(r => val >= r.min && val <= r.max)
    if (rule) {
      if (rule.fee !== undefined) {
        calculatedFee = rule.fee
      } else if (rule.percent !== undefined) {
        calculatedFee = (val * rule.percent) / 100
      }
    } else {
        // Fallback if out of range, though max is high.
        // Assuming max tier applies or no fee if not found? 
        // Let's assume if > max, use the last rule's logic if it's percentage, or just 0.
        // The prompt says max 1000000.
        calculatedFee = 0 
    }
  } else {
    // Percentage rules (Vodafone/AirtelTigo)
    calculatedFee = (val * netRules.percent) / 100
    if (calculatedFee < netRules.minFee) {
      calculatedFee = netRules.minFee
    }
  }

  fee.value = calculatedFee
  
  // Save to localStorage
  localStorage.setItem('momo-calculator-last', JSON.stringify({
    network: network.value,
    amount: amount.value
  }))
}

const totalDeduction = computed(() => {
  if (fee.value === null) return null
  return parseFloat(amount.value) + fee.value
})

const amountReceived = computed(() => {
    // Usually sender pays fee, so receiver gets full amount if sender has enough.
    // But prompt says: "Calculate fee and display the amount the customer receives after fee."
    // This implies a withdrawal scenario or sending where fee is deducted from sent amount?
    // "amount the customer receives after fee" -> usually means: Sent 100, Fee 1, Receiver gets 99?
    // OR: Customer wants to withdraw 100. Fee is 1. They get 100? No, they pay 100+1?
    // Let's display both: Fee and "Amount to Send/Withdraw" vs "Final Amount".
    // Let's stick to: Input = Transaction Amount. 
    // Result = Fee. 
    // And "Amount after fee" = Amount - Fee.
    if (fee.value === null) return null
    return parseFloat(amount.value) - fee.value
})

</script>

<template>
  <div class="backdrop-blur-lg border rounded-3xl shadow-2xl overflow-hidden animate-fade-in transition-colors duration-500"
    :class="['bg-white/60 border-white/40', 'dark:bg-white/10 dark:border-white/20']"
  >
    <!-- Header -->
    <div class="p-6 text-center border-b transition-colors duration-500"
      :class="['bg-white/50 border-white/20', 'dark:bg-black/20 dark:border-white/10']"
    >
      <h1 class="font-display text-2xl font-bold tracking-wide transition-colors duration-500"
        :class="['text-slate-800', 'dark:text-white']"
      >MoMo Fee Calculator</h1>
      <p class="text-sm font-semibold mt-1 transition-colors duration-500 text-black dark:text-blue-200"
      >Check fees instantly for any network</p>
    </div>
    
    <div class="p-6 space-y-8">
      <!-- Loading/Error States -->
      <div v-if="loading" class="text-center py-8 animate-pulse transition-colors duration-500 text-slate-500 dark:text-white/70">
        Loading latest rates...
      </div>
      <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-600 dark:text-red-200 text-center">
        {{ error }}
      </div>
      
      <div v-else class="space-y-8">
        <!-- Network Selection -->
        <div class="space-y-3">
          <label class="block text-sm font-medium ml-1 transition-colors duration-500 text-black dark:text-blue-100"
          >Select Network</label>
          <div class="grid grid-cols-3 gap-3">
            <button 
              v-for="net in networks" 
              :key="net.id"
              @click="network = net.id; calculate()"
              class="relative group p-3 rounded-xl transition-all duration-300 border flex flex-col items-center justify-center gap-3"
              :class="[
                network === net.id 
                  ? 'bg-white border-slate-200 shadow-lg scale-105 dark:bg-white/20 dark:border-white/40' 
                  : 'bg-white/40 border-white/20 hover:bg-white/60 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10'
              ]"
            >
              <div class="w-12 h-12 rounded-full overflow-hidden shadow-md bg-white p-1">
                <img :src="net.image" :alt="net.name" class="w-full h-full object-cover rounded-full" />
              </div>
              <span class="text-xs font-medium text-center leading-tight transition-colors duration-500 text-black dark:text-white"
              >{{ net.name }}</span>
              
              <!-- Glow effect -->
              <div v-if="network === net.id" class="absolute inset-0 rounded-xl blur-sm -z-10 transition-colors duration-500 bg-slate-200 dark:bg-white/10"
              ></div>
            </button>
          </div>
        </div>

        <!-- Amount Input -->
        <div class="space-y-3">
          <label class="block text-sm font-medium ml-1 transition-colors duration-500 text-black dark:text-blue-100"
          >Transaction Amount (GHS)</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span class="font-display font-bold text-lg transition-colors duration-500 text-gray-500 dark:text-blue-200"
              >₵</span>
            </div>
            <input 
              v-model="amount" 
              type="number" 
              @input="calculate"
              placeholder="0.00"
              class="w-full rounded-2xl py-4 pl-10 pr-4 transition-all text-lg font-display tracking-wide border focus:outline-none focus:ring-2"
              :class="[
                'bg-white/50 border-slate-200 text-black placeholder-gray-500 focus:ring-indigo-500/50 focus:bg-white',
                'dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder-white/30 dark:focus:ring-brand-accent/50 dark:focus:bg-black/30'
              ]"
            >
          </div>
        </div>

        <!-- Results Card -->
        <div v-if="fee !== null" class="animate-slide-up">
          <div class="relative overflow-hidden rounded-2xl border p-5 transition-colors duration-500"
            :class="[
              'bg-gradient-to-br from-white to-slate-50 border-slate-200',
              'dark:from-white/10 dark:to-white/5 dark:border-white/20'
            ]"
          >
            <!-- Receipt decoration -->
            <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-2xl transition-colors duration-500"
              :class="['bg-indigo-500/10', 'dark:bg-brand-accent/20']"
            ></div>

            <div class="relative space-y-4">
              <div class="flex justify-between items-end pb-4 border-b transition-colors duration-500"
                :class="['border-slate-200', 'dark:border-white/10']"
              >
                <span class="text-sm transition-colors duration-500"
                  :class="['text-gray-600', 'dark:text-blue-200']"
                >Service Fee</span>
                <span class="text-2xl font-display font-bold transition-colors duration-500"
                  :class="['text-indigo-600', 'dark:text-brand-accent']"
                >₵{{ fee.toFixed(2) }}</span>
              </div>
              
              <div class="flex justify-between items-center pt-1">
                <span class="font-medium transition-colors duration-500"
                  :class="['text-gray-700', 'dark:text-blue-100']"
                >Amount Received</span>
                <span class="text-xl font-display font-bold text-emerald-500 dark:text-emerald-400">₵{{ amountReceived.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          <div class="text-center mt-4">
            <span class="text-[10px] uppercase tracking-widest transition-colors duration-500"
              :class="['text-gray-500', 'dark:text-white/30']"
            >Standard Rates Apply</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
