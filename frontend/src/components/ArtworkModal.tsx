import { useEffect } from "react";
import { Heart } from "lucide-react";
import { Placeholder } from "./Placeholder";
import { getFallbackImageForAspect } from "../assets/fallbackImage";
import { theme } from "../theme";
import type { ExhibitItem } from "../types";

const API_BASE = "/api";

type ArtworkModalProps = {
  item: ExhibitItem;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onClose: () => void;
  userId?: string | null;
  onRecordView?: (id: number) => void;
};

export function ArtworkModal({
  item,
  favorites,
  onToggleFavorite,
  onClose,
  userId,
  onRecordView,
}: ArtworkModalProps) {
  // Record view once when modal opens
  useEffect(() => {
    onRecordView?.(item.id);
    if (!userId) return;
    fetch(`${API_BASE}/recently-viewed/${userId}/${item.id}`, {
      method: "POST",
    }).catch(console.error);
  }, [item.id, onRecordView, userId]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.components.card.background,
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          maxHeight: "82vh",
          overflowY: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative" }}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{
                width: "100%",
                aspectRatio: "4/3",
                objectFit: "cover",
                borderRadius: "16px 16px 0 0",
                display: "block",
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getFallbackImageForAspect("4/3");
              }}
            />
          ) : (
            <Placeholder
              label="Unable to Render Image"
              aspectRatio="4/3"
              style={{ borderRadius: "16px 16px 0 0" }}
            />
          )}

          {/* Close button */}
          <button
            data-tour="artwork-modal-close"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              border: "none",
              borderRadius: "50%",
              width: 34,
              height: 34,
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* Favorite button */}
          <button
            data-tour="artwork-modal-favorite"
            data-tour-track="favorite"
            data-tour-art-id={String(item.id)}
            onClick={() => onToggleFavorite(item.id)}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(4px)",
              border: "none",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Heart
              size={17}
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

        {/* Details */}
        <div style={{ padding: "16px 18px 24px" }}>
          <div
            data-tour="artwork-modal-title"
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "'Playfair Display', serif",
              color: theme.components.badge.text,
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {item.name}
          </div>

          {[
            { label: "Artist", value: item.displaymaker },
            { label: "Date", value: item.displaydate },
            { label: "Medium", value: item.desc },
            { label: "Classification", value: item.classification },
            { label: "Department", value: item.department },
          ]
            .filter((row) => row.value)
            .map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 10,
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span
                  style={{
                    minWidth: 100,
                    color: theme.components.badge.mutedText,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {row.label}
                </span>
                <span style={{ color: theme.components.badge.text }}>
                  {row.value}
                </span>
              </div>
            ))}
          {item.gallery_label_text && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: theme.components.badge.mutedText,
                }}
              >
                Description
              </div>

              <div
                style={{
                  color: theme.components.badge.text,
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.6,
                }}
                dangerouslySetInnerHTML={{ __html: item.gallery_label_text }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
