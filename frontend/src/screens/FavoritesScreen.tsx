import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { FOR_YOU_ITEMS } from "../data";
import { C } from "../theme";

type FavoritesScreenProps = {
  favorites: number[];
  onNavHome: () => void;
};

export function FavoritesScreen({
  favorites,
  onNavHome,
}: FavoritesScreenProps) {
  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <SearchBar />
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

      {favorites.length === 0 ? (
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
            No favorites yet
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: C.muted,
              textAlign: "center",
            }}
          >
            Click the heart icon to save pieces
          </div>
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
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          {FOR_YOU_ITEMS.filter((item) => favorites.includes(item.id)).map(
            (item) => (
              <div key={item.id}>
                <Placeholder label="Image" aspectRatio="3/4" />
                <div
                  style={{
                    paddingTop: 6,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    color: C.text,
                  }}
                >
                  {item.title}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
