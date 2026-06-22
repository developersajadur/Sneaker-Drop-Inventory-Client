import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DropCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-24 shrink-0 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div>
          <Skeleton className="h-3 w-36 mb-2" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 flex-1 rounded-md" />
      </CardFooter>
    </Card>
  )
}
