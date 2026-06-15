import { defineStore } from 'pinia'
import api from '@/api/axios'
import { createEcho } from '@/echo/echo'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
    token: localStorage.getItem('auth_token') || null,
    echo: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async register(payload) {
      const { data } = await api.post('/register', payload)
      this.setAuth(data.user, data.token)
      return data
    },

    async login(payload) {
      const { data } = await api.post('/login', payload)
      this.setAuth(data.user, data.token)
      return data
    },

    async logout() {
      try {
        await api.post('/logout')
      } catch (e) {
        // ignore error, tetap hapus state lokal
      }
      this.clearAuth()
    },

    setAuth(user, token) {
      this.user = user
      this.token = token
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('auth_token', token)

      this.connectEcho()
    },

    clearAuth() {
      this.user = null
      this.token = null
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')

      if (this.echo) {
        this.echo.disconnect()
        this.echo = null
      }
    },

    /**
     * Buat koneksi Echo (WebSocket) setelah login.
     * Dipanggil juga saat app pertama kali load jika token sudah ada.
     */
   connectEcho() {
  // Putuskan koneksi lama jika ada
  if (this.echo) {
    this.echo.disconnect()
    this.echo = null
  }
  this.echo = createEcho()
},
  },
})