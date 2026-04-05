import { Camera, Check } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SURVEY_IMAGES } from "../data";
import { theme } from "../theme";
import { useMsal } from "@azure/msal-react";

type SettingsScreenProps = {
  username: string;
  onUsernameChange: (value: string) => void;
  profileImage: string | null;
  onProfileImageChange: (value: string | null) => void;
  selected: number[];
  onToggleSelection: (id: number) => void;
  onSave: () => void;
};


export function SettingsScreen({
  username,
  onUsernameChange,
  profileImage,
  onProfileImageChange,
  selected,
  onToggleSelection,
  onSave,
}: SettingsScreenProps) {
  
  const msal = useMsal();
  const instance = msal.instance;
  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* Page title component for user settings. */}
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

      {/* Profile settings card component (avatar upload + username input). */}
      <div
        style={{
          border: `1px solid ${theme.components.card.border}`,
          borderRadius: 10,
          padding: 16,
          background: theme.components.card.background,
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Left — Avatar + Upload Photo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Avatar preview component showing uploaded image or initials. */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                overflow: "hidden",
                background: theme.components.badge.background,
                border: `2px solid ${theme.components.card.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.components.badge.mutedText,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                (username || "U").slice(0, 2).toUpperCase()
              )}
            </div>

            {/* File upload trigger component for profile photo changes. */}
            <label
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
              }}
            >
              <Camera size={15} strokeWidth={2} />
              Upload Photo
            {/* Hidden input component that captures image selection events. */}              
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onProfileImageChange(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>

          {/* Right — Log Out */}
          <button
            //onClick={() => instance.logoutRedirect()}    
            onClick={async () => {
              await instance.clearCache();
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
            Log Out
          </button>

        </div>
        {/* Username form field component. */}
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 12,
              color: theme.components.input.mutedText,
              marginBottom: 6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Username
          </div>
          <input
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Enter username"
            style={{
              width: "100%",
              border: `1px solid ${theme.components.input.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              color: theme.components.input.text,
              background: theme.components.input.background,
            }}
          />
        </div>
      </div>

      {/* Survey status banner component showing selected-count progress. */}
      <div
        style={{
          background: theme.components.badge.background,
          borderRadius: 6,
          padding: "10px 14px",
          textAlign: "center",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: theme.components.badge.text,
          marginBottom: 20,
        }}
      >
        Update your survey preferences ({selected.length}/3 selected)
      </div>

      {/* Preference image grid component for survey choices. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {SURVEY_IMAGES.map((id) => {
          const isSelected = selected.includes(id);
          return (
            // Selectable preference card component.
            <div
              key={id}
              onClick={() => onToggleSelection(id)}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: isSelected
                  ? `2px solid ${theme.components.button.primaryBackground}`
                  : `2px solid ${theme.components.card.border}`,
                cursor: "pointer",
                transition: "border-color 0.2s, transform 0.15s",
                transform: isSelected ? "scale(0.97)" : "scale(1)",
                background: theme.components.card.background,
              }}
            >
              <Placeholder label={`Image ${id}`} aspectRatio="4/3" />
              <div
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 6,
                    background: theme.components.divider.color,
                    borderRadius: 3,
                  }}
                />
                {/* Selected-state icon component. */}
                {isSelected && (
                  <Check
                    size={14}
                    strokeWidth={2.5}
                    color={theme.components.button.primaryBackground}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save action component enabled only when selection count is valid. */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onSave}
          style={{
            background:
              selected.length === 3
                ? theme.components.button.primaryBackground
                : theme.components.button.disabledBackground,
            color:
              selected.length === 3
                ? theme.components.button.primaryText
                : theme.components.button.disabledText,
            border: theme.components.button.ghostBorder,
            borderRadius: 6,
            padding: "10px 24px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: selected.length === 3 ? "pointer" : "default",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
