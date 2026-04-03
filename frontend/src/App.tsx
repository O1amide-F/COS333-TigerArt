import { useEffect, useState, type ReactNode } from "react";
import "./App.css";
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { BottomNav } from "./components/BottomNav";
import { ExploreScreen } from "./screens/ExploreScreen";
import { ExhibitDetailScreen } from "./screens/ExhibitDetailScreen";
import { FavoritesScreen } from "./screens/FavoritesScreen";
import { ForYouScreen } from "./screens/ForYouScreen";
import { NewsScreen } from "./screens/NewsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SurveyScreen } from "./screens/SurveyScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { msalInstance, msalInitPromise, getUserProfile } from "./auth"; 
import { theme } from "./theme";
import type { ExhibitSection, NavId, Screen } from "./types";

const NAV_TO_SCREEN: Record<NavId, Screen> = {
  home: "home",
  explore: "explore",
  favorites: "favorites",
  news: "news",
  settings: "settings",
};

const FAVORITES_STORAGE_KEY = "tigerart:favorites";

function getInitialFavorites(): number[] {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is number => Number.isInteger(value));
  } catch {
    return [];
  }
}

function TigerArtAuthenticated() {
  const [screen, setScreen] = useState<Screen>("survey");
  const [favorites, setFavorites] = useState<number[]>(getInitialFavorites);
  const [activeSection, setActiveSection] = useState<ExhibitSection | null>(null);
  const [activeNav, setActiveNav] = useState<NavId>("home");
  const [surveySelections, setSurveySelections] = useState<number[]>([]);
  const [username, setUsername] = useState("Username");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (!profile) return;
      setUsername(profile.displayName);
    });
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

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

  const handleSectionClick = (section: ExhibitSection) => {
    setActiveSection(section);
    setScreen("exhibitDetail");
  };

  const templateContext = {
    favorites, activeSection, surveySelections, username, profileImage,
    toggleFavorite, toggleSurveySelection, handleSectionClick,
    setScreen, setActiveNav, setSurveySelections, setUsername, setProfileImage,
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
        profileImage={templateContext.profileImage}
      />
    ),
    home: (
      <ForYouScreen
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
      />
    ),
    explore: (
      <ExploreScreen
        onSectionClick={templateContext.handleSectionClick}
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
      />
    ),
    exhibitDetail: templateContext.activeSection ? (
      <ExhibitDetailScreen
        section={templateContext.activeSection}
        onBack={() => templateContext.setScreen("explore")}
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
      />
    ) : null,
    favorites: (
      <FavoritesScreen
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
        onSave={() => {
          if (templateContext.surveySelections.length === 3) {
            templateContext.setScreen("home");
            templateContext.setActiveNav("home");
          }
        }}
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
        <div className="tiger-art-shell" style={{ backgroundColor: theme.colors.bg }}>

          {/* Sidebar / bottom nav — hidden during survey */}
          {screen !== "survey" && (
            <div className="tiger-art-bottom-nav">
              <BottomNav activeNav={activeNav} onNavigate={handleNav} />
            </div>
          )}

          {/* Main content */}
          <div className="tiger-art-content">
            {templates[screen]}
          </div>

        </div>
      </div>
    </>
  );
}

// ── Root export — waits for MSAL to initialize before rendering ──────
export default function TigerArt() {
  const [msalReady, setMsalReady] = useState(false); 

useEffect(() => {
  msalInitPromise
    .then(() => {
      setMsalReady(true);
    })
    .catch((error) => {
      console.error("MSAL init error:", error);
      setMsalReady(true); // still render the app even if init fails
    });
}, []);                                          

  if (!msalReady) return null;                       

  return (
    <MsalProvider instance={msalInstance}>
      <UnauthenticatedTemplate>
        <LoginScreen />
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <TigerArtAuthenticated />
      </AuthenticatedTemplate>
    </MsalProvider>
  );
}