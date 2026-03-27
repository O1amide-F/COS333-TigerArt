import { Heart } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { C } from "../theme";

type FavoritesScreenProps = {
  favorites: number[];
  onNavHome: () => void;
};

export function FavoritesScreen({
  favorites: _favorites,
  onNavHome,
}: FavoritesScreenProps) {
  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      {/* Search component for consistency with other catalog screens. */}
      <SearchBar />
      {/* Page title component for Favorites. */}
      <h1
        style={{
          margin: "0 0 24px",
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
        FAVORITES
      </h1>

      {/* Empty-state component shown intentionally while Favorites is disabled. */}
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          background: "#fff",
        }}
      >
        <Heart size={48} strokeWidth={1.7} color={C.border} />
        <div
          style={{
            fontSize: 16,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: C.text,
          }}
        >
          Favorites are unavailable
        </div>
        <div
          style={{
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            color: C.muted,
            textAlign: "center",
          }}
        >
          This tab is intentionally empty for now
        </div>
        {/* Primary action component that routes back to Home feed. */}
        <button
          onClick={onNavHome}
          style={{
            marginTop: 8,
            background: C.navy,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "12px 28px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Explore Art
        </button>
      </div>
    </div>
  );
}
