import type { DriveStep } from "driver.js";

// ─── TigerArt Product Tour Steps ───────────────────────────────────────────
// Each `element` selector must match a data-tour="…" attribute you add to the
// corresponding JSX element. See useTour.ts for wiring instructions.

export const tourSteps: DriveStep[] = [
  {
    // Add data-tour="logo" to your TigerArt logo / wordmark element
    element: '[data-tour="logo"]',
    popover: {
      title: "Welcome to TigerArt 🎨",
      description:
        "Your hub for Princeton's art community. This quick tour shows you the key features — takes about a minute.",
      side: "bottom",
      align: "start",
    },
  },
  {
    // Add data-tour="search" to your <SearchBar /> wrapper div or input
    element: '[data-tour="search"]',
    popover: {
      title: "Search artworks",
      description:
        "Find pieces by title, artist, department, or classification. Results update as you type.",
      side: "bottom",
      align: "start",
    },
  },
  {
    // Add data-tour="for-you-heading" to the <h1> in ForYouScreen
    element: '[data-tour="for-you-heading"]',
    popover: {
      title: "Your personal feed",
      description:
        "Artworks curated just for you based on your tastes and activity. The more you explore, the better it gets.",
      side: "bottom",
      align: "start",
    },
  },
  {
    // Add data-tour="artwork-card" to the first card div in the grid
    element: '[data-tour="artwork-card"]',
    popover: {
      title: "Artwork cards",
      description:
        "Tap any card to open full details — title, artist, date, department, and whether it's currently on view.",
      side: "top",
      align: "start",
    },
  },
  {
    // Add data-tour="favorite-btn" to the heart <button> inside a card
    element: '[data-tour="favorite-btn"]',
    popover: {
      title: "Save to favorites",
      description:
        "Tap the heart to save a piece to your collection. Find all your favorites on the Favorites screen.",
      side: "left",
      align: "center",
    },
  },
  {
    // Add data-tour="nav-for-you" to the For You nav item in BottomNav
    element: '[data-tour="nav-for-you"]',
    popover: {
      title: "For You",
      description: "Your personalized feed — always up to date.",
      side: "top",
      align: "center",
    },
  },
  {
    // Add data-tour="nav-exhibits" to the Exhibits nav item in BottomNav
    element: '[data-tour="nav-exhibits"]',
    popover: {
      title: "Exhibits",
      description:
        "Browse curated exhibitions and galleries. Filter by department or view works currently on display at Harvard Art Museums.",
      side: "top",
      align: "center",
    },
  },
  {
    // Add data-tour="nav-favorites" to the Favorites nav item in BottomNav
    element: '[data-tour="nav-favorites"]',
    popover: {
      title: "Favorites",
      description:
        "Everything you've hearted lives here. Build your personal collection over time.",
      side: "top",
      align: "center",
    },
  },
  {
    // Add data-tour="nav-profile" to the Profile nav item in BottomNav
    element: '[data-tour="nav-profile"]',
    popover: {
      title: "Your profile",
      description:
        "View your activity, set your art preferences, and sign out. You're all set — enjoy TigerArt!",
      side: "top",
      align: "center",
    },
  },
];
