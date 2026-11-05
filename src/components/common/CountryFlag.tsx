import React from "react";

interface CountryFlagProps {
  code?: string;
  countryName?: string;
  city?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const REGION_NAMES =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export const resolveCountryCode = (countryName?: string, city?: string, code?: string): string => {
  if (code && code.length === 2 && code !== "XX" && code !== "UNKNOWN") {
    return code.toLowerCase();
  }
  const c = (countryName || "").toLowerCase().trim();
  const ct = (city || "").toLowerCase().trim();

  // Country name detection
  if (c.includes("turkey") || c.includes("türkiye")) return "tr";
  if (c.includes("uzbekistan")) return "uz";
  if (c.includes("tajikistan")) return "tj";
  if (c.includes("kyrgyzstan")) return "kg";
  if (c.includes("hungary")) return "hu";
  if (c.includes("germany") || c.includes("deutschland")) return "de";
  if (c.includes("bangladesh")) return "bd";
  if (c.includes("united states") || c.includes("usa") || c.includes("america")) return "us";
  if (c.includes("united kingdom") || c.includes("britain") || c.includes("england")) return "gb";
  if (c.includes("canada")) return "ca";
  if (c.includes("france")) return "fr";
  if (c.includes("russia")) return "ru";
  if (c.includes("india")) return "in";
  if (c.includes("pakistan")) return "pk";
  if (c.includes("spain")) return "es";
  if (c.includes("italy")) return "it";
  if (c.includes("brazil")) return "br";
  if (c.includes("netherlands")) return "nl";
  if (c.includes("australia")) return "au";
  if (c.includes("japan")) return "jp";

  // City name detection fallback
  if (ct === "istanbul" || ct === "ankara" || ct === "izmir" || ct === "bursa" || ct === "antalya") return "tr";
  if (ct === "tashkent" || ct === "samarkand" || ct === "bukhara") return "uz";
  if (ct === "dushanbe" || ct === "khujand") return "tj";
  if (ct === "bishkek" || ct === "osh") return "kg";
  if (ct === "budapest" || ct === "debrecen") return "hu";
  if (ct === "berlin" || ct === "munich" || ct === "hamburg" || ct === "frankfurt") return "de";
  if (ct === "dhaka" || ct === "chittagong" || ct === "sylhet") return "bd";
  if (ct === "london" || ct === "manchester" || ct === "birmingham") return "gb";
  if (ct === "new york" || ct === "los angeles" || ct === "chicago" || ct === "miami") return "us";
  if (ct === "toronto" || ct === "vancouver" || ct === "montreal") return "ca";
  if (ct === "paris" || ct === "marseille" || ct === "lyon") return "fr";

  return "";
};

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
  countryName,
  city,
  className = "",
  size = "sm",
}) => {
  const resolved = resolveCountryCode(countryName, city, code);

  if (!resolved || resolved.length !== 2) {
    return <span className="text-xs select-none">🌐</span>;
  }

  const cleanCode = resolved.toLowerCase();
  const displayName = countryName || getCountryName(cleanCode);

  const sizeDimensions = {
    sm: { width: 16, height: 12, classes: "w-4 h-3" },
    md: { width: 20, height: 15, classes: "w-5 h-3.5" },
    lg: { width: 24, height: 16, classes: "w-6 h-4" },
  }[size];

  return (
    <span className="inline-flex items-center shrink-0 select-none" title={displayName}>
      <img
        src={`https://flagcdn.com/24x18/${cleanCode}.png`}
        srcSet={`https://flagcdn.com/48x36/${cleanCode}.png 2x`}
        width={sizeDimensions.width}
        height={sizeDimensions.height}
        alt={cleanCode.toUpperCase()}
        className={`rounded-[2px] shadow-2xs border border-slate-300/80 object-cover shrink-0 align-middle ${sizeDimensions.classes} ${className}`}
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
      />
    </span>
  );
};
