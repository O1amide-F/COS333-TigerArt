import { Camera, Check } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SURVEY_IMAGES } from "../data";
import { C } from "../theme";

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
  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <h1
        style={{
          margin: "0 0 20px",
          fontSize: 22,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          letterSpacing: "0.06em",
          color: C.text,
          background: C.surface,
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 4,
        }}
      >
        SETTINGS
      </h1>

      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: 16,
          background: "#fff",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              background: C.surface,
              border: `2px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.muted,
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

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.surface,
              color: C.text,
              borderRadius: 6,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Camera size={15} strokeWidth={2} />
            Upload Photo
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

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 12,
              color: C.muted,
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
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              color: C.text,
              background: C.bg,
            }}
          />
        </div>
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
        Update your survey preferences ({selected.length}/3 selected)
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
              onClick={() => onToggleSelection(id)}
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
          onClick={onSave}
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
          Save Changes
        </button>
      </div>
    </div>
  );
}
