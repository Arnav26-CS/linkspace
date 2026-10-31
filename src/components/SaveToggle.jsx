
import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
} from "motion/react";
import { CheckCircle2 } from "lucide-react";
import "./SaveToggle.css";

const SIZE_CONFIG = {
  sm: {
    height: 44,
    circle: 44,
    width: 108,
    savedWidth: 128,
    fontSize: 15,
  },
  md: {
    height: 36,
    circle: 36,
    width: 82,
    savedWidth: 102,
    fontSize: 13,
  },
  lg: {
    height: 62,
    circle: 62,
    width: 144,
    savedWidth: 168,
    fontSize: 19,
  },
};

export function SaveToggle({
  size = "md",
  idleText = "Save",
  savedText = "Saved",
  loadingDuration = 1200,
  successDuration = 1000,
  initialStatus = "idle",
  onStatusChange,
}) {
  const [status, setStatus] = useState(initialStatus);

  // Keep the latest callback without triggering unnecessary effects.
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  // Notify Dashboard only when the actual status changes.
  useEffect(() => {
    onStatusChangeRef.current?.(status);
  }, [status]);

  useEffect(() => {
    if (status !== "loading" && status !== "success") {
      return;
    }

    const duration =
      status === "loading" ? loadingDuration : successDuration;

    const timer = setTimeout(() => {
      setStatus(status === "loading" ? "success" : "saved");
    }, duration);

    return () => clearTimeout(timer);
  }, [status, loadingDuration, successDuration]);

  const handleClick = () => {
    if (status === "idle") {
      setStatus("loading");
    } else if (status === "saved") {
      setStatus("idle");
    }
  };

  const isCircle =
    status === "loading" || status === "success";

  return (
    <MotionConfig
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      <motion.button
        type="button"
        className={`save-toggle save-toggle-${status}`}
        onClick={handleClick}
        disabled={isCircle}
        initial={false}
        animate={{
          width: isCircle
            ? config.circle
            : Math.max(config.width, config.savedWidth),
          height: config.height,
        }}
        whileHover={!isCircle ? { scale: 1.04 } : {}}
        whileTap={!isCircle ? { scale: 0.96 } : {}}
        style={{
          "--button-font-size": `${config.fontSize}px`,
        }}
      >
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.span
              key="idle"
              className="save-toggle-label"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              {idleText}
            </motion.span>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              className="save-toggle-spinner"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.svg
                viewBox="0 0 26 26"
                width="21"
                height="21"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.7,
                  ease: "linear",
                }}
              >
                <circle
                  cx="13"
                  cy="13"
                  r="10"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M13 3 A10 10 0 0 1 23 13"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.svg>
            </motion.div>
          )}

          {(status === "success" || status === "saved") && (
            <motion.div
              key="success"
              className="save-toggle-success"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />

              {status === "saved" && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="save-toggle-label"
                >
                  {savedText}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </MotionConfig>
  );
}

export default SaveToggle;
