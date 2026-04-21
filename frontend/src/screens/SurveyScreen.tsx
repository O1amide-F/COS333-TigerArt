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
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        gap: 8, marginBottom: 24 }}>
        <div style={{ background: theme.components.badge.background, borderRadius: 4,
          padding: "4px 16px", color: theme.components.badge.text, fontSize: 17,
          fontFamily: "'DM Sans', sans-serif" }}>
          {displayName || username || "Guest"}
        </div>
        <h2 style={{ margin: 0, fontSize: 18, fontFamily: "'Playfair Display', serif",
          fontWeight: 700, color: theme.components.badge.text }}>
          Survey Preferences
        </h2>
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
