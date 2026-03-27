import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { getForYouItems } from "../new_data";
import type { ForYouItem } from "../types";
import { C } from "../theme";

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
          color: C.text,
        }}
      >
        For You Page
      </h1>

      <p
        style={{
          margin: "0 0 20px",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: C.muted,
          background: C.surface,
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
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              background: "#fff",
              padding: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: C.text,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {item.title}
              </span>

              <button
                onClick={() => onToggleFavorite(item.id)}
                style={{
                  background: "none",
                  border: "none",
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
                  color={favorites.includes(item.id) ? "#E53935" : C.border}
                  fill={favorites.includes(item.id) ? "#E53935" : "none"}
                />
              </button>
            </div>

            <div
              style={{
                background: C.surface,
                borderRadius: 4,
                padding: "8px 10px",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                color: C.muted,
              }}
            >
              {item.about}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}