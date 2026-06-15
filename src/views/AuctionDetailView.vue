<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuctionsStore } from '@/stores/auctions'
import { useAuthStore } from '@/stores/auth'
import CountdownTimer from '@/components/CountdownTimer.vue'
import BidList from '@/components/BidList.vue'

const route = useRoute()
const store = useAuctionsStore()
const auth = useAuthStore()

const auctionId = route.params.id
const bidAmount = ref('')
const bidError = ref('')
const bidLoading = ref(false)
const outbidMessage = ref('')
const viewerCount = ref(0)

const auction = computed(() => store.currentAuction)

const isOwner = computed(() => {
  return auction.value && auth.user && auction.value.seller_id === auth.user.id
})

const canBid = computed(() => {
  return auction.value && auction.value.status === 'active' && !isOwner.value
})

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID')
}

async function loadAuction() {
  await store.fetchAuction(auctionId)
  bidAmount.value = Number(auction.value.current_price) + Number(auction.value.bid_increment)
}

async function handlePlaceBid() {
  bidError.value = ''
  bidLoading.value = true

  try {
    const result = await store.placeBid(auctionId, Number(bidAmount.value))

    store.applyBidPlaced({
      auction_id: Number(auctionId),
      bid_id: result.bid.id,
      amount: result.bid.amount,
      bidder_id: result.bid.bidder_id,
      bidder_name: result.bid.bidder.name,
      highest_bid: result.auction.current_price,
      bids_count: result.auction.bids_count,
      minimum_next_bid: Number(result.auction.current_price) + Number(result.auction.bid_increment),
      ends_at: result.auction.ends_at,
      created_at: result.bid.created_at,
    })

    bidAmount.value = Number(result.auction.current_price) + Number(result.auction.bid_increment)
  } catch (e) {
    if (e.response?.status === 422) {
      const errors = e.response.data.errors || {}
      bidError.value = Object.values(errors).flat().join(', ')
    } else {
      bidError.value = 'Gagal menempatkan tawaran.'
    }
  } finally {
    bidLoading.value = false
  }
}

function handleExpired() {
  // Auction sudah expired secara waktu; status final akan diupdate via event AuctionEnded
}

// --- WebSocket subscriptions ---
let channel = null
let privateChannel = null
let presenceChannel = null

function subscribeToChannels() {
  if (!auth.echo) return

  channel = auth.echo.private(`auction.${auctionId}`)

  channel.listen('.BidPlaced', (e) => {
    if (e.bidder_id !== auth.user.id) {
      store.applyBidPlaced(e)
      bidAmount.value = e.minimum_next_bid
    }
  })

  channel.listen('.AuctionEnded', (e) => {
    store.applyAuctionEnded(e)
  })

  privateChannel = auth.echo.private(`App.Models.User.${auth.user.id}`)

  privateChannel.listen('.BidderOutbid', (e) => {
    if (e.auction_id == auctionId) {
      outbidMessage.value = e.message
      setTimeout(() => { outbidMessage.value = '' }, 5000)
    }
  })

  // Bonus: Presence channel — jumlah penonton aktif
  presenceChannel = auth.echo.join(`presence-auction.${auctionId}`)

  presenceChannel.here((users) => {
    viewerCount.value = users.length
  })

  presenceChannel.joining(() => {
    viewerCount.value++
  })

  presenceChannel.leaving(() => {
    viewerCount.value = Math.max(0, viewerCount.value - 1)
  })
}

function unsubscribeChannels() {
  if (auth.echo) {
    auth.echo.leave(`auction.${auctionId}`)
    auth.echo.leave(`App.Models.User.${auth.user.id}`)
    auth.echo.leave(`presence-auction.${auctionId}`)
  }
}

onMounted(async () => {
  await loadAuction()

  if (!auth.echo) {
    auth.connectEcho()
  }

  subscribeToChannels()
})

onUnmounted(() => {
  unsubscribeChannels()
})
</script>

<template>
  <div v-if="store.loading">Loading...</div>

  <div v-else-if="auction">
    <div v-if="outbidMessage" style="background: #fff3cd; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; border: 1px solid #ffc107;">
      {{ outbidMessage }}
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <img
          v-if="auction.images?.[0]"
          :src="auction.images[0].url"
          style="width: 100%; border-radius: 8px;"
        />
        <div v-else style="width: 100%; height: 300px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999;">
          No Image
        </div>
      </div>

      <div>
        <h1>{{ auction.title }}</h1>
        <p>{{ auction.description }}</p>
        <p>Penjual: <strong>{{ auction.seller?.name }}</strong></p>

        <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <div style="font-size: 0.85rem; color: #777;">Harga Tertinggi</div>
          <div style="font-size: 1.8rem; font-weight: bold;">{{ formatPrice(auction.current_price) }}</div>

          <div v-if="auction.status === 'active'" style="margin-top: 0.5rem;">
            <div style="font-size: 0.85rem; color: #777;">Sisa Waktu</div>
            <div style="font-size: 1.2rem; font-weight: bold; color: #e63946;">
              <CountdownTimer :ends-at="auction.ends_at" @expired="handleExpired" />
            </div>
          </div>

          <div v-else-if="auction.status === 'scheduled'" style="margin-top: 0.5rem; color: #777;">
            Lelang belum dimulai
          </div>

          <div v-else-if="auction.status === 'ended'" style="margin-top: 0.5rem;">
            <div style="color: #777;">Lelang telah berakhir</div>
            <div v-if="auction.winner" style="font-weight: bold; color: green;">
              Pemenang: {{ auction.winner.name }}
            </div>
            <div v-else style="color: #999;">Tidak ada pemenang (tidak ada penawaran)</div>
          </div>

          <div v-if="auction.buy_now_price" style="margin-top: 0.5rem; font-size: 0.9rem; color: #777;">
            Beli Sekarang: {{ formatPrice(auction.buy_now_price) }}
          </div>

          <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #777;">
            {{ viewerCount }} orang sedang menonton
          </div>
        </div>

        <div v-if="isOwner" style="color: #777; font-style: italic;">
          Ini adalah lelang Anda sendiri — Anda tidak dapat menawar.
        </div>

        <div v-else-if="canBid">
          <form @submit.prevent="handlePlaceBid" style="display: flex; gap: 0.5rem; align-items: flex-start;">
            <div style="flex: 1;">
              <input
                v-model="bidAmount"
                type="number"
                :min="Number(auction.current_price) + Number(auction.bid_increment)"
                :step="auction.bid_increment"
                style="width: 100%; padding: 0.5rem;"
              />
              <div style="font-size: 0.8rem; color: #777; margin-top: 0.25rem;">
                Minimum: {{ formatPrice(Number(auction.current_price) + Number(auction.bid_increment)) }}
              </div>
            </div>
            <button type="submit" :disabled="bidLoading" style="padding: 0.5rem 1.5rem;">
              {{ bidLoading ? 'Mengirim...' : 'Tawar' }}
            </button>

            <button
              v-if="auction.buy_now_price"
              type="button"
              @click="bidAmount = auction.buy_now_price; handlePlaceBid()"
              style="padding: 0.5rem 1rem; background: #ffc107;"
            >
              Beli Sekarang
            </button>
          </form>
          <div v-if="bidError" style="color: red; margin-top: 0.5rem;">{{ bidError }}</div>
        </div>

        <div v-else style="color: #777;">
          Lelang tidak sedang berjalan, tidak dapat menawar.
        </div>
      </div>
    </div>

    <hr style="margin: 2rem 0;" />

    <BidList :bids="auction.bids" />
  </div>

  <div v-else>Lelang tidak ditemukan.</div>
</template>