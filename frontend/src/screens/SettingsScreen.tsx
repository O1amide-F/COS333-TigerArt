import { useState } from "react";
import { theme } from "../theme";
import { SurveyFlow } from "../components/SurveyFlow";
import { useMsal } from "@azure/msal-react";

type SettingsScreenProps = {
  username: string;
  onUsernameChange: (value: string) => void;
  profileImage: string | null;
  onProfileImageChange: (value: string | null) => void;
  selected: number[];
  onToggleSelection: (id: number) => void;
  onSave: () => void;
  userId: string | null;
  onStartTour: () => void;
  isGuest?: boolean;
};

export function SettingsScreen({
  username,
  onSave,
  userId,
  onStartTour,
  isGuest = false,
}: SettingsScreenProps) {
  const { instance } = useMsal();
  const [showSurvey, setShowSurvey] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSurveySaved = () => {
    setShowSurvey(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
    onSave();
  };

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* Title */}
      <h1
        style={{
          margin: "0 0 20px",
          fontSize: 22,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          letterSpacing: "0.06em",
          color: theme.components.badge.text,
          background: theme.components.badge.background,
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 4,
        }}
      >
        SETTINGS
      </h1>

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
            {isGuest ? "Hi, Guest" : username}
          </span>
          <button
            onClick={async () => {
              if (!isGuest) {
                await instance.clearCache();
              }
              window.location.reload();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: theme.components.badge.background,
              color: theme.components.badge.text,
              borderRadius: 6,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              border: "none",
            }}
          >
            {isGuest ? "Create Account" : "Sign Out"}
          </button>
        </div>
        {isGuest && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.badge.mutedText,
              lineHeight: 1.5,
            }}
          >
            Create an account to save favorites, recently viewed items, and your
            preferences across sessions.
          </div>
        )}
      </div>

      {/* Survey section */}
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
              {showSurvey
                ? "Select 3 images per question"
                : "Retake the survey to update your For You feed"}
            </div>
          </div>
          <button
            onClick={() => setShowSurvey((v) => !v)}
            style={{
              background: showSurvey
                ? theme.components.badge.background
                : theme.components.button.primaryBackground,
              color: showSurvey
                ? theme.components.badge.mutedText
                : theme.components.button.primaryText,
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            {showSurvey ? "Cancel" : "Retake Survey"}
          </button>
        </div>

        {/* Saved confirmation */}
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

        {/* Inline survey flow */}
        {showSurvey && (
          <div style={{ marginTop: 4 }}>
            <SurveyFlow
              userId={userId}
              onComplete={handleSurveySaved}
              completeLabel="Save Changes"
            />
          </div>
        )}
      </div>

      <div
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
