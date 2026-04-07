import { useMemo } from "react";
import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { theme } from "../theme";
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
  const shuffledItems = useMemo(
    () => [...section.items].sort(() => Math.random() - 0.5),
    [section]
  );

  const featuredItem = shuffledItems[0];

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <button
        onClick={onBack}
        style={{
          background: theme.components.button.ghostBackground,
          border: theme.components.button.ghostBorder,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          color: theme.components.badge.text,
          marginBottom: 12,
          padding: 0,
        }}
      >
        ← Back to Explore
      </button>

      <div
        style={{
          background: theme.components.badge.background,
          borderRadius: 4,
          padding: "6px 12px",
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          color: theme.components.badge.text,
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        {section.name}
      </div>

      {featuredItem && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ position: "relative" }}>
            {featuredItem.imageUrl ? (
              <img
                src={featuredItem.imageUrl}
                alt={featuredItem.name}
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  objectFit: "cover",
                  display: "block",
                  borderRadius: 4,
                }}
              />
            ) : (
              <Placeholder label="Unable to Render Image" aspectRatio="16/9" />
            )}
            <button
              onClick={() => onToggleFavorite(featuredItem.id)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(4px)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Heart
                size={16}
                strokeWidth={2.2}
                color={
                  favorites.includes(featuredItem.id)
                    ? theme.components.favorite.active
                    : "#fff"
                }
                fill={
                  favorites.includes(featuredItem.id)
                    ? theme.components.favorite.active
                    : "none"
                }
              />
            </button>
          </div>

          <div style={{ paddingTop: 8 }}>
            <div
              style={{
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: theme.components.badge.text,
                marginBottom: 4,
              }}
            >
              {featuredItem.name}
            </div>
            <div
              style={{
                width: 80,
                height: 5,
                background: theme.components.divider.color,
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          borderTop: `1px solid ${theme.components.divider.color}`,
          paddingTop: 14,
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 4,
        }}
      >
        {shuffledItems.slice(1).map((item) => (
          <div key={item.id}>
            <div style={{ position: "relative" }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    display: "block",
                    borderRadius: 4,
                  }}
                />
              ) : (
                <Placeholder label="Unable to Render Image" aspectRatio="1/1" />
              )}
              <button
                onClick={() => onToggleFavorite(item.id)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(4px)",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Heart
                  size={16}
                  strokeWidth={2.2}
                  color={
                    favorites.includes(item.id)
                      ? theme.components.favorite.active
                      : "#fff"
                  }
                  fill={
                    favorites.includes(item.id)
                      ? theme.components.favorite.active
                      : "none"
                  }
                />
              </button>
            </div>
            <div style={{ paddingTop: 6 }}>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: theme.components.badge.text,
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  width: 50,
                  height: 5,
                  background: theme.components.divider.color,
                  borderRadius: 3,
                  marginTop: 4,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}