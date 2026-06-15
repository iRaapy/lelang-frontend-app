<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div>
    <nav v-if="auth.isAuthenticated" style="background: var(--color-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 10;">
      <div class="container" style="display: flex; align-items: center; height: 64px; gap: 2rem;">
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary);">
          Lelang Daring
        </div>

        <div style="display: flex; gap: 1.5rem; flex: 1;">
          <router-link
            to="/"
            style="color: var(--color-text); font-weight: 500; font-size: 0.9rem;"
            :style="route.name === 'auctions' ? 'color: var(--color-primary);' : ''"
          >
            Daftar Lelang
          </router-link>
          <router-link
            to="/my-auctions"
            style="color: var(--color-text); font-weight: 500; font-size: 0.9rem;"
            :style="route.name?.toString().startsWith('my-auctions') || route.name?.toString().startsWith('auction-edit') || route.name?.toString().startsWith('auction-create') ? 'color: var(--color-primary);' : ''"
          >
            Lelang Saya
          </router-link>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 0.9rem; color: var(--color-text-muted);">
            {{ auth.user?.name }}
          </span>
          <button @click="handleLogout" class="btn-secondary" style="padding: 0.4rem 1rem; font-size: 0.85rem;">
            Logout
          </button>
        </div>
      </div>
    </nav>

    <main class="container" style="padding-top: 2rem; padding-bottom: 3rem;">
      <router-view />
    </main>
  </div>
</template>