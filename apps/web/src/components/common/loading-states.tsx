import { Card, CardContent } from "@/components/ui/card";

export function LoadingCardGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="pt-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-white/8" />
            <div className="mt-5 h-9 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 h-3 w-36 animate-pulse rounded-full bg-white/8" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LoadingTable() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((__, cell) => (
              <div key={cell} className="h-10 animate-pulse rounded-2xl bg-white/6" />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LoadingRanking() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-[24px] bg-white/6" />
      ))}
    </div>
  );
}
