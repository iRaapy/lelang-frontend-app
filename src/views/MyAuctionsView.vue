<script setup>
import { ref, onMounted } from 'vue'
import { useAuctionsStore } from '@/stores/auctions'

const store = useAuctionsStore()
const deleteError = ref('')

async function loadMyAuctions() {
  await store.fetchMyAuctions()
}

onMounted(loadMyAuctions)

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID')
}

const statusConfig = {
  scheduled: { label: 'Terjadwal', badge: 'badge-scheduled' },
  active: { label: 'Aktif', badge: 'badge-active' },
  ended: { label: 'Selesai', badge: 'badge-ended' },
}

async function handleDelete(auction) {
  if (!confirm(`Hapus lelang "${auction.title}"?`)) return

  deleteError.value = ''
  try {
    await store.deleteAuction(auction.id)
    await loadMyAuctions()
  } catch (e) {
    deleteError.value = e.response?.data?.message || 'Gagal menghapus lelang.'
  }
}
</script>

<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h1>Lelang Saya</h1>
      <router-link :to="{ name: 'auction-create' }" class="btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem; text-decoration: none;">
        <span style="font-size: 1.1rem; line-height: 1;">+</span> Buat Lelang Baru
      </router-link>
    </div>

    <div v-if="deleteError" class="field-error" style="margin-bottom: 1rem;">{{ deleteError }}</div>

    <div v-if="store.loading" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
      Memuat...
    </div>

    <div v-else-if="store.auctions.length === 0" class="card" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
      Anda belum membuat lelang. Klik "Buat Lelang Baru" untuk mulai.
    </div>

    <div v-else class="card" style="overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: var(--color-bg); text-align: left;">
            <th style="padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Judul</th>
            <th style="padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Status</th>
            <th style="padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Harga Tertinggi</th>
            <th style="padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Penawaran</th>
            <th style="padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Pemenang</th>
            <th style="padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="auction in store.auctions" :key="auction.id" style="border-top: 1px solid var(--color-border);">
            <td style="padding: 0.75rem 1rem;">
              <router-link :to="{ name: 'auction-detail', params: { id: auction.id } }" style="font-weight: 500;">
                {{ auction.title }}
              </router-link>
            </td>
            <td style="padding: 0.75rem 1rem;">
              <span class="badge" :class="statusConfig[auction.status]?.badge">
                {{ statusConfig[auction.status]?.label }}
              </span>
            </td>
            <td style="padding: 0.75rem 1rem; font-weight: 500;">{{ formatPrice(auction.current_price) }}</td>
            <td style="padding: 0.75rem 1rem; color: var(--color-text-muted);">{{ auction.bids_count }}</td>
            <td style="padding: 0.75rem 1rem; color: var(--color-text-muted);">{{ auction.winner?.name || '-' }}</td>
            <td style="padding: 0.75rem 1rem;">
              <template v-if="auction.status === 'scheduled'">
                <router-link :to="{ name: 'auction-edit', params: { id: auction.id } }" style="margin-right: 0.75rem; font-size: 0.85rem;">
                  Edit
                </router-link>
                <button @click="handleDelete(auction)" class="btn-danger" style="padding: 0.25rem 0.6rem; font-size: 0.85rem;">
                  Hapus
                </button>
              </template>
              <span v-else style="color: var(--color-text-muted); font-size: 0.85rem;">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>