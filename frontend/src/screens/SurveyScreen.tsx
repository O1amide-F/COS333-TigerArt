import { theme } from "../theme";
import { SurveyFlow } from "../components/SurveyFlow";

type SurveyScreenProps = {
  onContinue: (selected: number[]) => void;
  username: string;
  displayName?: string;
  userId: string | null;
  isGuest?: boolean;
};

export function SurveyScreen({
  onContinue,
  username,
  displayName,
  userId,
  isGuest = false,
}: SurveyScreenProps) {
  return (
    <div style={{ padding: "24px 20px 100px", overflowY: "auto", height: "100%" }}>
      {/* ── Sticky header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 20,
        background: "#fafaf8", paddingBottom: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ background: theme.components.badge.background, borderRadius: 4,
            padding: "4px 16px", color: theme.components.badge.text, fontSize: 15,
            fontFamily: "'DM Sans', sans-serif" }}>
            {displayName || username || "Guest"}
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Playfair Display', serif",
            fontWeight: 700, color: theme.components.badge.text }}>
            Survey Preferences
          </h2>
        </div>
      </div>

      <SurveyFlow
        userId={userId}
        onComplete={onContinue}
        completeLabel="Continue"
        persistToDb={!isGuest}
      />
    </div>
  );
}
