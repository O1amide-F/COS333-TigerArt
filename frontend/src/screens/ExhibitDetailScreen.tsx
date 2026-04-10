import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Placeholder } from "../components/Placeholder";
import { ArtworkModal } from "../components/ArtworkModal";
import { theme } from "../theme";
import type { ExhibitItem, ExhibitSection } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5001/api";

type ExhibitDetailScreenProps = {
  userId: string | null;
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
  const [modalItem, setModalItem] = useState<ExhibitItem | null>(null);
  const [detailItems, setDetailItems] = useState<ExhibitItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    fetch(`${API_BASE}/exhibits/${encodeURIComponent(section.name)}`)
      .then((res) => res.json())
      .then((data) => setDetailItems(data))
      .catch(() => setDetailItems(section.items));
  }, [section]);

  useEffect(() => {
    setVisibleCount(4);
  }, [section]);

  const shuffledItems = useMemo(
    () => [...detailItems].sort(() => Math.random() - 0.5),
    [detailItems],
  );

  const featuredItem = shuffledItems[0];
  const gridItems = shuffledItems.slice(1, 1 + visibleCount);
  const hasMore = shuffledItems.length - 1 > visibleCount;

  // Shared heart button — delegates entirely to onToggleFavorite (App.tsx hits backend)
  const HeartButton = ({ itemId }: { itemId: number }) => {
    const isFavorited = favorites.includes(itemId);
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(itemId);
        }}
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
          color={isFavorited ? theme.components.favorite.active : "#fff"}
          fill={isFavorited ? theme.components.favorite.active : "none"}
        />
      </button>
    );
  };

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
        <div
          style={{ marginBottom: 10, cursor: "pointer" }}
          onClick={() => setModalItem(featuredItem)}
        >
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
            <HeartButton itemId={featuredItem.id} />
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
        {gridItems.map((item) => (
          <div
            key={item.id}
            style={{ cursor: "pointer" }}
            onClick={() => setModalItem(item)}
          >
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
              <HeartButton itemId={item.id} />
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

      {hasMore && (
        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "center" }}
        >
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              background: theme.components.badge.background,
              color: theme.components.badge.text,
            }}
          >
            Click here to view more images
          </button>
        </div>
      )}

      {modalItem && (
        <ArtworkModal
          item={modalItem}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
}
