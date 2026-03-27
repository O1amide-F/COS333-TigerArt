import { NAV_ITEMS } from "../new_data";
import { C } from "../theme";
import type { NavId } from "../types";

type BottomNavProps = {
  activeNav: NavId;
  onNavigate: (id: NavId) => void;
};

export function BottomNav({ activeNav, onNavigate }: BottomNavProps) {
  return (
    <div
      style={{
        background: C.navy,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 0 14px",
        flexShrink: 0,
      }}
    >
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            opacity: activeNav === item.id ? 1 : 0.4,
            transition: "opacity 0.2s",
            padding: "4px 10px",
          }}
          aria-label={item.label}
        >
          <item.icon size={22} strokeWidth={1.9} color="#fff" />
        </button>
      ))}
    </div>
  );
}
