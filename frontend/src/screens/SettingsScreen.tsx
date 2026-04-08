import { Check } from "lucide-react";
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

      {/* Profile settings card component */}
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
          {/* username as plain text */}
          <span style={{
            fontSize: 18,
            fontFamily: "'DM Sans', sans-serif",
            color: theme.colors.text,
            fontWeight: 1000,
          }}>
            {username}
          </span>

          {/* Sign Out button */}
          <button
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
            Sign Out
          </button>
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
