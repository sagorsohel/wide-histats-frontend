import React, { useState } from "react";

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

// Comprehensive country name -> ISO alpha-2 map
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  egypt: "eg",
  serbia: "rs",
  bangladesh: "bd",
  "united states": "us",
  usa: "us",
  america: "us",
  "united kingdom": "gb",
  uk: "gb",
  britain: "gb",
  england: "gb",
  germany: "de",
  deutschland: "de",
  turkey: "tr",
  türkiye: "tr",
  india: "in",
  pakistan: "pk",
  brazil: "br",
  france: "fr",
  canada: "ca",
  russia: "ru",
  italy: "it",
  spain: "es",
  netherlands: "nl",
  australia: "au",
  japan: "jp",
  china: "cn",
  indonesia: "id",
  nigeria: "ng",
  vietnam: "vn",
  philippines: "ph",
  mexico: "mx",
  argentina: "ar",
  colombia: "co",
  poland: "pl",
  ukraine: "ua",
  morocco: "ma",
  algeria: "dz",
  tunisia: "tn",
  iraq: "iq",
  "saudi arabia": "sa",
  uae: "ae",
  "united arab emirates": "ae",
  qatar: "qa",
  kuwait: "kw",
  oman: "om",
  malaysia: "my",
  singapore: "sg",
  thailand: "th",
  uzbekistan: "uz",
  kazakhstan: "kz",
  tajikistan: "tj",
  kyrgyzstan: "kg",
  hungary: "hu",
  romania: "ro",
  bulgaria: "bg",
  greece: "gr",
  sweden: "se",
  norway: "no",
  finland: "fi",
  denmark: "dk",
  switzerland: "ch",
  austria: "at",
  belgium: "be",
  portugal: "pt",
  ireland: "ie",
  "south africa": "za",
  kenya: "ke",
  ghana: "gh",
  chile: "cl",
  peru: "pe",
  ecuador: "ec",
  venezuela: "ve",
  croatia: "hr",
  czechia: "cz",
  "czech republic": "cz",
  slovakia: "sk",
  slovenia: "si",
  bosnia: "ba",
  "bosnia and herzegovina": "ba",
  albania: "al",
  "north macedonia": "mk",
  macedonia: "mk",
  montenegro: "me",
  israel: "il",
  palestine: "ps",
  lebanon: "lb",
  jordan: "jo",
  kuwaiti: "kw",
  bahrain: "bh",
  cyprus: "cy",
  malta: "mt",
  iceland: "is",
  luxembourg: "lu",
  nepal: "np",
  "sri lanka": "lk",
  myanmar: "mm",
  cambodia: "kh",
  taiwan: "tw",
  "hong kong": "hk",
  "south korea": "kr",
  korea: "kr",
  "new zealand": "nz",
};

// Common city -> ISO alpha-2 map
const CITY_TO_CODE: Record<string, string> = {
  cairo: "eg",
  alexandria: "eg",
  giza: "eg",
  belgrade: "rs",
  niš: "rs",
  nis: "rs",
  "novi sad": "rs",
  dhaka: "bd",
  chittagong: "bd",
  sylhet: "bd",
  rajshahi: "bd",
  khulna: "bd",
  istanbul: "tr",
  ankara: "tr",
  izmir: "tr",
  bursa: "tr",
  antalya: "tr",
  london: "gb",
  manchester: "gb",
  birmingham: "gb",
  "new york": "us",
  "los angeles": "us",
  chicago: "us",
  miami: "us",
  houston: "us",
  toronto: "ca",
  vancouver: "ca",
  montreal: "ca",
  paris: "fr",
  marseille: "fr",
  lyon: "fr",
  berlin: "de",
  munich: "de",
  hamburg: "de",
  frankfurt: "de",
  rome: "it",
  milan: "it",
  madrid: "es",
  barcelona: "es",
  amsterdam: "nl",
  rotterdam: "nl",
  sydney: "au",
  melbourne: "au",
  tokyo: "jp",
  delhi: "in",
  mumbai: "in",
  bangalore: "in",
  karachi: "pk",
  lahore: "pk",
  moscow: "ru",
  "saint petersburg": "ru",
  dubai: "ae",
  "abu dhabi": "ae",
  riyadh: "sa",
  jeddah: "sa",
  tashkent: "uz",
  samarkand: "uz",
  dushanbe: "tj",
  bishkek: "kg",
  budapest: "hu",
};

/**
 * Convert 2-letter ISO country code to native Unicode Flag Emoji (e.g. "EG" -> 🇪🇬, "RS" -> 🇷🇸)
 */
export const getCountryEmoji = (code?: string): string => {
  if (!code || code.length !== 2 || code.toUpperCase() === "XX") return "";
  try {
    const base = 127397;
    const upper = code.toUpperCase();
    const c1 = base + upper.charCodeAt(0);
    const c2 = base + upper.charCodeAt(1);
    return String.fromCodePoint(c1, c2);
  } catch {
    return "";
  }
};

export const resolveCountryCode = (countryName?: string, city?: string, code?: string): string => {
  if (code && code.length === 2 && code.toUpperCase() !== "XX" && code.toUpperCase() !== "UNKNOWN") {
    return code.toLowerCase();
  }
  const c = (countryName || "").toLowerCase().trim();
  const ct = (city || "").toLowerCase().trim();

  // 1. Direct dictionary match
  if (c && COUNTRY_NAME_TO_CODE[c]) {
    return COUNTRY_NAME_TO_CODE[c];
  }

  // 2. Partial country match
  for (const [name, isoCode] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (c.includes(name) || name.includes(c)) {
      return isoCode;
    }
  }

  // 3. City match fallback
  if (ct && CITY_TO_CODE[ct]) {
    return CITY_TO_CODE[ct];
  }

  return "";
};

export const getCountryName = (code?: string, fallback?: string): string => {
  if (!code || code.toUpperCase() === "UNKNOWN" || code.toUpperCase() === "XX") {
    return fallback || "Unknown";
  }
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
  const [imgFailed, setImgFailed] = useState(false);
  const resolved = resolveCountryCode(countryName, city, code);

  if (!resolved || resolved.length !== 2) {
    return <span className="text-xs select-none">🌐</span>;
  }

  const cleanCode = resolved.toLowerCase();
  const displayName = countryName || getCountryName(cleanCode);

  // If FlagCDN image fails or is blocked by an adblocker, fall back to native Unicode flag emoji!
  if (imgFailed) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 select-none text-sm leading-none cursor-default ${className}`}
        title={displayName}
      >
        {getCountryEmoji(cleanCode) || "🌐"}
      </span>
    );
  }

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
        onError={() => setImgFailed(true)}
      />
    </span>
  );
};
