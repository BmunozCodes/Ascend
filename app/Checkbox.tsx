"use client";

import { motion } from "framer-motion";

type Props = {
  checked: boolean;
  onChange: () => void;
  color: string;
  size?: number;
};

export function Checkbox({ checked, onChange, color, size = 22 }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="relative flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
      style={{
        width: size,
        height: size,
      }}
    >
      <motion.span
        className="absolute inset-0 rounded-full border-2"
        animate={{
          borderColor: color,
          backgroundColor: checked ? color : "transparent",
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      />
      <svg
        viewBox="0 0 24 24"
        width={size * 0.55}
        height={size * 0.55}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 pointer-events-none"
      >
        <motion.path
          d="M5 12 L10 17 L19 7"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{
            pathLength: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.1 },
          }}
        />
      </svg>
    </button>
  );
}