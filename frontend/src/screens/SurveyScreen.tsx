import { useState } from "react";
import { Check } from "lucide-react";
import { SURVEY_IMAGES } from "../data";
import { C } from "../theme";
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: C.surface,
            border: `2px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.muted,
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

        <div
          style={{
            background: C.surface,
            borderRadius: 4,
            padding: "4px 16px",
            color: C.muted,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {username || "Username"}
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: C.text,
          }}
        >
          Survey Preferences
        </h2>
      </div>

      <div
        style={{
          background: C.surface,
          borderRadius: 6,
          padding: "10px 14px",
          textAlign: "center",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: C.text,
          marginBottom: 20,
        }}
      >
        Select {3 - selected.length > 0 ? `${3 - selected.length} more` : "3"}{" "}
        image{3 - selected.length !== 1 ? "s" : ""} to get started with your art
        journey
      </div>

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
            <div
              key={id}
              onClick={() => toggle(id)}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: isSelected
                  ? `2px solid ${C.navy}`
                  : `2px solid ${C.border}`,
                cursor: "pointer",
                transition: "border-color 0.2s, transform 0.15s",
                transform: isSelected ? "scale(0.97)" : "scale(1)",
                background: "#fff",
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
                    background: C.border,
                    borderRadius: 3,
                  }}
                />
                {isSelected && (
                  <Check size={14} strokeWidth={2.5} color={C.navy} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => selected.length === 3 && onContinue(selected)}
          style={{
            background: selected.length === 3 ? C.navy : C.surface,
            color: selected.length === 3 ? "#fff" : C.muted,
            border: "none",
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
