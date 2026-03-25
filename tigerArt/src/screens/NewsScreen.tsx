import { Placeholder } from "../components/Placeholder";
import { NEWS_ITEMS } from "../data";
import { C } from "../theme";

export function NewsScreen() {
  return (
    <div
      style={{ padding: "16px 20px 100px", overflowY: "auto", height: "100%" }}
    >
      <h1
        style={{
          margin: "0 0 20px",
          fontSize: 22,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          letterSpacing: "0.06em",
          color: C.text,
          background: C.surface,
          display: "block",
          padding: "8px 14px",
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        LATEST NEWS
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {NEWS_ITEMS.map((item, index) => (
          <div key={item.id}>
            <Placeholder label="Image" aspectRatio="16/7" />
            <div style={{ padding: "12px 0 16px" }}>
              <div
                style={{
                  background: C.surface,
                  display: "inline-block",
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 6,
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  width: 100,
                  height: 5,
                  background: C.border,
                  borderRadius: 3,
                }}
              />
            </div>
            {index < NEWS_ITEMS.length - 1 && (
              <div
                style={{ borderTop: `1px solid ${C.border}`, marginBottom: 16 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
