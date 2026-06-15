import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import AuctionListView from '@/views/AuctionListView.vue'
import AuctionDetailView from '@/views/AuctionDetailView.vue'
import AuctionFormView from '@/views/AuctionFormView.vue'
import MyAuctionsView from '@/views/MyAuctionsView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/', name: 'auctions', component: AuctionListView, meta: { requiresAuth: true } },
  { path: '/auctions/:id', name: 'auction-detail', component: AuctionDetailView, meta: { requiresAuth: true } },
  { path: '/my-auctions', name: 'my-auctions', component: MyAuctionsView, meta: { requiresAuth: true } },
  { path: '/my-auctions/create', name: 'auction-create', component: AuctionFormView, meta: { requiresAuth: true } },
  { path: '/my-auctions/:id/edit', name: 'auction-edit', component: AuctionFormView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'auctions' }
  }

  return true
})

export default router