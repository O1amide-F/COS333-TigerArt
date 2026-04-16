import { useEffect, useState, type ReactNode } from "react";
import "./App.css";
import {
  MsalProvider,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { useTour } from "./hooks/useTour";
import "./tour.css";
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
import { msalInstance, msalInitPromise, getUserProfile } from "./auth";
import { theme } from "./theme";
import type { ExhibitSection, NavId, Screen } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5001/api";

const NAV_TO_SCREEN: Record<NavId, Screen> = {
  home: "home",
  explore: "explore",
  favorites: "favorites",
  news: "news",
  settings: "settings",
  recently_viewed: "recently_viewed",
};

function TigerArtAuthenticated({ isGuest = false }: { isGuest?: boolean }) {
  const [screen, setScreen] = useState<Screen>("survey");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [activeSection, setActiveSection] = useState<ExhibitSection | null>(
    null,
  );
  const [activeNav, setActiveNav] = useState<NavId>("home");
  const [surveySelections, setSurveySelections] = useState<number[]>([]);
  const [username, setUsername] = useState("Username");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { startTour } = useTour({ autoStart: true });

  // On login: load userId, favorites, recently viewed from backend
  useEffect(() => {
    if (isGuest) {
      // Skip auth fetches for guests and go straight to survey/home flow.
      setScreen("survey");
      return;
    }

    getUserProfile().then(async (profile) => {
      if (!profile) return;
      setUsername(profile.displayName);
      setUserId(profile.userid);

      // Load favorited artwork IDs
      try {
        const favRes = await fetch(
          `${API_BASE}/favorites/${profile.userid}/ids`,
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
          `${API_BASE}/recently-viewed/${profile.userid}/ids`,
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
        const res = await fetch(`${API_BASE}/for-you/${profile.userid}`);
        if (res.ok) {
          setScreen("home");
          setActiveNav("home");
        }
      } catch (e) {
        console.error("Failed to check user preferences:", e);
      }
    });
  }, [isGuest]);

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
  const recordRecentlyViewed = (objectId?: number) => {
    if (!objectId) return;

    if (userId) {
      fetch(`${API_BASE}/recently-viewed/${userId}/${objectId}`, {
        method: "POST",
      }).catch(console.error);
    }

    setRecentlyViewed((prev) =>
      [objectId, ...prev.filter((id) => id !== objectId)].slice(0, 15),
    );
  };

  // Records the view on the backend + updates local state, then navigates
  const handleSectionClick = (section: ExhibitSection) => {
    recordRecentlyViewed(section.items[0]?.id);
    setActiveSection(section);
    setScreen("exhibitDetail");
  };

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    setScreen(NAV_TO_SCREEN[id]);
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
    profileImage,
    userId,
    toggleFavorite,
    toggleSurveySelection,
    handleSectionClick,
    setScreen,
    setActiveNav,
    setSurveySelections,
    setUsername,
    setProfileImage,
  };

  const templates: Record<Screen, ReactNode> = {
    login: null,
    survey: (
      <SurveyScreen
        onContinue={(selected) => {
          templateContext.setSurveySelections(selected);
          templateContext.setScreen("home");
          templateContext.setActiveNav("home");
        }}
        username={templateContext.username}
        userId={templateContext.userId}
      />
    ),
    home: (
      <ForYouScreen
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
        userId={templateContext.userId}
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
        onUsernameChange={templateContext.setUsername}
        profileImage={templateContext.profileImage}
        onProfileImageChange={templateContext.setProfileImage}
        selected={templateContext.surveySelections}
        onToggleSelection={templateContext.toggleSurveySelection}
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
        onRecordView={recordRecentlyViewed}
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
  const [msalReady, setMsalReady] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    msalInitPromise
      .then(() => setMsalReady(true))
      .catch((error) => {
        console.error("MSAL init error:", error);
        setMsalReady(true);
      });
  }, []);

  if (!msalReady) return null;

  return (
    <MsalProvider instance={msalInstance}>
      <UnauthenticatedTemplate>
        {isGuest ? (
          <TigerArtAuthenticated isGuest />
        ) : (
          <LoginScreen onGuestLogin={() => setIsGuest(true)} />
        )}
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <TigerArtAuthenticated />
      </AuthenticatedTemplate>
    </MsalProvider>
  );
}
