// App.tsx — wires TourOverlay into the shell and passes tour state down.
// Only the tour-related sections are changed; all screen/nav logic is identical.

import { useCallback, useEffect, useState, type ReactNode } from "react";
import "./App.css";
import { useTour } from "./hooks/useTour";
import { TourOverlay } from "./components/TourOverlay";
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

const GUEST_RESTRICTED_NAV: NavId[] = ["home", "favorites", "recently_viewed"];

function TigerArtAuthenticated({
  isGuest = false,
  initialUsername = "",
  initialDisplayName = "",
}: {
  isGuest?: boolean;
  initialUsername?: string;
  initialDisplayName?: string;
}) {
  const [screen, setScreen] = useState<Screen>(() => {
    if (isGuest) return "explore";
    const saved = localStorage.getItem("tigerart.screen") as Screen | null;
    return saved && saved !== "survey" ? saved : "survey";
  });
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [activeSection, setActiveSection] = useState<ExhibitSection | null>(
    null,
  );
  const [activeNav, setActiveNav] = useState<NavId>(() => {
    if (isGuest) return "explore";
    return (
      (localStorage.getItem("tigerart.activeNav") as NavId | null) ?? "home"
    );
  });

  const [surveySelections, setSurveySelections] = useState<number[]>([]);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [accountPromptMessage, setAccountPromptMessage] = useState(
    "Create an account to use this feature.",
  );
  const [autoOpenSurvey, setAutoOpenSurvey] = useState(false);

  useEffect(() => {
    if (!isGuest && screen !== "survey" && screen !== "exhibitDetail") {
      localStorage.setItem("tigerart.screen", screen);
      localStorage.setItem("tigerart.activeNav", activeNav);
    }
  }, [screen, activeNav, isGuest]);

  const username = isGuest ? "Guest" : initialUsername;
  const displayName = isGuest ? "Guest" : initialDisplayName || initialUsername;
  const userId = isGuest ? null : initialUsername || null;

  const showMakeAccountPrompt = useCallback((message?: string) => {
    if (message) setAccountPromptMessage(message);
    setShowAccountPrompt(true);
  }, []);

  useEffect(() => {
    if (!showAccountPrompt) return;
    const timeoutId = window.setTimeout(
      () => setShowAccountPrompt(false),
      2200,
    );
    return () => window.clearTimeout(timeoutId);
  }, [showAccountPrompt]);

  const handleNav = (id: NavId) => {
    if (id !== "settings") setAutoOpenSurvey(false); 
    if (isGuest && GUEST_RESTRICTED_NAV.includes(id)) {
      showMakeAccountPrompt();
      return;
    }
    setActiveNav(id);
    setScreen(NAV_TO_SCREEN[id]);
  };

  // ── Tour ──────────────────────────────────────────────────────────────────
  const {
    status: tourStatus,
    currentStepMeta,
    stepIndex,
    totalSteps,
    canAdvance,
    canGoBack,
    startTour,
    advanceStep,
    goBack,
    endTour,
  } = useTour({
    autoStart: false,
    isGuest,
    onNavigate: (navId) => handleNav(navId as NavId),
    getTourStats: () => ({
      favoritesCount: favorites.length,
      recentlyViewedCount: recentlyViewed.length,
    }),
  });

  // ── User data bootstrap ───────────────────────────────────────────────────
  useEffect(() => {
    if (isGuest) {
      setScreen("explore");
      setActiveNav("explore");
      return;
    }
    if (!initialUsername) return;

    async function loadUserData() {
      try {
        const favRes = await fetch(
          `${API_BASE}/favorites/${initialUsername}/ids`,
        );
        if (favRes.ok) setFavorites(await favRes.json());
      } catch (e) {
        console.error("Failed to load favorites:", e);
      }

      try {
        const rvRes = await fetch(
          `${API_BASE}/recently-viewed/${initialUsername}/ids`,
        );
        if (rvRes.ok) setRecentlyViewed(await rvRes.json());
      } catch (e) {
        console.error("Failed to load recently viewed:", e);
      }

      try {
        const res = await fetch(`${API_BASE}/for-you/${initialUsername}`);
        if (res.ok) {
          const savedScreen = localStorage.getItem("tigerart.screen");
          if (!savedScreen) {
            setScreen("home");
            setActiveNav("home");
          }
        }
      } catch (e) {
        console.error("Failed to check user preferences:", e);
      }
    }

    loadUserData().catch(console.error);
  }, [isGuest, initialUsername]);

  // ── Favorites ─────────────────────────────────────────────────────────────
  const toggleFavorite = async (id: number) => {
    const isFavorited = favorites.includes(id);
    if (isGuest) {
      showMakeAccountPrompt("Create an account to save favorites.");
      return;
    }
    if (!userId) return;
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

  // ── Recently viewed ───────────────────────────────────────────────────────
  const recordRecentlyViewed = useCallback(
    (objectId?: number) => {
      if (!objectId) return;
      if (!isGuest && userId) {
        fetch(`${API_BASE}/recently-viewed/${userId}/${objectId}`, {
          method: "POST",
        }).catch(console.error);
      }
      setRecentlyViewed((prev) =>
        [objectId, ...prev.filter((id) => id !== objectId)].slice(0, 15),
      );
    },
    [isGuest, userId],
  );

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
          setTimeout(() => startTour(), 800);
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
        // Pass tour state so ForYouScreen can fire tour events and optionally
        // show a subtle "tour mode" ring around the whole grid.
        tourActive={tourStatus.active}
        tourStep={tourStatus.step}
      />
    ),
    explore: (
      <ExploreScreen
        userId={templateContext.userId}
        isGuest={isGuest}
        onRequireAccount={showMakeAccountPrompt}
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
        onRequireAccount={showMakeAccountPrompt}
        autoOpenSurvey={autoOpenSurvey}
        onSave={() => {
          setAutoOpenSurvey(false);
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
              <BottomNav
                activeNav={activeNav}
                onNavigate={handleNav}
                disabledNavIds={isGuest ? GUEST_RESTRICTED_NAV : []}
                onLogout={isGuest ? undefined : () => {
                  localStorage.removeItem("tigerart.screen");
                  localStorage.removeItem("tigerart.activeNav");
                  window.location.href = "/logoutapp";
                }}
                onStartTour={startTour}
                onStartSurvey={() => {
                  setAutoOpenSurvey(true);
                  setScreen("settings");
                  setActiveNav("settings");
                }}
              />
            </div>
          )}
          <div className="tiger-art-content">{templates[screen]}</div>

          {showAccountPrompt && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: "fixed",
                right: 16,
                top: 16,
                background: "rgba(15, 25, 35, 0.96)",
                color: "#fff",
                borderRadius: 8,
                padding: "10px 12px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                lineHeight: 1.35,
                boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.12)",
                zIndex: 60,
                maxWidth: 260,
              }}
            >
              {accountPromptMessage}
            </div>
          )}
        </div>
      </div>

      {/* ── Tour overlay — rendered outside the app shell so z-index is unaffected ── */}
      <TourOverlay
        status={tourStatus}
        currentStepMeta={currentStepMeta}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        canAdvance={canAdvance}
        canGoBack={canGoBack}
        onBack={goBack}
        onNext={advanceStep}
        onExit={endTour}
      />
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
