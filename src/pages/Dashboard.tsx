import { useQuery } from '@tanstack/react-query'
import { getActiveDrops, getMyActiveReservations } from '@/api/drops'
import DropCard from '@/components/DropCard'
import DropCardSkeleton from '@/components/DropCardSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDropsSocket } from '@/hooks/useDropsSocket'
import { useSocketStatus } from '@/hooks/useSocketStatus'
import currentUserId from '@/lib/currentUser'
import type { Reservation } from '@/types'

export default function Dashboard() {
  const {
    data: drops,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['drops'],
    queryFn: getActiveDrops,
  })

  // Fetch user's active reservations so they survive page refresh
  const { data: myReservations } = useQuery({
    queryKey: ['my-reservations', currentUserId],
    queryFn: () => getMyActiveReservations(currentUserId),
    refetchInterval: 15_000, // keep in sync with expiration
  })

  // Build lookup: dropId → reservation
  const reservationByDropId = new Map<string, Reservation>()
  if (myReservations) {
    for (const r of myReservations) {
      reservationByDropId.set(r.dropId, r)
    }
  }

  useDropsSocket(drops)
  const isSocketConnected = useSocketStatus()

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page header with socket status */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Sneaker Drops</h1>
          <Badge
            variant={isSocketConnected ? 'default' : 'destructive'}
            className="gap-1.5 text-xs"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isSocketConnected ? 'bg-green-400' : 'bg-red-500'
              }`}
            />
            {isSocketConnected ? 'Live' : 'Reconnecting...'}
          </Badge>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DropCardSkeleton />
            <DropCardSkeleton />
            <DropCardSkeleton />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/50 py-24 text-center">
            <p className="text-red-400 text-lg font-medium mb-2">Failed to load drops</p>
            <p className="text-gray-500 text-sm mb-4">Could not fetch drop data from the server.</p>
            <Button onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && drops && drops.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-800/50 py-24 text-center">
            <p className="text-gray-400 text-lg font-medium">No active drops right now</p>
            <p className="text-gray-600 text-sm mt-1">Check back later for new sneaker drops.</p>
          </div>
        )}

        {/* Success state */}
        {!isLoading && !isError && drops && drops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                initialReservation={reservationByDropId.get(drop.id) ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
