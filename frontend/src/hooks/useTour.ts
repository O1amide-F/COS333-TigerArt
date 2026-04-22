// hooks/useTour.ts

import { useCallback, useEffect, useRef, useState } from "react";

export type TourStep =
  | "welcome"
  | "for-you-heading"
  | "search"
  | "artwork-grid"
  | "like-photos"
  | "open-modals"
  | "explore-heading"
  | "explore-search"
  | "explore-pin-details"
  | "explore-nav"
  | "news-nav"
  | "favorites-nav"
  | "recently-viewed-nav"
  | "settings-nav"
  | "settings-tour"
  | "done";

export type TourStatus = {
  active: boolean;
  step: TourStep;
  likesRequired: number;
  likesCompleted: number;
  modalsRequired: number;
  modalsOpened: number;
};

export const TOUR_EVENTS = {
  FAVORITE_TOGGLED: "tigerart:tour:favorite",
  MODAL_OPENED: "tigerart:tour:modal_open",
} as const;

export function dispatchTourEvent(
  type: (typeof TOUR_EVENTS)[keyof typeof TOUR_EVENTS],
  detail?: unknown,
) {
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

export type StepMeta = {
  id: TourStep;
  target: string | null;
  title: string;
  body: string;
  interactive?: boolean;
  navTo?: string;
};

export const TOUR_STEPS: StepMeta[] = [
  {
    id: "welcome",
    target: null,
    title: "Welcome to TigerArt 🎨",
    body: "This quick tour will show you how to discover, save, and explore art curated just for you. Let's get started!",
  },
  {
    id: "for-you-heading",
    target: "[data-tour='for-you-heading']",
    title: "Your Personal Feed",
    body: "This is your Home feed — artwork chosen based on your survey preferences. It updates as you explore and favorite more pieces.",
  },
  {
    id: "search",
    target: "[data-tour='search']",
    title: "Search & Filter",
    body: "Use the search bar to find artworks by title, artist, or keyword. You can also filter by classification or department.",
  },
  {
    id: "artwork-grid",
    target: "[data-tour='artwork-card']",
    title: "Artwork Cards",
    body: "Each card shows a piece from the collection. Tap a card to open its full details, or tap the ♡ to save it to your Favorites.",
  },
  {
    id: "like-photos",
    target: "[data-tour='home-page']",
    title: "Try It: Like 2 Artworks ♡",
    body: "Tap the heart ♥ on any 2 artworks in your feed to save them. This teaches TigerArt what you enjoy!",
    interactive: true,
  },
  {
    id: "open-modals",
    target: "[data-tour='home-page']",
    title: "Try It: Open 2 Artwork Details",
    body: "Tap any 2 artwork cards to open their detail view. You'll see the artist, date, classification, and more.",
    interactive: true,
  },
  {
    id: "explore-nav",
    target: "[data-tour='nav-explore']",
    title: "Explore Collections",
    body: "The Explore tab organises artworks by collection and department — a great way to browse when you're not sure what you're looking for.",
    navTo: "explore",
  },
  {
    id: "explore-pin-details",
    target: "[data-tour='section-heading']",
    title: "Pin & Open Exhibits",
    body: "Use the pin next to an exhibit section to keep it at the top. Tap an exhibit name to open its full details page.",
    navTo: "explore",
  },
  {
    id: "favorites-nav",
    target: "[data-tour='nav-favorites']",
    title: "Your Favorites",
    body: "Everything you ♡ lives here. You can search, sort, and filter your saved artworks any time.",
    navTo: "favorites",
  },
  {
    id: "recently-viewed-nav",
    target: "[data-tour='nav-recently-viewed']",
    title: "Recently Viewed",
    body: "Revisit artworks you opened recently. Search and sort your viewing history anytime.",
    navTo: "recently_viewed",
  },
  {
    id: "news-nav",
    target: "[data-tour='nav-news']",
    title: "Art News",
    body: "Visit News for updates, stories, and highlights from the museum community.",
    navTo: "news",
  },
  {
    id: "settings-nav",
    target: "[data-tour='settings-preferences']",
    title: "Update Your Preferences",
    body: "Head to Settings to retake the survey and refresh your For You feed. You can also replay this tour anytime from here.",
    navTo: "settings",
  },
  {
    id: "done",
    target: null,
    title: "You're All Set! 🎉",
    body: "You now know the key features of TigerArt. Enjoy discovering art — your feed will keep improving the more you interact with it.",
  },
];

export const GUEST_TOUR_STEPS: StepMeta[] = [
  {
    id: "welcome",
    target: null,
    title: "Welcome to TigerArt 🎨",
    body: "This quick tour will show you how to discover and explore art as a guest. Let's get started!",
  },
  {
    id: "explore-nav",
    target: "[data-tour='nav-explore']",
    title: "Explore Collections",
    body: "Start in Explore to browse artworks by collection and department.",
    navTo: "explore",
  },
  {
    id: "explore-heading",
    target: "[data-tour='explore-heading']",
    title: "Explore Page",
    body: "This page is your guest hub for discovering art across the collection.",
  },
  {
    id: "explore-search",
    target: "[data-tour='explore-search']",
    title: "Search & Filter",
    body: "Use search and filters to quickly find artworks by title, artist, or keyword.",
  },
  {
    id: "explore-pin-details",
    target: "[data-tour='section-heading']",
    title: "Pin & Open Exhibits",
    body: "Use the pin next to an exhibit section to keep it at the top. Tap an exhibit name to open its full details page.",
    navTo: "explore",
  },
  {
    id: "news-nav",
    target: "[data-tour='nav-news']",
    title: "Art News",
    body: "Visit News to keep up with museum updates and featured stories.",
    navTo: "news",
  },
  {
    id: "settings-nav",
    target: "[data-tour='nav-settings']",
    title: "Settings",
    body: "Open Settings anytime to replay this tour or switch into a full account experience.",
    navTo: "settings",
  },
  {
    id: "settings-tour",
    target: "[data-tour='settings-tour-btn']",
    title: "Replay Tour",
    body: "You can always run this walkthrough again from the Take the tour button.",
  },
  {
    id: "done",
    target: null,
    title: "You're All Set! 🎉",
    body: "You're ready to explore TigerArt as a guest. Make an account anytime to unlock personalized features.",
  },
];

type UseTourOptions = {
  autoStart?: boolean;
  onNavigate?: (navId: string) => void;
  getTourStats?: () => { favoritesCount: number; recentlyViewedCount: number };
  isGuest?: boolean;
};

export function useTour(options: UseTourOptions = {}) {
  const { onNavigate, isGuest = false } = options;
  const activeSteps = isGuest ? GUEST_TOUR_STEPS : TOUR_STEPS;

  const [status, setStatus] = useState<TourStatus>({
    active: false,
    step: "welcome",
    likesRequired: 2,
    likesCompleted: 0,
    modalsRequired: 2,
    modalsOpened: 0,
  });

  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    const onFavorite = () => {
      if (!statusRef.current.active || statusRef.current.step !== "like-photos")
        return;
      setStatus((p) => ({
        ...p,
        likesCompleted: Math.min(p.likesCompleted + 1, p.likesRequired),
      }));
    };
    const onModal = () => {
      if (!statusRef.current.active || statusRef.current.step !== "open-modals")
        return;
      setStatus((p) => ({
        ...p,
        modalsOpened: Math.min(p.modalsOpened + 1, p.modalsRequired),
      }));
    };
    window.addEventListener(TOUR_EVENTS.FAVORITE_TOGGLED, onFavorite);
    window.addEventListener(TOUR_EVENTS.MODAL_OPENED, onModal);
    return () => {
      window.removeEventListener(TOUR_EVENTS.FAVORITE_TOGGLED, onFavorite);
      window.removeEventListener(TOUR_EVENTS.MODAL_OPENED, onModal);
    };
  }, []);

  const startTour = useCallback(() => {
    setStatus({
      active: true,
      step: activeSteps[0]?.id ?? "welcome",
      likesRequired: 2,
      likesCompleted: 0,
      modalsRequired: 2,
      modalsOpened: 0,
    });
    onNavigate?.(isGuest ? "explore" : "home");
  }, [activeSteps, isGuest, onNavigate]);

  const advanceStep = useCallback(() => {
    const idx = activeSteps.findIndex((s) => s.id === statusRef.current.step);
    const next = activeSteps[idx + 1];
    if (!next) {
      setStatus((p) => ({ ...p, active: false }));
      return;
    }
    if (next.navTo) onNavigate?.(next.navTo);
    setStatus((p) => ({ ...p, step: next.id }));
  }, [activeSteps, onNavigate]);

  const goBack = useCallback(() => {
    const idx = activeSteps.findIndex((s) => s.id === statusRef.current.step);
    if (idx <= 0) return;
    const prev = activeSteps[idx - 1];
    if (prev.navTo) onNavigate?.(prev.navTo);
    setStatus((p) => ({ ...p, step: prev.id }));
  }, [activeSteps, onNavigate]);

  const endTour = useCallback(() => {
    setStatus((p) => ({ ...p, active: false }));
  }, []);

  const currentStepMeta =
    activeSteps.find((s) => s.id === status.step) ?? activeSteps[0];
  const stepIndex = activeSteps.findIndex((s) => s.id === status.step);
  const totalSteps = activeSteps.length;
  const canGoBack = stepIndex > 0;

  const canAdvance = (() => {
    if (!currentStepMeta.interactive) return true;
    if (status.step === "like-photos")
      return status.likesCompleted >= status.likesRequired;
    if (status.step === "open-modals")
      return status.modalsOpened >= status.modalsRequired;
    return true;
  })();

  return {
    status,
    currentStepMeta,
    stepIndex,
    totalSteps,
    canAdvance,
    canGoBack,
    startTour,
    advanceStep,
    goBack,
    endTour,
  };
}
