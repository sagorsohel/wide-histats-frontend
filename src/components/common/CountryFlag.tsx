import React from "react";

interface CountryFlagProps {
  code?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const REGION_NAMES =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export const getCountryName = (code?: string, fallback?: string): string => {
  if (!code || code === "UNKNOWN" || code === "XX") return fallback || "Unknown";
  try {
    return REGION_NAMES?.of(code.toUpperCase()) || fallback || code;
  } catch {
    return fallback || code;
  }
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  className = "",
  size = "sm",
}) => {
  if (!code || code.length !== 2 || code === "UNKNOWN" || code === "XX") {
    return <span className="text-xs select-none">🌐</span>;
  }

  const cleanCode = code.toLowerCase();
  const countryName = getCountryName(code);

  const sizeDimensions = {
    sm: { width: 16, height: 12, classes: "w-4 h-3" },
    md: { width: 20, height: 15, classes: "w-5 h-3.5" },
    lg: { width: 24, height: 16, classes: "w-6 h-4" },
  }[size];

  return (
    <span className="inline-flex items-center shrink-0 select-none" title={countryName}>
      <img
        src={`https://flagcdn.com/20x15/${cleanCode}.png`}
        srcSet={`https://flagcdn.com/40x30/${cleanCode}.png 2x`}
        width={sizeDimensions.width}
        height={sizeDimensions.height}
        alt={code.toUpperCase()}
        className={`rounded-[1.5px] shadow-2xs border border-slate-300/80 object-cover shrink-0 align-middle ${sizeDimensions.classes} ${className}`}
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
      />
    </span>
  );
};
