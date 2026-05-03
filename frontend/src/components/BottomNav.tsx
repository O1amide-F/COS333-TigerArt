import { useEffect, useState } from "react";
import { Info, ClipboardList, LogOut } from "lucide-react";
import { NAV_ITEMS } from "../data";
import { theme } from "../theme";
import type { NavId } from "../types";

type BottomNavProps = {
  activeNav: NavId;
  onNavigate: (id: NavId) => void;
  disabledNavIds?: NavId[];
  onDisabledClick?: (id: NavId) => void;
  isGuest?: boolean;
  onStartTour?: () => void;
  onStartSurvey?: () => void;
  onLogout?: () => void;
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

function TourButton({
  onClick,
  compact = false,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const baseBackground = "#223140";
  const hoverBackground = "#112f51";

  return (
    <button
      data-tour="nav-tour"
      onClick={onClick}
      aria-label="Take tour"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: compact ? "auto" : "100%",
        margin: compact ? "10px 12px 0" : 0,
        padding: compact ? "10px 14px" : "12px 14px",
        borderRadius: 12,
        border: `1px solid ${isHovered ? "#101821" : "#304051"}`,
        backgroundColor: isHovered ? hoverBackground : baseBackground,
        color: theme.components.nav.icon,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: compact ? 13 : 14,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transform: isHovered ? "translateY(-1px)" : "translateY(0)",
        transition:
          "transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease",
      }}
    >
      <Info
        size={compact ? 15 : 16}
        strokeWidth={2.2}
        color={theme.components.nav.icon}
        style={{ transition: "color 0.18s ease, transform 0.18s ease" }}
      />
      Take tour
    </button>
  );
}

function SurveyButton({
  onClick,
  compact = false,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const baseBackground = "#2a3f2e";
  const hoverBackground = "#1a2f1e";

  return (
    <button
      onClick={onClick}
      aria-label="Retake survey"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: compact ? "auto" : "100%",
        margin: compact ? "6px 12px 0" : 0,
        padding: compact ? "10px 14px" : "12px 14px",
        borderRadius: 12,
        border: `1px solid ${isHovered ? "#0f1f11" : "#3a5040"}`,
        backgroundColor: isHovered ? hoverBackground : baseBackground,
        color: theme.components.nav.icon,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: compact ? 13 : 14,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transform: isHovered ? "translateY(-1px)" : "translateY(0)",
        transition:
          "transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease",
      }}
    >
      <ClipboardList
        size={compact ? 15 : 16}
        strokeWidth={2.2}
        color={theme.components.nav.icon}
      />
      Retake survey
    </button>
  );
}

export function BottomNav({
  activeNav,
  onNavigate,
  disabledNavIds = [],
  onDisabledClick,
  isGuest = false,
  onStartTour,
  onStartSurvey,
  onLogout,
}: BottomNavProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <SidebarNav
        activeNav={activeNav}
        onNavigate={onNavigate}
        disabledNavIds={disabledNavIds}
        onDisabledClick={onDisabledClick}
        isGuest={isGuest}
        onStartTour={onStartTour}
        onStartSurvey={onStartSurvey}
        onLogout={onLogout}
      />
    );
  }

  return (
    <MobileNav
      activeNav={activeNav}
      onNavigate={onNavigate}
      disabledNavIds={disabledNavIds}
      onDisabledClick={onDisabledClick}
      onStartTour={onStartTour}
      onStartSurvey={onStartSurvey}
      onLogout={onLogout}
    />
  );
}

// ----------------------------------------------------------------------------
// Sidebar (desktop)
// ----------------------------------------------------------------------------
function SidebarNav({
  activeNav,
  onNavigate,
  disabledNavIds = [],
  onDisabledClick,
  isGuest = false,
  onStartTour,
  onStartSurvey,
  onLogout,
}: BottomNavProps) {
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

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Nav items */}
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          const isDisabled = disabledNavIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() =>
                isDisabled && onDisabledClick
                  ? onDisabledClick(item.id)
                  : onNavigate(item.id)
              }
              data-tour={`nav-${item.id.replace(/_/g, "-")}`}
              aria-label={item.label}
              style={{
                background:
                  isActive && !isDisabled
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 24px",
                borderRadius: 8,
                margin: "0 12px",
                opacity: isDisabled ? 0.35 : 1,
                transition: "opacity 0.2s, background 0.2s",
              }}
            >
              <item.icon
                size={20}
                strokeWidth={isActive && !isDisabled ? 2.2 : 1.9}
                color={theme.components.nav.icon}
              />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: isActive && !isDisabled ? 600 : 400,
                  color: theme.components.nav.icon,
                  letterSpacing: "0.01em",
                }}
              >
                {item.label}
              </span>
              {/* Active indicator bar */}
              {isActive && !isDisabled && (
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
        {onLogout && (
          <button
            onClick={onLogout}
            aria-label="Logout"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 24px",
              borderRadius: 8,
              margin: "0 12px",
              opacity: 1,
              transition: "opacity 0.2s, background 0.2s",
            }}
          >
            <LogOut
              size={20}
              strokeWidth={1.9}
              color={theme.components.nav.icon}
            />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 400,
                color: theme.components.nav.icon,
                letterSpacing: "0.01em",
              }}
            >
              Logout
            </span>
          </button>
        )}
        {((onStartSurvey && !isGuest) || onStartTour) && (
          <div
            style={{
              marginTop: "auto",
              padding: "16px 12px 0",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {onStartSurvey && !isGuest && (
              <SurveyButton onClick={onStartSurvey} />
            )}
            {onStartTour && <TourButton onClick={onStartTour} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Bottom bar (mobile / tablet)
// ----------------------------------------------------------------------------
function MobileNav({
  activeNav,
  onNavigate,
  disabledNavIds = [],
  onDisabledClick,
  isGuest = false,
  onStartTour,
  onStartSurvey,
  onLogout,
}: BottomNavProps) {
  return (
    <div
      style={{
        background: theme.components.nav.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "10px 0 12px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isDisabled = disabledNavIds.includes(item.id);
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              onClick={() =>
                isDisabled && onDisabledClick
                  ? onDisabledClick(item.id)
                  : onNavigate(item.id)
              }
              data-tour={`nav-${item.id.replace(/_/g, "-")}`}
              style={{
                background: theme.components.button.ghostBackground,
                border: theme.components.button.ghostBorder,
                cursor: "pointer",
                opacity: isDisabled
                  ? 0.35
                  : isActive
                    ? 1
                    : theme.components.nav.inactiveOpacity,
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
          );
        })}
        {onLogout && (
          <button
            onClick={onLogout}
            aria-label="Logout"
            style={{
              background: theme.components.button.ghostBackground,
              border: theme.components.button.ghostBorder,
              cursor: "pointer",
              opacity: theme.components.nav.inactiveOpacity,
              transition: "opacity 0.2s",
              padding: "4px 10px",
            }}
          >
            <LogOut
              size={22}
              strokeWidth={1.9}
              color={theme.components.nav.icon}
            />
          </button>
        )}
      </div>

      {onStartSurvey && !isGuest && (
        <SurveyButton onClick={onStartSurvey} compact />
      )}
      {onStartTour && <TourButton onClick={onStartTour} compact />}
    </div>
  );
}
