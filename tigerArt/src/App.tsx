import { useState } from "react";
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

export default function TigerArt() {
  const [screen, setScreen] = useState<Screen>("survey");
  const [favorites, setFavorites] = useState<number[]>([]);
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

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    if (id === "home") setScreen("home");
    else if (id === "explore") setScreen("explore");
    else if (id === "favorites") setScreen("favorites");
    else if (id === "news") setScreen("news");
    else if (id === "settings") setScreen("settings");
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

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="tiger-art-app">
        <div className="tiger-art-shell">
          <div className="tiger-art-content">
            {screen === "survey" && (
              <SurveyScreen
                onContinue={(selected) => {
                  setSurveySelections(selected);
                  setScreen("home");
                  setActiveNav("home");
                }}
                username={username}
                profileImage={profileImage}
              />
            )}

            {screen === "home" && (
              <ForYouScreen
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}

            {screen === "explore" && (
              <ExploreScreen onSectionClick={handleSectionClick} />
            )}

            {screen === "exhibitDetail" && activeSection && (
              <ExhibitDetailScreen
                section={activeSection}
                onBack={() => setScreen("explore")}
              />
            )}

            {screen === "favorites" && (
              <FavoritesScreen
                favorites={favorites}
                onNavHome={() => {
                  setScreen("home");
                  setActiveNav("home");
                }}
              />
            )}

            {screen === "news" && <NewsScreen />}

            {screen === "settings" && (
              <SettingsScreen
                username={username}
                onUsernameChange={setUsername}
                profileImage={profileImage}
                onProfileImageChange={setProfileImage}
                selected={surveySelections}
                onToggleSelection={toggleSurveySelection}
                onSave={() => {
                  if (surveySelections.length === 3) {
                    setScreen("home");
                    setActiveNav("home");
                  }
                }}
              />
            )}
          </div>

          {screen !== "survey" && (
            <BottomNav activeNav={activeNav} onNavigate={handleNav} />
          )}
        </div>
      </div>
    </>
  );
}
