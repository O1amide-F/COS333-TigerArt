import { Placeholder } from "../components/Placeholder";
import { C } from "../theme";
import type { ExhibitSection } from "../types";

type ExhibitDetailScreenProps = {
  section: ExhibitSection;
  onBack: () => void;
};

export function ExhibitDetailScreen({
  section,
  onBack,
}: ExhibitDetailScreenProps) {
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
        <div style={{ paddingTop: 8 }}>
          <div
            style={{
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              color: C.text,
              marginBottom: 4,
            }}
          >
            {section.items[0].name}
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
            <div style={{ paddingTop: 6 }}>
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
          </div>
        ))}
      </div>
    </div>
  );
}
