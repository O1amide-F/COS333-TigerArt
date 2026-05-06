import { useState, useEffect } from "react";
import { theme } from "../theme";
import { SurveyFlow } from "../components/SurveyFlow";
import { goToBackendAuthPath } from "../utils/authRedirect";

type SettingsScreenProps = {
  username: string;
  displayName?: string;
  isGuest?: boolean;
  onUsernameChange?: (value: string) => void;
  profileImage?: string | null;
  onProfileImageChange?: (value: string | null) => void;
  selected?: number[];
  onToggleSelection?: (id: number) => void;
  onSave: () => void;
  userId: string | null;
  onStartTour: () => void;
  onRequireAccount?: () => void;
  autoOpenSurvey?: boolean;
};

export function SettingsScreen({
  username,
  displayName,
  isGuest = false,
  onSave,
  userId,
  onStartTour,
  onRequireAccount,
  autoOpenSurvey = false,
}: SettingsScreenProps) {
  const [showSurvey, setShowSurvey] = useState(autoOpenSurvey);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (autoOpenSurvey) setShowSurvey(true);
  }, [autoOpenSurvey]);

  const handleLoginScreen = () => {
    localStorage.removeItem("tigerart.screen");
    localStorage.removeItem("tigerart.activeNav");
    if (isGuest) {
      // guests go to login choice screen; clear guest state
      localStorage.removeItem("tigerart.isGuest");
      localStorage.removeItem("tigerart.localGuestId");
      goToBackendAuthPath("/login");
    } else {
      // logged-in users logout
      goToBackendAuthPath("/logoutapp");
    }
  };

  const handleSurveySaved = () => {
    setShowSurvey(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
    onSave();
  };

  return (
    <div
      style={{ padding: "0px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* ── Sticky header: title only ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: theme.colors.bg,
          paddingTop: 16,
          paddingBottom: 8,
          marginBottom: 8,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: theme.components.badge.text,
          }}
        >
          Settings
        </h1>
      </div>

      {/* Profile card */}
      <div
        style={{
          border: `1px solid ${theme.components.card.border}`,
          borderRadius: 10,
          padding: 16,
          background: theme.components.card.background,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.colors.text,
              fontWeight: 600,
            }}
          >
            {isGuest ? "Guest" : displayName || username}
          </span>
          {isGuest ? (
            <button
              onClick={handleLoginScreen}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: theme.components.button.primaryBackground,
                color: theme.components.button.primaryText,
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                border: "none",
              }}
            >
              Log In
            </button>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem("tigerart.screen");
                localStorage.removeItem("tigerart.activeNav");
                goToBackendAuthPath("/logoutentra");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: theme.components.button.primaryBackground,
                color: theme.components.button.primaryText,
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                border: "none",
              }}
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* ── Tour target: preferences card ── */}
      <div
        data-tour="settings-preferences"
        style={{
          border: `1px solid ${theme.components.card.border}`,
          borderRadius: 10,
          padding: 16,
          background: theme.components.card.background,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: showSurvey ? 20 : 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                color: theme.components.badge.text,
                marginBottom: 2,
              }}
            >
              Art Preferences
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                color: theme.components.badge.mutedText,
              }}
            >
              {isGuest
                ? "Make an account to set personalized preferences"
                : showSurvey
                  ? "Select 3 images per question"
                  : "Retake the survey to update your For You feed"}
            </div>
          </div>
          <button
            onClick={() => {
              if (isGuest) {
                onRequireAccount?.();
                return;
              }
              setShowSurvey((v) => !v);
            }}
            style={{
              background: isGuest
                ? theme.components.badge.background
                : showSurvey
                  ? theme.components.badge.background
                  : theme.components.button.primaryBackground,
              color: isGuest
                ? theme.components.badge.mutedText
                : showSurvey
                  ? theme.components.badge.mutedText
                  : theme.components.button.primaryText,
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              opacity: isGuest ? 0.65 : 1,
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            {isGuest ? "Locked" : showSurvey ? "Cancel" : "Retake Survey"}
          </button>
        </div>

        {savedMessage && (
          <div
            style={{
              marginTop: 12,
              padding: "8px 12px",
              borderRadius: 6,
              background: "#e8f5e9",
              color: "#2e7d32",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              textAlign: "center",
            }}
          >
            Preferences saved! Your For You feed will update.
          </div>
        )}

        {!isGuest && showSurvey && (
          <div style={{ marginTop: 4 }}>
            <SurveyFlow
              userId={userId}
              onComplete={handleSurveySaved}
              completeLabel="Save Changes"
              persistToDb={!isGuest}
            />
          </div>
        )}
      </div>

      {/* ── Tour target: take the tour card ── */}
      <div
        data-tour="settings-tour"
        style={{
          border: `1px solid ${theme.components.card.border}`,
          borderRadius: 10,
          padding: 16,
          background: theme.components.card.background,
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.badge.text,
              marginBottom: 2,
            }}
          >
            App Tour
          </div>
          <div
            style={{
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.badge.mutedText,
            }}
          >
            Replay the guided walkthrough
          </div>
        </div>
        <button
          data-tour="settings-tour-btn"
          onClick={onStartTour}
          style={{
            background: theme.components.button.primaryBackground,
            color: theme.components.button.primaryText,
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          Take the tour
        </button>
      </div>
    </div>
  );
}
