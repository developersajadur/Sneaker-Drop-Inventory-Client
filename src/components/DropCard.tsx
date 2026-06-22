import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CountdownTimer from '@/components/CountdownTimer'
import { useCountdown } from '@/hooks/useCountdown'
import { reserveDrop, purchaseDrop } from '@/api/drops'
import currentUserId from '@/lib/currentUser'
import type { Drop, Reservation } from '@/types'

interface DropCardProps {
  drop: Drop
  initialReservation?: Reservation | null
}

export default function DropCard({ drop, initialReservation = null }: DropCardProps) {
  const isSoldOut = drop.availableStock === 0
  const stockLabel = `${drop.availableStock} / ${drop.totalStock} available`

  const [myReservation, setMyReservation] = useState<Reservation | null>(initialReservation)
  const secondsLeft = useCountdown(myReservation?.expiresAt ?? null)

  // Clear local reservation when countdown reaches 0
  useEffect(() => {
    if (secondsLeft === 0 && myReservation !== null) {
      setMyReservation(null)
    }
  }, [secondsLeft, myReservation])

  // --- Reserve mutation ---
  const reserveMutation = useMutation({
    mutationFn: () => reserveDrop(drop.id, currentUserId),
    onSuccess: (reservation) => {
      setMyReservation(reservation)
      toast.success('Reserved! Complete your purchase within 60 seconds.')
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const message = axiosErr?.response?.data?.message ?? 'Something went wrong'
      if (message.toLowerCase().includes('out of stock')) {
        toast.error('Out of stock — someone got it first!')
      } else {
        toast.error(message)
      }
    },
  })

  // --- Purchase mutation ---
  const purchaseMutation = useMutation({
    mutationFn: () => purchaseDrop(currentUserId, drop.id),
    onSuccess: () => {
      setMyReservation(null)
      toast.success('Purchase completed!')
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const message = axiosErr?.response?.data?.message ?? 'Something went wrong'
      toast.error(message)
      // Always clear stale reservation — the server is the source of truth
      setMyReservation(null)
    },
  })

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{drop.title}</CardTitle>
          <Badge variant={isSoldOut ? 'destructive' : 'default'} className="shrink-0">
            {isSoldOut ? 'Sold Out' : stockLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Recent purchasers */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Recently purchased by:</p>
          {drop.latestPurchasers.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {drop.latestPurchasers.map((p, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {p.username}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">No purchases yet</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2">
        <Button
          className="flex-1"
          disabled={isSoldOut || myReservation !== null || reserveMutation.isPending}
          onClick={() => reserveMutation.mutate()}
        >
          {reserveMutation.isPending ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Reserving...
            </>
          ) : (
            'Reserve'
          )}
        </Button>

        {myReservation && secondsLeft > 0 && (
          <CountdownTimer secondsLeft={secondsLeft} />
        )}

        <Button
          className="flex-1"
          variant="secondary"
          disabled={
            !(myReservation !== null && secondsLeft > 0) || purchaseMutation.isPending
          }
          onClick={() => purchaseMutation.mutate()}
        >
          {purchaseMutation.isPending ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Purchasing...
            </>
          ) : (
            'Purchase'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
