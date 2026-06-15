<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuctionsStore } from '@/stores/auctions'

const store = useAuctionsStore()
const filterStatus = ref('')
const searchQuery = ref('')

async function loadAuctions() {
  const params = {}
  if (filterStatus.value) params.status = filterStatus.value
  await store.fetchAuctions(params)
}

onMounted(loadAuctions)

function setFilter(status) {
  filterStatus.value = status
  loadAuctions()
}

const filteredAuctions = computed(() => {
  if (!searchQuery.value) return store.auctions
  const q = searchQuery.value.toLowerCase()
  return store.auctions.filter(a => a.title.toLowerCase().includes(q))
})

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID')
}

const statusConfig = {
  scheduled: { label: 'Terjadwal', badge: 'badge-scheduled' },
  active: { label: 'Open Bidding', badge: 'badge-active' },
  ended: { label: 'Selesai', badge: 'badge-ended' },
}

const tabs = [
  { value: '', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'ended', label: 'Selesai' },
]
</script>

<template>
  <div>
    <div style="margin-bottom: 1.5rem;">
      <h1 style="margin-bottom: 1rem;">Daftar Lelang</h1>

      <div style="position: relative; max-width: 480px;">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari lelang..."
          style="width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem;"
        />
        <span style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);">
          🔍
        </span>
      </div>
    </div>

    <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--color-border); margin-bottom: 1.5rem;">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="setFilter(tab.value)"
        :style="filterStatus === tab.value
          ? 'background: transparent; color: var(--color-primary); border-radius: 0; border-bottom: 2px solid var(--color-primary); padding-bottom: 0.6rem;'
          : 'background: transparent; color: var(--color-text-muted); border-radius: 0; border-bottom: 2px solid transparent; padding-bottom: 0.6rem;'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="store.loading" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
      Memuat lelang...
    </div>

    <div v-else-if="filteredAuctions.length === 0" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
      Tidak ada lelang ditemukan.
    </div>

    <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem;">
      <router-link
        v-for="auction in filteredAuctions"
        :key="auction.id"
        :to="{ name: 'auction-detail', params: { id: auction.id } }"
        class="card"
        style="overflow: hidden; text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: box-shadow 0.15s, transform 0.15s;"
        onmouseover="this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(-2px)'"
        onmouseout="this.style.boxShadow='var(--shadow)'; this.style.transform='translateY(0)'"
      >
        <div style="position: relative; aspect-ratio: 4/3; background: #f1f5f9; overflow: hidden;">
          <img
            v-if="auction.images?.[0]"
            :src="auction.images[0].url"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <div v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #cbd5e1; font-size: 0.85rem;">
            Tidak ada foto
          </div>

          <span
            class="badge"
            :class="statusConfig[auction.status]?.badge"
            style="position: absolute; bottom: 0.6rem; left: 0.6rem;"
          >
            {{ statusConfig[auction.status]?.label }}
          </span>
        </div>

        <div style="padding: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem; flex: 1;">
          <h3 style="font-size: 0.95rem; font-weight: 600; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            {{ auction.title }}
          </h3>

          <div style="margin-top: auto;">
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">
              {{ auction.status === 'ended' ? 'Harga Akhir' : 'Harga Saat Ini' }}
            </div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-text);">
              {{ formatPrice(auction.current_price) }}
            </div>
          </div>

          <div style="font-size: 0.75rem; color: var(--color-text-muted); display: flex; justify-content: space-between;">
            <span>{{ auction.bids_count }} penawaran</span>
            <span>{{ auction.seller?.name }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>