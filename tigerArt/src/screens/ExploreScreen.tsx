import { Placeholder } from "../components/Placeholder";
import { SearchBar } from "../components/SearchBar";
import { EXHIBIT_SECTIONS } from "../data";
import { C } from "../theme";
import type { ExhibitSection } from "../types";

type ExploreScreenProps = {
  onSectionClick: (section: ExhibitSection) => void;
};

export function ExploreScreen({ onSectionClick }: ExploreScreenProps) {
  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <SearchBar />
      <h1
        style={{
          margin: "0 0 20px",
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
        EXPLORE
      </h1>

      {EXHIBIT_SECTIONS.map((section) => (
        <div key={section.name} style={{ marginBottom: 28 }}>
          <div
            style={{
              background: C.surface,
              borderRadius: 4,
              padding: "8px 12px",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              color: C.text,
              marginBottom: 12,
              display: "inline-block",
              cursor: "pointer",
            }}
            onClick={() => onSectionClick(section)}
          >
            {section.name}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {section.items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => onSectionClick(section)}
                style={{ cursor: "pointer" }}
              >
                <Placeholder label="Image" aspectRatio="3/4" />
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
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                      color: C.muted,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
