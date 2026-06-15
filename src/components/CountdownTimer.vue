<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  endsAt: { type: String, required: true },
})

const emit = defineEmits(['expired'])

const remaining = ref('')
let interval = null

function updateRemaining() {
  const end = new Date(props.endsAt).getTime()
  const now = Date.now()
  const diff = end - now

 if (diff <= 0) {
  remaining.value = '00:00:00'
  clearInterval(interval)   // ← tambah ini
  interval = null           // ← tambah ini
  emit('expired')
  return
}

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  remaining.value = [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

onMounted(() => {
  updateRemaining()
  interval = setInterval(updateRemaining, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

// Restart interval jika endsAt berubah (misal karena anti-sniping)
watch(() => props.endsAt, updateRemaining)
</script>

<template>
  <span>{{ remaining }}</span>
</template>