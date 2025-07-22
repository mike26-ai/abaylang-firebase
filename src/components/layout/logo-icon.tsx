// src/components/layout/logo-icon.tsx
// A functional icon representing the core service of Abylang: language dialogue.
// Perfect for favicons, navbars, and app icons.

import React from 'react';

const LogoIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Abylang Icon"
    >
      {/* Main speech bubble shape */}
      <path
        d="M10 10 H90 V70 H30 L10 90 V70 H10 V10 Z"
        fill="hsl(var(--foreground))"
        stroke="hsl(var(--foreground))"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Amharic Letter 'ሀ' (Ha) in negative space */}
      <path
        d="M58 25 C50 25 45 35 45 45 L45 60 M45 40 H70"
        stroke="hsl(var(--background))"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LogoIcon;
