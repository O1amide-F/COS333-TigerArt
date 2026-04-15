import { useEffect, useState } from "react";
import { NAV_ITEMS } from "../data";
import { theme } from "../theme";
import type { NavId } from "../types";

type BottomNavProps = {
  activeNav: NavId;
  onNavigate: (id: NavId) => void;
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

export function BottomNav({ activeNav, onNavigate }: BottomNavProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return <SidebarNav activeNav={activeNav} onNavigate={onNavigate} />;
  }

  return <MobileNav activeNav={activeNav} onNavigate={onNavigate} />;
}

// ----------------------------------------------------------------------------
// Sidebar (desktop)
// ----------------------------------------------------------------------------
function SidebarNav({ activeNav, onNavigate }: BottomNavProps) {
  return (
    <div
      style={{
        background: theme.components.nav.background,
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        width: "250px",
        padding: "32px 0 24px",
        gap: 4,
      }}
    >
      {/* App title / logo area */}
      <div
        style={{
          padding: "0 24px 32px",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 20,
          color: theme.components.nav.icon,
          letterSpacing: "0.04em",
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          marginBottom: 8,
        }}
      >
        TigerArt
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const isActive = activeNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            style={{
              background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 24px",
              borderRadius: 8,
              margin: "0 12px",
              opacity: isActive ? 1 : theme.components.nav.inactiveOpacity,
              transition: "opacity 0.2s, background 0.2s",
            }}
          >
            <item.icon
              size={20}
              strokeWidth={isActive ? 2.2 : 1.9}
              color={theme.components.nav.icon}
            />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: theme.components.nav.icon,
                letterSpacing: "0.01em",
              }}
            >
              {item.label}
            </span>
            {/* Active indicator bar */}
            {isActive && (
              <div
                style={{
                  marginLeft: "auto",
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: theme.components.nav.icon,
                  opacity: 0.7,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Bottom bar (mobile / tablet)
// ----------------------------------------------------------------------------
function MobileNav({ activeNav, onNavigate }: BottomNavProps) {
  return (
    <div
      style={{
        background: theme.components.nav.background,
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
            background: theme.components.button.ghostBackground,
            border: theme.components.button.ghostBorder,
            cursor: "pointer",
            opacity:
              activeNav === item.id ? 1 : theme.components.nav.inactiveOpacity,
            transition: "opacity 0.2s",
            padding: "4px 10px",
          }}
          aria-label={item.label}
        >
          <item.icon
            size={22}
            strokeWidth={1.9}
            color={theme.components.nav.icon}
          />
        </button>
      ))}
    </div>
  );
}
