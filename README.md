# Sneaker Drop Inventory — Client

React 19 frontend for the sneaker drop real-time reservation system. Dashboard with live stock updates, 60-second countdown purchase flow, and admin action forms.

---

## Quick Start

### Prerequisites
- Node.js >= 18
- Server running (see [../Sneaker-Drop-Inventory-Server/README.md](../Sneaker-Drop-Inventory-Server/README.md))

### 1. Install

```bash
cd Sneaker-Drop-Inventory-Client
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run

```bash
npm run dev       # Vite dev server on port 5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

Open `http://localhost:5173` — the server must be running on port 5000.

---

## Pages

### Dashboard (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│  [Dashboard] [Actions]                   [👤 You (a1b2c3d4)] │
│                                                              │
│  ┌──────────────────────┐ ┌──────────────────────┐          │
│  │ Air Jordan 1  9/10   │ │ Yeezy 350 V2  3/5    │          │
│  │ Purchased: [alex]... │ │ Purchased: [jordan].. │          │
│  │ [Reserve] [Purchase] │ │ [Reserve] [00:42] [Buy]│         │
│  └──────────────────────┘ └──────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

**Purchase flow (per card):**
1. Click **Reserve** → API call → stock decrements → 60s countdown starts → Purchase button enables
2. Click **Purchase** within 60s → API call → reservation completed → stock permanently deducted
3. If timer expires → stock auto-restored via WebSocket → back to step 1

**After page refresh:** Dashboard fetches user's active reservations from `GET /users/:id/reservations` and restores the countdown timer. No lost reservations.

### Actions (`/actions`)

Two tabs for admin operations:

| Tab | What it does |
|-----|-------------|
| **Create User** | Username input → `POST /users` → updates recent users list |
| **Create Drop** | Title, total stock, start time → `POST /drops` → creates drop |

Purchase is intentionally NOT a form — it only happens through the Dashboard card flow (Reserve → Purchase).

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (TypeScript) |
| Build | Vite 8 + `@vitejs/plugin-react` |
| Styling | Tailwind CSS 4 + `tw-animate-css` |
| Server State | TanStack React Query 5 |
| HTTP | Axios |
| WebSocket | Socket.io Client 4 |
| UI Primitives | Radix UI, class-variance-authority, lucide-react |
| Toasts | Sonner |

### Component Tree

```
App
├── Nav (Dashboard | Actions tabs + user identity pill)
├── Dashboard
│   ├── DropCard[]              ← one per active drop
│   │   ├── ReserveButton       ← inline (not separate component)
│   │   ├── CountdownTimer      ← MM:SS, red when ≤10s
│   │   ├── PurchaseButton      ← inline (not separate component)
│   │   └── ActivityFeed        ← inline latest 3 purchasers as badges
│   ├── DropCardSkeleton[]      ← loading state
│   └── SocketBadge             ← live/reconnecting indicator
└── Forms
    ├── CreateUserForm          ← username input + recent users list
    └── CreateDropForm          ← title, stock, datetime form
```

### State Management

**React Query cache** is the source of truth for drops. WebSocket events patch the cache directly — no refetch needed:

```ts
// useDropsSocket.ts — on 'stock-updated' event
queryClient.setQueryData<Drop[]>(['drops'], (old) =>
  old?.map((d) => d.id === payload.dropId
    ? { ...d, availableStock: payload.availableStock }
    : d
  )
);
```

**Local React state** for per-user reservation (`myReservation` in DropCard), initialized from server on mount via `GET /users/:id/reservations`. Survives page refreshes.

### Persistent User Identity

User ID is a UUID stored in `localStorage`:

```ts
// lib/currentUser.ts
localStorage['sneaker_user_id'] = crypto.randomUUID(); // generated once
```

- Survives page refreshes, tab closes, browser restarts (same origin)
- Falls back to session-only ID when localStorage is unavailable (private browsing)
- Displayed in nav bar: `👤 You (a1b2c3d4…)`
- Can be linked to a username via Create User form

### Countdown Timer Fix

The countdown hook computes seconds **synchronously** from the expiration timestamp:

```ts
// hooks/useCountdown.ts
export function useCountdown(expiresAt: string | null): number {
  const [, setTick] = useState(0); // only for re-render trigger

  useEffect(() => {
    // 1-second interval calls setTick → causes re-render
  }, [expiresAt]);

  // Synchronous: correct on every render, no state lag
  if (!expiresAt) return 0;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}
```

This avoids a bug where `useState(0)` initial value causes the Purchase button to remain disabled on the first render after a reservation is created.

---

## Real-Time Events

| Event | Payload | Effect |
|-------|---------|--------|
| `stock-updated` | `{dropId, availableStock}` | Patches stock count in cache |
| `activity-feed-updated` | `{dropId, latestPurchasers}` | Patches purchaser badges |
| `purchase-completed` | `{dropId}` | Toast notification |

**Room management:** `useDropsSocket` hook joins `drop:<id>` rooms for all visible drops on mount, rejoins on socket reconnect, and leaves on unmount.

---

## Project Structure

```
src/
├── api/
│   ├── axiosInstance.ts     # Axios with baseURL from env
│   ├── drops.ts             # getActiveDrops, createDrop, reserveDrop, purchaseDrop, getMyActiveReservations
│   └── users.ts             # createUser, getUsers
├── components/
│   ├── DropCard.tsx          # Reserve/Purchase buttons, countdown, activity feed
│   ├── CountdownTimer.tsx    # MM:SS display
│   ├── DropCardSkeleton.tsx  # Loading placeholder
│   ├── ErrorBoundary.tsx     # React error boundary
│   └── ui/                   # shadcn-style primitives
├── hooks/
│   ├── useCountdown.ts       # Synchronous countdown from expiresAt
│   ├── useDropsSocket.ts     # WebSocket room join/leave + cache patching
│   └── useSocketStatus.ts    # Live/reconnecting state
├── lib/
│   ├── currentUser.ts        # Persistent UUID via localStorage
│   ├── queryClient.ts        # React Query default options
│   └── socket.ts             # Socket.io client singleton
├── pages/
│   ├── Dashboard.tsx         # Drop grid + loading/error/empty states
│   └── Forms.tsx             # Create User + Create Drop tabs
├── types/index.ts            # TypeScript interfaces
├── App.tsx                   # Root with nav bar
└── main.tsx                  # Entry point
```
