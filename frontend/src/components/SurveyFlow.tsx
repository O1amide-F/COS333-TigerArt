import { useEffect, useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { getFallbackImageForAspect } from "../assets/fallbackImage";
import { theme } from "../theme";

const API_BASE = "/api";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
export type SurveyOption = {
  tag: string;
  objectid: number | null;
  imageUrl: string | null;
};

export type SurveyQuestion = {
  id: string;
  prompt: string;
  options: SurveyOption[];
  selectCount: number;
};

export type SurveyConfig = {
  questions: SurveyQuestion[];
  dims: string[];
};

export type SurveyAnswers = Record<string, string[]>;

type SurveyFlowProps = {
  userId: string | null;
  // Called after successful submission with the selected objectids
  onComplete: (objectIds: number[]) => void;
  // Label for the final button — "Continue" on onboarding, "Save Changes" in settings
  completeLabel?: string;
  // When false, selections are local-only and not sent to backend.
  persistToDb?: boolean;
};

// --------------------------------------------------------------------------
// Shared survey flow component
// --------------------------------------------------------------------------
export function SurveyFlow({
  userId,
  onComplete,
  completeLabel = "Continue",
  persistToDb = true,
}: SurveyFlowProps) {
  const [config, setConfig] = useState<SurveyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});

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
  if (error || !config)
    return <ErrorState message={error ?? "Unknown error"} />;

  const question = config.questions[currentStep];
  const totalSteps = config.questions.length;
  const selectedTags = answers[question.id] ?? [];
  const canAdvance = selectedTags.length === question.selectCount;
  const isLastStep = currentStep === totalSteps - 1;
  const remaining = question.selectCount - selectedTags.length;

  const toggleTag = (tag: string) => {
    setAnswers((prev) => {
      const current = prev[question.id] ?? [];
      if (current.includes(tag))
        return { ...prev, [question.id]: current.filter((t) => t !== tag) };
      if (current.length >= question.selectCount) return prev;
      return { ...prev, [question.id]: [...current, tag] };
    });
  };

  const handleNext = async () => {
    if (!canAdvance) return;
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
      return;
    }

    setSubmitting(true);

    const payload = {
      userId: userId,
      answers: {
        era: answers["era"] ?? [],
        classification: answers["classification"] ?? [],
        geography: answers["geography"] ?? [],
      },
    };

    if (persistToDb && userId) {
      try {
        await fetch(`${API_BASE}/survey/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.error("Survey submit failed:", e);
      }
    }

    setSubmitting(false);

    const allObjectIds = config.questions.flatMap((q) => {
      const sel = answers[q.id] ?? [];
      return q.options
        .filter((o) => sel.includes(o.tag) && o.objectid != null)
        .map((o) => o.objectid as number);
    });

    onComplete(allObjectIds);
  };

  return (
    <div>
      {/* Progress bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {config.questions.map((q, i) => (
          <div
            key={q.id}
            style={{
              height: 4,
              flex: 1,
              maxWidth: 60,
              borderRadius: 2,
              background:
                i <= currentStep
                  ? theme.components.button.primaryBackground
                  : theme.components.divider.color,
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Step counter*/}
      <p style={{
        textAlign: "center",
        fontSize: 12,
        fontFamily: "'DM Sans', sans-serif",
        color: theme.components.badge.mutedText,
        margin: "0 0 16px",
      }}>
        Question {currentStep + 1} of {totalSteps}
      </p>

      {/* Prompt */}
      <div
        style={{
          background: theme.components.badge.background,
          borderRadius: 6,
          padding: "10px 14px",
          textAlign: "center",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: theme.components.badge.text,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: "0 0 4px", fontWeight: 600 }}>{question.prompt}</h2>
        <p style={{ margin: 0, color: theme.components.badge.mutedText }}>
          {remaining > 0
            ? selectedTags.length === 0
              ? `Select ${question.selectCount} images from below`
              : `Select ${remaining} more image${remaining !== 1 ? "s" : ""}`
            : "Great choices! Click continue to proceed."}
        </p>
      </div>

      {/* Image grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {question.options.map((option) => {
          const isSelected = selectedTags.includes(option.tag);
          const isDisabled =
            !isSelected && selectedTags.length >= question.selectCount;
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
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4/3",
                  background: theme.components.badge.background,
                }}
              >
                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt={option.tag}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      backgroundColor: theme.components.image.background,
                      display: "block",
                    }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = getFallbackImageForAspect("4/3");
                    }}
                  />
                ) : (
                  <img
                    src={getFallbackImageForAspect("4/3")}
                    alt={option.tag}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      backgroundColor: theme.components.image.background,
                      display: "block",
                    }}
                  />
                )}
                {isSelected && (
                  <div
                    style={{
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
                    }}
                  >
                    <Check size={13} strokeWidth={2.5} color="#fff" />
                  </div>
                )}
              </div>
              <div style={{ padding: "6px 10px" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                    color: theme.components.badge.text,
                    textTransform: "capitalize",
                    letterSpacing: "0.02em",
                  }}
                >
                  {option.tag.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nav buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            style={{
              background: theme.components.button.disabledBackground,
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
             <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
              , Question {currentStep} of {totalSteps}
            </span>

          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          disabled={submitting}
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
            cursor: canAdvance && !submitting ? "pointer" : "default",
            transition: "background 0.2s, color 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {submitting ? "Saving…" : isLastStep ? (
            <>
              {completeLabel}              
              <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                , Continue to your personalized homepage
              </span>
            </>
          ) : (
            <>
              Next
              <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                , Question {currentStep + 2} of {totalSteps}
              </span>
            </>
          )}
          {!isLastStep && canAdvance && (
            <ChevronRight size={16} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Helper states
// --------------------------------------------------------------------------
export function LoadingState() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        color: "#888",
        fontSize: 14,
      }}
    >
      Loading survey…
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
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
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>Couldn't load survey</p>
      <p style={{ margin: 0, fontSize: 12 }}>{message}</p>
    </div>
  );
}
