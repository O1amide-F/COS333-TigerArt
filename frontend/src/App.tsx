import { useEffect, useState, type ReactNode } from "react";
import "./App.css";
import { BottomNav } from "./components/BottomNav";
import { ExploreScreen } from "./screens/ExploreScreen";
import { ExhibitDetailScreen } from "./screens/ExhibitDetailScreen";
import { FavoritesScreen } from "./screens/FavoritesScreen";
import { ForYouScreen } from "./screens/ForYouScreen";
import { NewsScreen } from "./screens/NewsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SurveyScreen } from "./screens/SurveyScreen";
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
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is number => Number.isInteger(value));
  } catch {
    return [];
  }
}

export default function TigerArt() {
  // App-level state acts like Flask view context shared across templates.
  const [screen, setScreen] = useState<Screen>("survey");
  const [favorites, setFavorites] = useState<number[]>(getInitialFavorites);
  const [activeSection, setActiveSection] = useState<ExhibitSection | null>(
    null,
  );
  const [activeNav, setActiveNav] = useState<NavId>("home");
  const [surveySelections, setSurveySelections] = useState<number[]>([]);
  const [username, setUsername] = useState("Username");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const handleNav = (id: NavId) => {
    // Route lookup table mirrors Flask's URL -> view mapping.
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

  // Template context: one object keeps all values/actions each screen might need.
  const templateContext = {
    favorites,
    activeSection,
    surveySelections,
    username,
    profileImage,
    toggleFavorite,
    toggleSurveySelection,
    handleSectionClick,
    setScreen,
    setActiveNav,
    setSurveySelections,
    setUsername,
    setProfileImage,
  };

  // Template renderer map: each entry returns the screen body for a "route".
  const templates: Record<Screen, ReactNode> = {
    // Onboarding survey component shown first.
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
    // Main home feed component (For You).
    home: (
      <ForYouScreen
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
      />
    ),
    // Explore list component with section previews.
    explore: (
      <ExploreScreen
        onSectionClick={templateContext.handleSectionClick}
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
      />
    ),
    // Detail component for the currently selected exhibit section.
    exhibitDetail: templateContext.activeSection ? (
      <ExhibitDetailScreen
        section={templateContext.activeSection}
        onBack={() => templateContext.setScreen("explore")}
        favorites={templateContext.favorites}
        onToggleFavorite={templateContext.toggleFavorite}
      />
    ) : null,
    // Favorites component for saved exhibits.
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
    // News component for museum updates.
    news: <NewsScreen />,
    // Settings component for profile and survey preferences.
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
        <div className="tiger-art-shell">
          {/* Active screen outlet component (like a Flask template render target). */}
          <div className="tiger-art-content">{templates[screen]}</div>

          {/* Bottom navigation component stays hidden during onboarding survey. */}
          {screen !== "survey" && (
            <BottomNav activeNav={activeNav} onNavigate={handleNav} />
          )}
        </div>
      </div>
    </>
  );
}
