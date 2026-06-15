<script setup>
defineProps({
  bids: { type: Array, default: () => [] },
})

function formatPrice(price) {
  return 'Rp' + Number(price).toLocaleString('id-ID')
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleString('id-ID')
}
</script>

<template>
  <div>
    <h3>Riwayat Penawaran ({{ bids.length }})</h3>
    <div v-if="bids.length === 0" style="color: #999;">Belum ada penawaran.</div>
    <ul v-else style="list-style: none; padding: 0;">
      <li
        v-for="bid in bids"
        :key="bid.id"
        style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #eee;"
        :style="bid.status === 'active' ? 'background: #e8f5e9; font-weight: bold;' : ''"
      >
        <span>{{ bid.bidder?.name || 'Unknown' }}</span>
        <span>{{ formatPrice(bid.amount) }}</span>
        <span style="color: #999; font-size: 0.85rem;">{{ formatTime(bid.created_at) }}</span>
        <span v-if="bid.status === 'active'" style="color: green; font-size: 0.85rem;">Tertinggi</span>
        <span v-else style="color: #999; font-size: 0.85rem;">Outbid</span>
      </li>
    </ul>
  </div>
</template>