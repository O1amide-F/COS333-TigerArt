import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { Placeholder } from "../components/Placeholder";
import type { ForYouItem } from "../types";
import { theme } from "../theme";

const API_BASE = "http://localhost:5001/api";

// TODO: replace with your real auth/session user ID once login is implemented
const USER_ID = 1;

type ForYouScreenProps = {
  favorites: number[];
  onToggleFavorite: (id: number) => void;
};

export function ForYouScreen({
  favorites,
  onToggleFavorite,
}: ForYouScreenProps) {
  const [items, setItems] = useState<ForYouItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/for-you/${USER_ID}`)
      .then((r) => {
        if (r.status === 404) throw new Error("no_survey");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: ForYouItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        // No user vector yet (survey not completed or no auth) —
        // fall back to the generic non-personalized feed
        fetch(`${API_BASE}/for-you`)
          .then((r) => r.json())
          .then((data: ForYouItem[]) => {
            setItems(data);
            setLoading(false);
          })
          .catch((e) => {
            setError(e.message);
            setLoading(false);
          });
      });
  }, []);

  return (
    <div style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}>
      <SearchBar />

      <h1 style={{
        margin: "0 0 4px",
        fontSize: 24,
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        color: theme.components.badge.text,
      }}>
        For You Page
      </h1>

      <p style={{
        margin: "0 0 20px",
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        color: theme.components.badge.mutedText,
        background: theme.components.badge.background,
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 4,
      }}>
        Curated according to your preferences
      </p>

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: "center",
          padding: "40px 0",
          fontFamily: "'DM Sans', sans-serif",
          color: theme.components.badge.mutedText,
          fontSize: 14,
        }}>
          Loading your feed…
        </div>
      )}

      {/* Error: survey not completed yet */}
      {!loading && error === "no_survey" && (
        <div style={{
          background: theme.components.badge.background,
          borderRadius: 8,
          padding: "24px 20px",
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <p style={{ margin: "0 0 6px", fontWeight: 600, color: theme.components.badge.text }}>
            No preferences found
          </p>
          <p style={{ margin: 0, fontSize: 13, color: theme.components.badge.mutedText }}>
            Complete the survey to get personalized recommendations.
          </p>
        </div>
      )}

      {/* Generic error */}
      {!loading && error && error !== "no_survey" && (
        <div style={{
          background: theme.components.badge.background,
          borderRadius: 8,
          padding: "24px 20px",
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          color: theme.components.badge.mutedText,
          fontSize: 13,
        }}>
          Something went wrong loading your feed.
        </div>
      )}

      {/* Feed */}
      {!loading && !error && (
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
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <Placeholder
                  label="Unable to Render Image"
                  aspectRatio="4/3"
                  style={{ borderRadius: 0 }}
                />
              )}

              <div style={{ padding: "10px 12px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: theme.components.badge.text,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {item.title}
                  </span>

                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    style={{
                      background: theme.components.button.ghostBackground,
                      border: theme.components.button.ghostBorder,
                      cursor: "pointer",
                      transition: "color 0.2s, transform 0.15s",
                      transform: favorites.includes(item.id) ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    <Heart
                      size={18}
                      strokeWidth={2.2}
                      color={favorites.includes(item.id)
                        ? theme.components.favorite.active
                        : theme.components.favorite.inactive}
                      fill={favorites.includes(item.id)
                        ? theme.components.favorite.active
                        : "none"}
                    />
                  </button>
                </div>

                <div style={{
                  background: theme.components.badge.background,
                  borderRadius: 4,
                  padding: "8px 10px",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  color: theme.components.badge.mutedText,
                }}>
                  {item.about}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
