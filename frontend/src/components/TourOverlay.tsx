// components/TourOverlay.tsx
//
// KEY FIXES vs prior version:
// 1. Replaced SVG mask (caused oval artifact) with four opaque panels surrounding
//    the spotlight cutout. Much more reliable cross-browser.
// 2. Interactive steps (like-photos, open-modals): overlay uses pointer-events:none
//    so the artwork grid is fully clickable underneath. A dim but translucent
//    backdrop still signals "tour mode" visually.
// 3. When a modal opens during open-modals step, the modal renders above the
//    popover (z-index handled in ArtworkModal / ForYouScreen). Closing the modal
//    returns to the tour popover — the popover is never hidden by the modal.
// 4. "Exit tour" text link added to footer; × in header also exits.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StepMeta, TourStatus } from "../hooks/useTour";

type Rect = { top: number; left: number; width: number; height: number };

const PADDING = 10;
const POPOVER_WIDTH = 336;

type TourOverlayProps = {
  status: TourStatus;
  currentStepMeta: StepMeta;
  stepIndex: number;
  totalSteps: number;
  canAdvance: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
};

export function TourOverlay({
  status,
  currentStepMeta,
  stepIndex,
  totalSteps,
  canAdvance,
  canGoBack,
  onBack,
  onNext,
  onExit,
}: TourOverlayProps) {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  const isCentred = currentStepMeta.target === null;
  const isInteractive = currentStepMeta.interactive === true;
  const shouldUseFixedPopover = isInteractive;

  // ── Measure spotlight target ──────────────────────────────────────────────
  useLayoutEffect(() => {
    if (isCentred) {
      setTargetRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(currentStepMeta.target!);
      if (!el) {
        setTargetRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setTargetRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
    };
    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 450);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [currentStepMeta.target, isCentred, status.step]);

  // ── Position popover ──────────────────────────────────────────────────────
  useEffect(() => {
    if (shouldUseFixedPopover || !targetRect || isCentred) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popH = popoverRef.current?.offsetHeight ?? 220;

    let top = targetRect.top + targetRect.height + 14;
    let left = targetRect.left;

    if (top + popH > vh - 16) top = targetRect.top - popH - 14;
    if (left + POPOVER_WIDTH > vw - 12) left = vw - POPOVER_WIDTH - 12;
    if (left < 12) left = 12;
    if (top < 12) top = 12;

    setPopoverPos({ top, left });
  }, [shouldUseFixedPopover, targetRect, isCentred]);

  if (!status.active) return null;

  const isLastStep = stepIndex === totalSteps - 1;
  const progressFraction = (stepIndex + 1) / totalSteps;

  const likeProgress =
    status.step === "like-photos"
      ? { done: status.likesCompleted, total: status.likesRequired }
      : null;
  const modalProgress =
    status.step === "open-modals"
      ? { done: status.modalsOpened, total: status.modalsRequired }
      : null;

  // Four panels that surround the spotlight hole
  const spot = targetRect ?? { top: 0, left: 0, width: 0, height: 0 };
  const DIM = "rgba(10,16,24,0.72)";
  const DIM_LIGHT = "rgba(10,16,24,0.50)";
  const dimColor = isInteractive ? DIM_LIGHT : DIM;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        pointerEvents: "none",
      }}
    >
      {/* ── Full dim for centred steps ── */}
      {isCentred && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: dimColor,
            // Interactive: let clicks pass through to artwork grid below
            pointerEvents: isInteractive ? "none" : "auto",
          }}
        />
      )}

      {/* ── Four-panel cutout for spotlight steps ── */}
      {!isCentred && targetRect && (
        <>
          {/* Top */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: spot.top,
              background: DIM,
              pointerEvents: "auto",
            }}
          />
          {/* Bottom */}
          <div
            style={{
              position: "absolute",
              top: spot.top + spot.height,
              left: 0,
              right: 0,
              bottom: 0,
              background: DIM,
              pointerEvents: "auto",
            }}
          />
          {/* Left */}
          <div
            style={{
              position: "absolute",
              top: spot.top,
              left: 0,
              width: spot.left,
              height: spot.height,
              background: DIM,
              pointerEvents: "auto",
            }}
          />
          {/* Right */}
          <div
            style={{
              position: "absolute",
              top: spot.top,
              left: spot.left + spot.width,
              right: 0,
              height: spot.height,
              background: DIM,
              pointerEvents: "auto",
            }}
          />
          {/* Spotlight ring */}
          <div
            style={{
              position: "absolute",
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
              borderRadius: 12,
              boxShadow:
                "0 0 0 2.5px #e8a87c, 0 0 0 6px rgba(232,168,124,0.20)",
              pointerEvents: "none",
              transition:
                "top 250ms ease, left 250ms ease, width 250ms ease, height 250ms ease",
            }}
          />
        </>
      )}

      {/* ── Popover ── */}
      <div
        ref={popoverRef}
        style={{
          position: "absolute",
          ...(isCentred
            ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
            : shouldUseFixedPopover
              ? { top: 20, left: 20 }
              : { top: popoverPos.top, left: popoverPos.left }),
          width: Math.min(POPOVER_WIDTH, window.innerWidth - 24),
          background: "#f2f1ee",
          border: "1px solid #dddbd5",
          borderRadius: 14,
          boxShadow:
            "0 4px 8px rgba(0,0,0,0.06), 0 16px 40px rgba(10,16,24,0.22), 0 36px 64px rgba(10,16,24,0.10)",
          fontFamily: "'DM Sans', sans-serif",
          overflow: "hidden",
          pointerEvents: "auto",
          zIndex: isInteractive ? 9010 : 1,
          transition:
            isCentred || shouldUseFixedPopover
              ? "none"
              : "top 220ms ease, left 220ms ease",
          animation:
            "tigerart-popover-in 240ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#0f1923",
            padding: "24px 44px 24px 18px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.62,
              letterSpacing: "0.01em",
            }}
          >
            {currentStepMeta.title}
          </div>
          <button
            onClick={onExit}
            title="Exit tour"
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.48)",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
              borderRadius: 6,
              fontFamily: "sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.48)";
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "16px 18px 0",
            fontSize: 15,
            color: "#1c1c1a",
            lineHeight: 1.9,
            fontWeight: 500,
          }}
        >
          {currentStepMeta.body}
        </div>

        {/* Interactive progress */}
        {likeProgress && (
          <div style={{ padding: "12px 18px 0" }}>
            <InteractiveProgress
              label="Likes"
              done={likeProgress.done}
              total={likeProgress.total}
              color="#e05c5c"
              icon="♥"
            />
          </div>
        )}
        {modalProgress && (
          <div style={{ padding: "12px 18px 0" }}>
            <InteractiveProgress
              label="Details viewed"
              done={modalProgress.done}
              total={modalProgress.total}
              color="#4a90d9"
              icon="◉"
            />
          </div>
        )}

        {/* In-progress hint */}
        {isInteractive && (
          <div
            style={{
              margin: "12px 18px 0",
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.72,
              background: canAdvance
                ? "rgba(34,139,60,0.10)"
                : "rgba(15,25,35,0.06)",
              color: canAdvance ? "#1a7a35" : "#666",
              fontWeight: canAdvance ? 600 : 400,
            }}
          >
            {canAdvance
              ? "✓ All done! Tap Next to continue."
              : "Interact with the artworks — the Next button unlocks once you're done."}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 18px 18px",
            borderTop: "1px solid #e2e0db",
            marginTop: 16,
            gap: 8,
          }}
        >
          {/* Progress */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#5a3a20",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              {stepIndex + 1} / {totalSteps}
            </div>
            <div
              style={{
                height: 3,
                background: "#dddbd6",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressFraction * 100}%`,
                  background: "#0f1923",
                  borderRadius: 99,
                  transition: "width 300ms ease",
                }}
              />
            </div>
          </div>

          {/* Exit tour link */}
          <button
            onClick={onExit}
            style={{
              background: "transparent",
              border: "none",
              color: "#999",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              padding: "4px 2px",
              flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Exit tour
          </button>

          {/* Back */}
          <button
            onClick={canGoBack ? onBack : undefined}
            disabled={!canGoBack}
            style={{
              background: "transparent",
              border: "1px solid #cfcac2",
              color: canGoBack ? "#4f4c47" : "#9f9b95",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: canGoBack ? "pointer" : "not-allowed",
              letterSpacing: "0.01em",
              flexShrink: 0,
              opacity: canGoBack ? 1 : 0.6,
            }}
          >
            ← Back
          </button>

          {/* Next / Done */}
          <button
            onClick={canAdvance ? onNext : undefined}
            disabled={!canAdvance}
            style={{
              background: canAdvance ? "#0f1923" : "#c0bdb8",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: canAdvance ? "pointer" : "not-allowed",
              letterSpacing: "0.01em",
              transition: "background 200ms",
              flexShrink: 0,
              opacity: canAdvance ? 1 : 0.6,
            }}
          >
            {isLastStep ? "Done ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InteractiveProgress({
  label,
  done,
  total,
  color,
  icon,
}: {
  label: string;
  done: number;
  total: number;
  color: string;
  icon: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 5,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#3d1d07",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 14,
            color,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
          }}
        >
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              style={{ opacity: i < done ? 1 : 0.22, marginLeft: 3 }}
            >
              {icon}
            </span>
          ))}
          <span style={{ fontSize: 12, marginLeft: 5, fontWeight: 600 }}>
            {done}/{total}
          </span>
        </span>
      </div>
      <div
        style={{
          height: 5,
          background: "#e0ded9",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(done / total) * 100}%`,
            background: color,
            borderRadius: 99,
            transition: "width 400ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}
