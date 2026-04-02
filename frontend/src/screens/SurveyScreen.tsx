import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { theme } from "../theme";

const API_BASE = "http://localhost:5001/api";

// --------------------------------------------------------------------------
// Types matching the shape returned by GET /api/survey/config
// --------------------------------------------------------------------------
type SurveyOption = {
  tag: string;
  objectid: number | null;
  imageUrl: string | null;
};

type SurveyQuestion = {
  id: string;
  prompt: string;
  options: SurveyOption[];
  selectCount: number;
};

type SurveyConfig = {
  questions: SurveyQuestion[];
  dims: string[];
};

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------
type SurveyScreenProps = {
  onContinue: (selected: number[]) => void;
  username: string;
  profileImage: string | null;
};

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------
export function SurveyScreen({
  onContinue,
  username,
  profileImage,
}: SurveyScreenProps) {
  const [config, setConfig] = useState<SurveyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // currentStep: 0 = era, 1 = classification, 2 = geography
  const [currentStep, setCurrentStep] = useState(0);

  // answers[questionId] = array of selected tag strings
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  // Fetch survey config from backend on mount
  useEffect(() => {
    fetch(`${API_BASE}/survey/config`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: SurveyConfig) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState />;
  if (error || !config) return <ErrorState message={error ?? "Unknown error"} />;

  const question = config.questions[currentStep];
  const totalSteps = config.questions.length;
  const selectedTags = answers[question.id] ?? [];
  const canAdvance = selectedTags.length === question.selectCount;
  const isLastStep = currentStep === totalSteps - 1;

  const toggleTag = (tag: string) => {
    setAnswers((prev) => {
      const current = prev[question.id] ?? [];
      if (current.includes(tag)) {
        return { ...prev, [question.id]: current.filter((t) => t !== tag) };
      }
      if (current.length >= question.selectCount) return prev; // max reached
      return { ...prev, [question.id]: [...current, tag] };
    });
  };

  const handleNext = () => {
    if (!canAdvance) return;
    if (isLastStep) {
      // Build the payload and submit to backend
      submitSurvey();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const submitSurvey = async () => {
    // Hard-coded userId = 1 for now — replace with your auth system later
    const userId = 1;

    const payload = {
      userId,
      answers: {
        era: answers["era"] ?? [],
        classification: answers["classification"] ?? [],
        geography: answers["geography"] ?? [],
      },
    };

    try {
      await fetch(`${API_BASE}/survey/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Non-blocking — still navigate even if save fails
      console.error("Survey submit failed:", e);
    }

    // Pass selected objectids back to App for legacy compatibility
    const allObjectIds = config.questions.flatMap((q) => {
      const selectedTags = answers[q.id] ?? [];
      return q.options
        .filter((o) => selectedTags.includes(o.tag) && o.objectid != null)
        .map((o) => o.objectid as number);
    });

    onContinue(allObjectIds);
  };

  const remaining = question.selectCount - selectedTags.length;

  return (
    <div style={{ padding: "24px 20px 100px", overflowY: "auto", height: "100%" }}>

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        marginBottom: 24,
      }}>
        {/* Avatar */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: theme.components.badge.background,
          border: `2px solid ${theme.components.card.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.components.badge.mutedText,
          fontSize: 11,
          fontFamily: "'DM Sans', sans-serif",
          textAlign: "center",
          lineHeight: 1.3,
          overflow: "hidden",
        }}>
          {profileImage ? (
            <img src={profileImage} alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <>{`Profile\nPic`}</>
          )}
        </div>

        {/* Username badge */}
        <div style={{
          background: theme.components.badge.background,
          borderRadius: 4,
          padding: "4px 16px",
          color: theme.components.badge.mutedText,
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {username || "Username"}
        </div>

        {/* Title */}
        <h2 style={{
          margin: 0,
          fontSize: 18,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          color: theme.components.badge.text,
        }}>
          Survey Preferences
        </h2>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Step progress indicator                                              */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginBottom: 20,
      }}>
        {config.questions.map((q, i) => (
          <div key={q.id} style={{
            height: 4,
            flex: 1,
            maxWidth: 60,
            borderRadius: 2,
            background: i <= currentStep
              ? theme.components.button.primaryBackground
              : theme.components.divider.color,
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Question prompt + instruction                                        */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        background: theme.components.badge.background,
        borderRadius: 6,
        padding: "10px 14px",
        textAlign: "center",
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        color: theme.components.badge.text,
        marginBottom: 20,
      }}>
        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{question.prompt}</p>
        <p style={{ margin: 0, color: theme.components.badge.mutedText }}>
          {remaining > 0
            ? `Select ${remaining} more image${remaining !== 1 ? "s" : ""}`
            : "Great choices! Click continue to proceed."}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Image grid                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        marginBottom: 20,
      }}>
        {question.options.map((option) => {
          const isSelected = selectedTags.includes(option.tag);
          const isDisabled = !isSelected && selectedTags.length >= question.selectCount;

          return (
            <div
              key={option.tag}
              onClick={() => !isDisabled && toggleTag(option.tag)}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: isSelected
                  ? `2px solid ${theme.components.button.primaryBackground}`
                  : `2px solid ${theme.components.card.border}`,
                cursor: isDisabled ? "default" : "pointer",
                transition: "border-color 0.2s, transform 0.15s, opacity 0.2s",
                transform: isSelected ? "scale(0.97)" : "scale(1)",
                opacity: isDisabled ? 0.4 : 1,
                background: theme.components.card.background,
              }}
            >
              {/* Artwork image */}
              <div style={{ position: "relative", aspectRatio: "4/3", background: theme.components.badge.background }}>
                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt={option.tag}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => {
                      // Fallback to placeholder on broken image
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.components.badge.mutedText,
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    No image
                  </div>
                )}

                {/* Selected overlay checkmark */}
                {isSelected && (
                  <div style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: theme.components.button.primaryBackground,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Check size={13} strokeWidth={2.5} color="#fff" />
                  </div>
                )}
              </div>

              {/* Tag label */}
              <div style={{
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  color: theme.components.badge.text,
                  textTransform: "capitalize",
                  letterSpacing: "0.02em",
                }}>
                  {option.tag.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Navigation buttons                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

        {/* Back button (hidden on first step) */}
        {currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            style={{
              background: "none",
              border: `1px solid ${theme.components.divider.color}`,
              borderRadius: 6,
              padding: "10px 20px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: theme.components.badge.mutedText,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        ) : <div />}

        {/* Next / Continue button */}
        <button
          onClick={handleNext}
          style={{
            background: canAdvance
              ? theme.components.button.primaryBackground
              : theme.components.button.disabledBackground,
            color: canAdvance
              ? theme.components.button.primaryText
              : theme.components.button.disabledText,
            border: "none",
            borderRadius: 6,
            padding: "10px 24px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: canAdvance ? "pointer" : "default",
            transition: "background 0.2s, color 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isLastStep ? "Continue" : "Next"}
          {!isLastStep && canAdvance && <ChevronRight size={16} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Helper states
// --------------------------------------------------------------------------
function LoadingState() {
  return (
    <div style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      color: "#888",
      fontSize: 14,
    }}>
      Loading survey…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      color: "#888",
      fontSize: 14,
      gap: 8,
      padding: 24,
      textAlign: "center",
    }}>
      <p style={{ margin: 0, fontWeight: 600 }}>Couldn't load survey</p>
      <p style={{ margin: 0, fontSize: 12 }}>{message}</p>
    </div>
  );
}
