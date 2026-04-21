import { useCallback, useEffect, useState, type ReactNode } from "react";
import "./App.css";
import { useTour } from "./hooks/useTour";
import "./tour";
import { BottomNav } from "./components/BottomNav";
import { ExploreScreen } from "./screens/ExploreScreen";
import { ExhibitDetailScreen } from "./screens/ExhibitDetailScreen";
import { FavoritesScreen } from "./screens/FavoritesScreen";
import { RecentlyViewedScreen } from "./screens/RecentlyViewedScreen";
import { ForYouScreen } from "./screens/ForYouScreen";
import { NewsScreen } from "./screens/NewsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SurveyScreen } from "./screens/SurveyScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { theme } from "./theme";
import type { ExhibitSection, NavId, Screen } from "./types";

const API_BASE = "/api";
const GUEST_ID_STORAGE_KEY = "tigerart.localGuestId";

function getOrCreateGuestId(): string {
  const existing = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (existing) return existing;

  const generated = `guest-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(GUEST_ID_STORAGE_KEY, generated);
  return generated;
}

const NAV_TO_SCREEN: Record<NavId, Screen> = {
  home: "home",
  explore: "explore",
  favorites: "favorites",
  news: "news",
  settings: "settings",
  recently_viewed: "recently_viewed",
};

function TigerArtAuthenticated({
  isGuest = false,
  initialUsername = "",
  initialDisplayName = "",
}: {
  isGuest?: boolean;
  initialUsername?: string;
  initialDisplayName?: string;
}) {
  const [screen, setScreen] = useState<Screen>("survey");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [activeSection, setActiveSection] = useState<ExhibitSection | null>(
    null,
  );
  const [activeNav, setActiveNav] = useState<NavId>("home");
  const [surveySelections, setSurveySelections] = useState<number[]>([]);
  const username = isGuest ? "Guest" : initialUsername;
  const displayName = isGuest ? "Guest" : initialDisplayName || initialUsername;
  const userId = isGuest ? null : initialUsername || null;

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    setScreen(NAV_TO_SCREEN[id]);
  };

  const { startTour } = useTour({
    autoStart: false,
    onNavigate: handleNav,
    getTourStats: () => ({
      favoritesCount: favorites.length,
      recentlyViewedCount: recentlyViewed.length,
    }),
  });

  // On login: load userId, favorites, recently viewed from backend
  useEffect(() => {
    if (isGuest) {
      // Skip auth fetches for guests and go straight to survey/home flow.
      setScreen("survey");
      return;
    }
    if (!initialUsername) return;
    async function loadUserData() {
      // Load favorited artwork IDs
      try {
        const favRes = await fetch(
          `${API_BASE}/favorites/${initialUsername}/ids`,
        );
        if (favRes.ok) {
          const ids: number[] = await favRes.json();
          setFavorites(ids);
        }
      } catch (e) {
        console.error("Failed to load favorites:", e);
      }

      // Load recently viewed artwork IDs
      try {
        const rvRes = await fetch(
          `${API_BASE}/recently-viewed/${initialUsername}/ids`,
        );
        if (rvRes.ok) {
          const ids: number[] = await rvRes.json();
          setRecentlyViewed(ids);
        }
      } catch (e) {
        console.error("Failed to load recently viewed:", e);
      }

      // Skip survey if user already has a feature vector
      try {
        const res = await fetch(`${API_BASE}/for-you/${initialUsername}`);
        if (res.ok) {
          setScreen("home");
          setActiveNav("home");
        }
      } catch (e) {
        console.error("Failed to check user preferences:", e);
      }
    }
    loadUserData().catch(console.error);
  }, [isGuest, initialUsername]);

  // Single source of truth for toggling favorites
  const toggleFavorite = async (id: number) => {
    const isFavorited = favorites.includes(id);

    if (isGuest) {
      // Guest mode is local-only: keep interaction behavior but skip DB writes.
      setFavorites((prev) =>
        isFavorited ? prev.filter((x) => x !== id) : [...prev, id],
      );
      return;
    }

    if (!userId) {
      console.warn("toggleFavorite called before userId resolved");
      return;
    }

    const method = isFavorited ? "DELETE" : "POST";
    try {
      const res = await fetch(`${API_BASE}/favorites/${userId}/${id}`, {
        method,
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setFavorites((prev) =>
        isFavorited ? prev.filter((x) => x !== id) : [...prev, id],
      );
    } catch (e) {
      console.error("Failed to toggle favorite:", e);
    }
  };

  // Shared view recorder: guests update local state only; signed-in users also sync to backend.
  const recordRecentlyViewed = useCallback((objectId?: number) => {
    if (!objectId) return;

    if (!isGuest && userId) {
      fetch(`${API_BASE}/recently-viewed/${userId}/${objectId}`, {
        method: "POST",
      }).catch(console.error);
    }

    setRecentlyViewed((prev) =>
      [objectId, ...prev.filter((id) => id !== objectId)].slice(0, 15),
    );
  }, [isGuest, userId]);

  // Records the view on the backend + updates local state, then navigates
  const handleSectionClick = (section: ExhibitSection) => {
    recordRecentlyViewed(section.items[0]?.id);
    setActiveSection(section);
    setScreen("exhibitDetail");
  };

  const toggleSurveySelection = (id: number) => {
    setSurveySelections((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };

  const templateContext = {
    favorites,
    recentlyViewed,
    activeSection,
    surveySelections,
    username,
    displayName,
    userId,
    toggleFavorite,
    toggleSurveySelection,
    handleSectionClick,
    setScreen,
    setActiveNav,
    setSurveySelections,
  };

  const templates: Record<Screen, ReactNode> = {
    login: null,
    survey: (
      <SurveyScreen
        onContinue={(selected) => {
          templateContext.setSurveySelections(selected);
          templateContext.setScreen("home");
          templateContext.setActiveNav("home");

          // Launch the tour only after survey submission completes and home UI is rendered.
          setTimeout(() => {
            startTour();
          }, 800);
        }}
        username={templateContext.username}
        displayName={templateContext.displayName}
        userId={templateContext.userId}
        isGuest={isGuest}
      />
    ),
    home: (
      <ForYouScreen
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
        userId={templateContext.userId}
        isGuest={isGuest}
        seedObjectIds={templateContext.surveySelections}
        onRecordView={recordRecentlyViewed}
      />
    ),
    explore: (
      <ExploreScreen
        userId={templateContext.userId}
        onSectionClick={templateContext.handleSectionClick}
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
        onRecordView={recordRecentlyViewed}
      />
    ),
    exhibitDetail: templateContext.activeSection ? (
      <ExhibitDetailScreen
        userId={templateContext.userId}
        section={templateContext.activeSection}
        onBack={() => templateContext.setScreen("explore")}
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
        onRecordView={recordRecentlyViewed}
      />
    ) : null,
    favorites: (
      <FavoritesScreen
        userId={templateContext.userId}
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
        onNavHome={() => {
          templateContext.setScreen("home");
          templateContext.setActiveNav("home");
        }}
      />
    ),
    news: <NewsScreen />,
    settings: (
      <SettingsScreen
        username={templateContext.username}
        displayName={templateContext.displayName}
        userId={templateContext.userId}
        isGuest={isGuest}
        onStartTour={startTour}
        onSave={() => {
          if (templateContext.surveySelections.length === 3) {
            templateContext.setScreen("home");
            templateContext.setActiveNav("home");
          }
        }}
      />
    ),
    recently_viewed: (
      <RecentlyViewedScreen
        userId={templateContext.userId}
        recentIds={templateContext.recentlyViewed}
        onSectionClick={templateContext.handleSectionClick}
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
      />
    ),
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="tiger-art-app">
        <div
          className="tiger-art-shell"
          style={{ backgroundColor: theme.colors.bg }}
        >
          {screen !== "survey" && (
            <div className="tiger-art-bottom-nav">
              <BottomNav activeNav={activeNav} onNavigate={handleNav} />
            </div>
          )}
          <div className="tiger-art-content">{templates[screen]}</div>
        </div>
      </div>
    </>
  );
}

export default function TigerArt() {
  const [username, setUsername] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/getusername", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          setReady(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.username) setUsername(data.username);
        if (data?.displayName) setDisplayName(data.displayName);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) return null;
  if (isGuest)
    return (
      <TigerArtAuthenticated
        isGuest
        initialUsername={guestId ?? getOrCreateGuestId()}
        initialDisplayName="Guest"
      />
    );
  if (!username)
    return (
      <LoginScreen
        onGuestLogin={() => {
          const localGuestId = getOrCreateGuestId();
          setGuestId(localGuestId);
          setIsGuest(true);
        }}
      />
    );
  return (
    <TigerArtAuthenticated
      initialUsername={username}
      initialDisplayName={displayName ?? username}
    />
  );
}
