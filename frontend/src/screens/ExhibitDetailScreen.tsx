import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { C } from "../theme";
import type { ExhibitSection } from "../types";

type ExhibitDetailScreenProps = {
  section: ExhibitSection;
  onBack: () => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

export function ExhibitDetailScreen({
  section,
  onBack,
  favorites,
  onToggleFavorite,
}: ExhibitDetailScreenProps) {
  const featuredItem = section.items[0];

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* Back navigation component to return to the Explore screen. */}
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          color: C.text,
          marginBottom: 12,
          padding: 0,
        }}
      >
        ← Back to Explore
      </button>

      {/* Section title badge component for the selected exhibit group. */}
      <div
        style={{
          background: C.surface,
          borderRadius: 4,
          padding: "6px 12px",
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          color: C.text,
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        {section.name}
      </div>

      {/* Featured artwork component showing the first item in the section. */}
      <div style={{ marginBottom: 10 }}>
        <Placeholder label="Image" aspectRatio="16/9" />
        <div
          style={{
            paddingTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: C.text,
                marginBottom: 4,
              }}
            >
              {featuredItem.name}
            </div>
            <div
              style={{
                width: 80,
                height: 5,
                background: C.border,
                borderRadius: 3,
              }}
            />
          </div>
          <button
            onClick={() => onToggleFavorite(featuredItem.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "transform 0.15s",
              transform: favorites.includes(featuredItem.id)
                ? "scale(1.2)"
                : "scale(1)",
            }}
            aria-label={`Toggle favorite for ${featuredItem.name}`}
          >
            <Heart
              size={18}
              strokeWidth={2.2}
              color={favorites.includes(featuredItem.id) ? "#E53935" : C.border}
              fill={favorites.includes(featuredItem.id) ? "#E53935" : "none"}
            />
          </button>
        </div>
      </div>

      {/* Divider component separating featured content from the gallery grid. */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }} />

      {/* Gallery grid component for the remaining section items. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 4,
        }}
      >
        {section.items.slice(1).map((item) => (
          // Gallery card component for one additional artwork.
          <div key={item.id}>
            <Placeholder label="Image" aspectRatio="1/1" />
            <div
              style={{
                paddingTop: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    width: 50,
                    height: 5,
                    background: C.border,
                    borderRadius: 3,
                    marginTop: 4,
                  }}
                />
              </div>
              <button
                onClick={() => onToggleFavorite(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "transform 0.15s",
                  transform: favorites.includes(item.id)
                    ? "scale(1.2)"
                    : "scale(1)",
                }}
                aria-label={`Toggle favorite for ${item.name}`}
              >
                <Heart
                  size={18}
                  strokeWidth={2.2}
                  color={favorites.includes(item.id) ? "#E53935" : C.border}
                  fill={favorites.includes(item.id) ? "#E53935" : "none"}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
