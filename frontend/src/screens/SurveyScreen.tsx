import { useState } from "react";
import { Check } from "lucide-react";
import { SURVEY_IMAGES } from "../data";
import { theme } from "../theme";
import { Placeholder } from "../components/Placeholder";

type SurveyScreenProps = {
  onContinue: (selected: number[]) => void;
  username: string;
  profileImage: string | null;
};

export function SurveyScreen({
  onContinue,
  username,
  profileImage,
}: SurveyScreenProps) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };

  return (
    <div
      style={{ padding: "24px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* Header cluster component (avatar, username badge, title). */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {/* Profile avatar component with fallback text when no image exists. */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: theme.components.badge.background,
            border: `2px solid ${theme.components.card.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.components.badge.mutedText,
            fontSize: 11,
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "center",
            lineHeight: 1.3,
            overflow: "hidden",
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <>
              Profile
              <br />
              Pic
            </>
          )}
        </div>

        {/* Username badge component. */}
        <div
          style={{
            background: theme.components.badge.background,
            borderRadius: 4,
            padding: "4px 16px",
            color: theme.components.badge.mutedText,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {username || "Username"}
        </div>

        {/* Survey title component. */}
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: theme.components.badge.text,
          }}
        >
          Survey Preferences
        </h2>
      </div>

      {/* Instruction banner component showing remaining required selections. */}
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
        {selected.length != 3 && (
          <p>
            Select{" "}
            {3 - selected.length > 0 ? `${3 - selected.length} more` : "3"}{" "}
            image{3 - selected.length !== 1 ? "s" : ""} to get started with your
            art journey
          </p>
        )}
        {selected.length === 3 && (
          <p>
            Great choices! Click continue to explore your personalized art
            experience.
          </p>
        )}
      </div>

      {/* Selectable survey image grid component. */}
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
            // Selectable survey card component.
            <div
              key={id}
              onClick={() => toggle(id)}
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

      {/* Continue action component enabled once exactly three images are selected. */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => selected.length === 3 && onContinue(selected)}
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
          Continue
        </button>
      </div>
    </div>
  );
}
