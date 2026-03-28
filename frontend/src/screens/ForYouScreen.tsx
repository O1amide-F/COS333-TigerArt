import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { Placeholder } from "../components/Placeholder";
import { getForYouItems } from "../new_data";
import type { ForYouItem } from "../types";
import { theme } from "../theme";

type ForYouScreenProps = {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

export function ForYouScreen({
  favorites,
  onToggleFavorite,
}: ForYouScreenProps) {
  const [items, setItems] = useState<ForYouItem[]>([]);

  useEffect(() => {
    getForYouItems()
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching For You items:", error));
  }, []);

  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <SearchBar />

      <h1
        style={{
          margin: "0 0 4px",
          fontSize: 24,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          color: theme.components.badge.text,
        }}
      >
        For You Page
      </h1>

      <p
        style={{
          margin: "0 0 20px",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: theme.components.badge.mutedText,
          background: theme.components.badge.background,
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: 4,
        }}
      >
        Curated according to your preferences
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: `1px solid ${theme.components.card.border}`,
              borderRadius: 8,
              overflow: "hidden",
              background: theme.components.card.background,
            }}
          >
            <Placeholder
              label="Image"
              aspectRatio="4/3"
              style={{ borderRadius: 0 }}
            />

            <div style={{ padding: "10px 12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: theme.components.badge.text,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {item.title}
                </span>

                <button
                  onClick={() => onToggleFavorite(item.id)}
                  style={{
                    background: theme.components.button.ghostBackground,
                    border: theme.components.button.ghostBorder,
                    cursor: "pointer",
                    transition: "color 0.2s, transform 0.15s",
                    transform: favorites.includes(item.id)
                      ? "scale(1.2)"
                      : "scale(1)",
                  }}
                >
                  <Heart
                    size={18}
                    strokeWidth={2.2}
                    color={
                      favorites.includes(item.id)
                        ? theme.components.favorite.active
                        : theme.components.favorite.inactive
                    }
                    fill={
                      favorites.includes(item.id)
                        ? theme.components.favorite.active
                        : "none"
                    }
                  />
                </button>
              </div>

              <div
                style={{
                  background: theme.components.badge.background,
                  borderRadius: 4,
                  padding: "8px 10px",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  color: theme.components.badge.mutedText,
                }}
              >
                {item.about}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
