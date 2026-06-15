<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuctionsStore } from '@/stores/auctions'
import api from '@/api/axios'

const route = useRoute()
const router = useRouter()
const store = useAuctionsStore()

const isEdit = computed(() => !!route.params.id)
const auctionId = route.params.id

const form = ref({
  title: '',
  description: '',
  starting_price: '',
  bid_increment: '',
  buy_now_price: '',
  starts_at: '',
  ends_at: '',
})

const imageFiles = ref([])
const errors = ref({})
const loading = ref(false)

function formatDateForInput(dateStr) {
  // Convert ISO string ke format yang diterima input datetime-local (YYYY-MM-DDTHH:mm)
  const d = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadAuction() {
  if (!isEdit.value) return

  const { data } = await api.get(`/auctions/${auctionId}`)
  form.value = {
    title: data.title,
    description: data.description || '',
    starting_price: data.starting_price,
    bid_increment: data.bid_increment,
    buy_now_price: data.buy_now_price || '',
    starts_at: formatDateForInput(data.starts_at),
    ends_at: formatDateForInput(data.ends_at),
  }
}

onMounted(loadAuction)

function handleFileChange(e) {
  imageFiles.value = Array.from(e.target.files)
}

function buildFormData() {
  const formData = new FormData()
  formData.append('title', form.value.title)
  formData.append('description', form.value.description || '')
  formData.append('starting_price', form.value.starting_price)
  formData.append('bid_increment', form.value.bid_increment)
  if (form.value.buy_now_price) {
    formData.append('buy_now_price', form.value.buy_now_price)
  }
  // Convert datetime-local (tanpa timezone) ke format yang Laravel terima
  formData.append('starts_at', form.value.starts_at.replace('T', ' ') + ':00')
  formData.append('ends_at', form.value.ends_at.replace('T', ' ') + ':00')

  imageFiles.value.forEach((file) => {
    formData.append('images[]', file)
  })

  return formData
}

async function handleSubmit() {
  errors.value = {}
  loading.value = true

  try {
    const formData = buildFormData()

    if (isEdit.value) {
      await store.updateAuction(auctionId, formData)
    } else {
      await store.createAuction(formData)
    }

    router.push({ name: 'my-auctions' })
  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors || {}
    } else if (e.response?.status === 403) {
      errors.value = { general: ['Anda tidak berhak mengubah lelang ini (mungkin sudah dimulai).'] }
    } else {
      errors.value = { general: ['Terjadi kesalahan. Coba lagi.'] }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>{{ isEdit ? 'Edit Lelang' : 'Buat Lelang Baru' }}</h1>

    <form @submit.prevent="handleSubmit">
      <div style="margin-bottom: 1rem;">
        <label>Judul</label><br />
        <input v-model="form.title" type="text" required style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.title" style="color: red; font-size: 0.85rem;">{{ errors.title[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Deskripsi</label><br />
        <textarea v-model="form.description" rows="3" style="width: 100%; padding: 0.5rem;"></textarea>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Harga Awal (Rp)</label><br />
        <input v-model="form.starting_price" type="number" min="0" required style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.starting_price" style="color: red; font-size: 0.85rem;">{{ errors.starting_price[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Kelipatan Penawaran / Bid Increment (Rp)</label><br />
        <input v-model="form.bid_increment" type="number" min="1" required style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.bid_increment" style="color: red; font-size: 0.85rem;">{{ errors.bid_increment[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Harga Beli Sekarang / Buy Now (opsional, Rp)</label><br />
        <input v-model="form.buy_now_price" type="number" min="0" style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.buy_now_price" style="color: red; font-size: 0.85rem;">{{ errors.buy_now_price[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Waktu Mulai</label><br />
        <input v-model="form.starts_at" type="datetime-local" required style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.starts_at" style="color: red; font-size: 0.85rem;">{{ errors.starts_at[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Waktu Berakhir</label><br />
        <input v-model="form.ends_at" type="datetime-local" required style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.ends_at" style="color: red; font-size: 0.85rem;">{{ errors.ends_at[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Foto Barang (maks 5)</label><br />
        <input type="file" multiple accept="image/*" @change="handleFileChange" />
        <div v-if="errors.images" style="color: red; font-size: 0.85rem;">{{ errors.images[0] }}</div>
      </div>

      <div v-if="errors.general" style="color: red; margin-bottom: 1rem;">{{ errors.general[0] }}</div>

      <button type="submit" :disabled="loading" style="padding: 0.5rem 1.5rem;">
        {{ loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Buat Lelang') }}
      </button>
    </form>
  </div>
</template>