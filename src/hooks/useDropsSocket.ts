import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { socket, joinDropRoom, leaveDropRoom } from '@/lib/socket'
import type {
  Drop,
  StockUpdatedPayload,
  ActivityFeedUpdatedPayload,
  PurchaseCompletedPayload,
} from '@/types'

export function useDropsSocket(drops: Drop[] | undefined) {
  const queryClient = useQueryClient()
  const joinedRoomIds = useRef<Set<string>>(new Set())

  // --- Effect A: room management ---
  // Join/leave socket rooms whenever the set of drop IDs changes.
  // Use a joined-string dependency so a new array reference on refetch
  // doesn't trigger unnecessary join/leave cycles.
  useEffect(() => {
    const currentIds = new Set(drops?.map((d) => d.id) ?? [])
    const prevIds = joinedRoomIds.current

    for (const id of currentIds) {
      if (!prevIds.has(id)) {
        joinDropRoom(id)
      }
    }

    for (const id of prevIds) {
      if (!currentIds.has(id)) {
        leaveDropRoom(id)
      }
    }

    joinedRoomIds.current = currentIds

    return () => {
      for (const id of currentIds) {
        leaveDropRoom(id)
      }
      joinedRoomIds.current = new Set()
    }
  }, [drops?.map((d) => d.id).join(',') ?? ''])

  // --- Effect B: event listeners (set up once) ---
  useEffect(() => {
    function handleStockUpdated(payload: StockUpdatedPayload) {
      queryClient.setQueryData<Drop[]>(['drops'], (old) => {
        if (!old) return old
        return old.map((drop) =>
          drop.id === payload.dropId
            ? { ...drop, availableStock: payload.availableStock }
            : drop,
        )
      })
    }

    function handleActivityFeedUpdated(payload: ActivityFeedUpdatedPayload) {
      queryClient.setQueryData<Drop[]>(['drops'], (old) => {
        if (!old) return old
        return old.map((drop) =>
          drop.id === payload.dropId
            ? { ...drop, latestPurchasers: payload.latestPurchasers }
            : drop,
        )
      })
    }

    function handlePurchaseCompleted(_payload: PurchaseCompletedPayload) {
      toast.success('A purchase just went through!')
    }

    function handleConnect() {
      const cached = queryClient.getQueryData<Drop[]>(['drops'])
      if (cached) {
        for (const drop of cached) {
          joinDropRoom(drop.id)
        }
        joinedRoomIds.current = new Set(cached.map((d) => d.id))
      }
    }

    socket.on('stock-updated', handleStockUpdated)
    socket.on('activity-feed-updated', handleActivityFeedUpdated)
    socket.on('purchase-completed', handlePurchaseCompleted)
    socket.on('connect', handleConnect)

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.off('stock-updated', handleStockUpdated)
      socket.off('activity-feed-updated', handleActivityFeedUpdated)
      socket.off('purchase-completed', handlePurchaseCompleted)
      socket.off('connect', handleConnect)
      socket.disconnect()
    }
  }, [queryClient])
}
