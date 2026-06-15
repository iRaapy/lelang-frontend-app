<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const errors = ref({})
const loading = ref(false)

async function handleSubmit() {
  errors.value = {}
  loading.value = true

  try {
    await auth.register(form.value)
    router.push({ name: 'auctions' })
  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors || {}
    } else {
      errors.value = { general: ['Terjadi kesalahan. Coba lagi.'] }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="max-width: 400px; margin: 2rem auto;">
    <h1>Register</h1>

    <form @submit.prevent="handleSubmit">
      <div style="margin-bottom: 1rem;">
        <label>Nama</label><br />
        <input v-model="form.name" type="text" required style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.name" style="color: red; font-size: 0.85rem;">{{ errors.name[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Email</label><br />
        <input v-model="form.email" type="email" required style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.email" style="color: red; font-size: 0.85rem;">{{ errors.email[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Password</label><br />
        <input v-model="form.password" type="password" required style="width: 100%; padding: 0.5rem;" />
        <div v-if="errors.password" style="color: red; font-size: 0.85rem;">{{ errors.password[0] }}</div>
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Konfirmasi Password</label><br />
        <input v-model="form.password_confirmation" type="password" required style="width: 100%; padding: 0.5rem;" />
      </div>

      <div v-if="errors.general" style="color: red; margin-bottom: 1rem;">{{ errors.general[0] }}</div>

      <button type="submit" :disabled="loading" style="padding: 0.5rem 1.5rem;">
        {{ loading ? 'Loading...' : 'Register' }}
      </button>
    </form>

    <p style="margin-top: 1rem;">
      Sudah punya akun? <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>