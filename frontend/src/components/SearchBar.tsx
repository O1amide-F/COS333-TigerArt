import { Search } from "lucide-react";
import { C } from "../theme";

export function SearchBar() {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
      }}
    >
      <Search size={16} strokeWidth={2} color={C.muted} />
      <span
        style={{
          color: C.muted,
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Search
      </span>
    </div>
  );
}
