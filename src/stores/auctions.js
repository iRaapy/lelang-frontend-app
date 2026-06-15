import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuctionsStore = defineStore('auctions', {
  state: () => ({
    auctions: [],
    currentAuction: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAuctions(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/auctions', { params })
        this.auctions = data.data // paginated response
        return data
      } catch (e) {
        this.error = e.response?.data?.message || 'Gagal memuat lelang'
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchMyAuctions(params = {}) {
      this.loading = true
      try {
        const { data } = await api.get('/auctions/my', { params })
        this.auctions = data.data
        return data
      } finally {
        this.loading = false
      }
    },

    async fetchAuction(id) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get(`/auctions/${id}`)
        this.currentAuction = data
        return data
      } catch (e) {
        this.error = e.response?.data?.message || 'Gagal memuat detail lelang'
        throw e
      } finally {
        this.loading = false
      }
    },

    async createAuction(formData) {
      const { data } = await api.post('/auctions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },

    async updateAuction(id, formData) {
      // Laravel tidak bisa parse multipart PUT, jadi gunakan POST + _method override
      formData.append('_method', 'PUT')
      const { data } = await api.post(`/auctions/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },

    async deleteAuction(id) {
      await api.delete(`/auctions/${id}`)
    },

    async placeBid(auctionId, amount) {
      const { data } = await api.post(`/auctions/${auctionId}/bids`, { amount })
      return data
    },

    /**
     * Update state currentAuction secara realtime saat BidPlaced diterima.
     */
    applyBidPlaced(payload) {
      if (!this.currentAuction || this.currentAuction.id !== payload.auction_id) return

      this.currentAuction.current_price = payload.highest_bid
      this.currentAuction.bids_count = payload.bids_count
      this.currentAuction.ends_at = payload.ends_at

      // Tandai semua bid lama jadi outbid, masukkan bid baru di depan
      this.currentAuction.bids = this.currentAuction.bids.map((b) => ({
        ...b,
        status: 'outbid',
      }))

      this.currentAuction.bids.unshift({
        id: payload.bid_id,
        amount: payload.amount,
        status: 'active',
        bidder_id: payload.bidder_id,
        bidder: { id: payload.bidder_id, name: payload.bidder_name },
        created_at: payload.created_at,
      })
    },

    /**
     * Update state saat AuctionEnded diterima.
     */
    applyAuctionEnded(payload) {
      if (!this.currentAuction || this.currentAuction.id !== payload.auction_id) return

      this.currentAuction.status = payload.status
      this.currentAuction.winner_id = payload.winner_id
      this.currentAuction.winner = payload.winner_id
        ? { id: payload.winner_id, name: payload.winner_name }
        : null
    },
  },
})