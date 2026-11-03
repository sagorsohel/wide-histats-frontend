import React from "react";

export interface IconProps {
  size?: number;
  className?: string;
}

// 1. Chrome Official SVG
export const ChromeIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <circle cx="24" cy="24" r="20" fill="#ffffff" />
    <path
      fill="#4CAF50"
      d="M24 44c8.4 0 15.6-5.2 18.5-12.6L29.3 20.3C27.9 22.5 25.4 24 22.5 24c-1.3 0-2.5-.3-3.6-.9L8.4 34.6C12.3 40.3 18.7 44 24 44z"
    />
    <path
      fill="#FFC107"
      d="M42.5 31.4C43.5 29.1 44 26.6 44 24c0-10.5-8.1-19.1-18.4-19.9L15.3 15.6C17.2 13.4 20 12 23.2 12c4.1 0 7.7 2.3 9.6 5.7l9.7 13.7z"
    />
    <path
      fill="#F44336"
      d="M24 4C14.7 4 6.9 10.4 4.6 19l10.3 5.9c.7-4.4 4.5-7.8 9.1-7.8h19.6C41.6 9.8 33.6 4 24 4z"
    />
    <circle cx="24" cy="24" r="8.5" fill="#ffffff" />
    <circle cx="24" cy="24" r="6.8" fill="#1976D2" />
  </svg>
);

// 2. Safari Official Compass SVG
export const SafariIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <defs>
      <linearGradient id="safariBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1EA4E9" />
        <stop offset="100%" stopColor="#0B66D0" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="22" fill="url(#safariBg)" />
    <circle cx="24" cy="24" r="20.5" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" strokeDasharray="1.5 2.5" />
    <circle cx="24" cy="24" r="16.5" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.4" />
    {/* Compass Needle Angled 45 deg */}
    <g transform="rotate(45 24 24)">
      <polygon points="24,5 28.5,24 19.5,24" fill="#FF3B30" />
      <polygon points="24,43 28.5,24 19.5,24" fill="#FFFFFF" />
      <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" />
      <circle cx="24" cy="24" r="1.2" fill="#FF3B30" />
    </g>
  </svg>
);

// 3. Firefox Official SVG
export const FirefoxIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <defs>
      <radialGradient id="ffGlobe" cx="65%" cy="65%" r="55%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E1B4B" />
      </radialGradient>
      <linearGradient id="ffTail" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFA000" />
        <stop offset="50%" stopColor="#FF3D00" />
        <stop offset="100%" stopColor="#D500F9" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="17" fill="url(#ffGlobe)" />
    <path
      d="M39.6 15.3c-.9-2.3-2.6-4.5-4.6-6-1.5 1.8-2.6 3.9-3.2 6.2-2.3-1.8-5.2-2.9-8.4-2.8-8.5.2-15.4 7.2-15.4 15.7 0 2.9.8 5.6 2.2 7.9-1.2-1.9-1.9-4.2-1.9-6.6 0-5.8 4.2-10.7 9.8-11.7-.5.9-.8 2-.8 3.1 0 3.3 2.7 6 6 6 1.1 0 2.2-.3 3.1-.8 1.4 4.5 5.5 7.8 10.4 7.8 6 0 10.9-4.9 10.9-10.9 0-2.8-1-5.4-2.8-7.4-1.8-1.5-3.5-.5-5.3-.5z"
      fill="url(#ffTail)"
    />
  </svg>
);

// 4. Edge Official Wave SVG
export const EdgeIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <defs>
      <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0C59A4" />
        <stop offset="100%" stopColor="#119BE2" />
      </linearGradient>
      <linearGradient id="edgeCrest" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00D2B4" />
        <stop offset="100%" stopColor="#28D890" />
      </linearGradient>
    </defs>
    <path
      d="M42 27c-.2 8.3-7 15-15.3 15-8.5 0-15.4-6.9-15.4-15.4 0-8.2 6.4-14.9 14.5-15.3 1.3 2.1 2 4.6 2 7.2 0 7.3-6 13.3-13.3 13.3-1.1 0-2.1-.1-3.1-.4C12.8 36.6 18.5 40 25.2 40c7.8 0 14.2-5.9 14.8-13.6L42 27z"
      fill="url(#edgeGrad)"
    />
    <path
      d="M23.8 6C13.9 6 6 13.9 6 23.8c0 2.6.6 5.1 1.6 7.4 1-.3 2.1-.5 3.2-.5 7.3 0 13.3 6 13.3 13.3 0 1.1-.1 2.1-.4 3.1 7.2-1.4 12.8-7.1 13.9-14.3.4-2.8-.2-5.6-1.7-8L26 24.5c-.3-1.6.4-3.3 1.8-4.1l11.4-6.6C35.5 8.7 30 6 23.8 6z"
      fill="url(#edgeCrest)"
    />
  </svg>
);

// 5. Opera Official 'O' SVG
export const OperaIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <defs>
      <linearGradient id="operaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF1B2D" />
        <stop offset="100%" stopColor="#A70014" />
      </linearGradient>
    </defs>
    <path
      d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4zm0 33c-6.1 0-11-5.8-11-13s4.9-13 11-13 11 5.8 11 13-4.9 13-11 13z"
      fill="url(#operaGrad)"
    />
  </svg>
);

// 6. Samsung Internet Official Purple Planet SVG
export const SamsungInternetIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <circle cx="24" cy="24" r="16" fill="#1C1862" />
    <ellipse cx="24" cy="24" rx="22" ry="7" fill="none" stroke="#8A46E4" strokeWidth="2.5" transform="rotate(-30 24 24)" />
    <circle cx="24" cy="24" r="11" fill="#7C3AED" />
  </svg>
);

// 7. Brave Lion Shield SVG
export const BraveIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <path
      d="M24 4L7 9.5v13.8c0 11.2 7.2 21.6 17 24.7 9.8-3.1 17-13.5 17-24.7V9.5L24 4z"
      fill="#FB542B"
    />
    <path
      d="M24 10l-10 3.2v8.1c0 6.6 4.2 12.7 10 14.6 5.8-1.9 10-8 10-14.6v-8.1L24 10z"
      fill="#FF7A38"
    />
    <circle cx="19" cy="20" r="2" fill="#FFFFFF" />
    <circle cx="29" cy="20" r="2" fill="#FFFFFF" />
    <polygon points="24,24 21,28 27,28" fill="#FFFFFF" />
  </svg>
);

// 8. Generic Browser Window SVG
export const DefaultBrowserIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 inline-block align-middle text-slate-500 ${className}`}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="M6 8h.01M10 8h.01M14 8h.01M2 11h20" />
  </svg>
);

// 9. Windows Official 4-panel Blue SVG
export const WindowsIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <path fill="#0078D7" d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
  </svg>
);

// 10. Apple Official Silhouette SVG
export const AppleIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 inline-block align-middle text-slate-700 ${className}`}
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.34-.55.63-.98 1.68-.85 2.72 1 .08 2.01-.51 2.54-1.21z" />
  </svg>
);

// 11. Android Official Robot Head SVG
export const AndroidIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="#3DDC84"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 4.26 6 5.92 6 7.8h12c0-1.88-.97-3.54-2.47-4.64zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

// 12. Linux Official Penguin SVG
export const LinuxIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 inline-block align-middle text-slate-800 ${className}`}
  >
    <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.2.5 2.3 1.2 3.1-.3 1.1-.7 2.6-.7 4.4 0 3.3 2 6 5 6s5-2.7 5-6c0-1.8-.4-3.3-.7-4.4.7-.8 1.2-1.9 1.2-3.1C18.5 4 16.5 2 14 2h-2zm-1.5 4a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zm3 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zm-2.8 2.2c.4-.2 1.2-.2 1.6 0l.4.5c-.3.4-1.1.7-1.6.7s-1.3-.3-1.6-.7l1.2-.5z" />
    <path fill="#F59E0B" d="M12 9.5c-.8 0-1.5.3-2 .8 1-.2 2.5-.2 3.5 0-.5-.5-1-.8-1.5-.8z" />
  </svg>
);

// 13. Google Official 4-color 'G' SVG
export const GoogleIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// 14. Blogger / Blogspot Official Orange 'B' SVG
export const BloggerIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <rect width="24" height="24" rx="5" fill="#FF5722" />
    <path
      fill="#FFFFFF"
      d="M16.5 14.2c0 1.27-1.03 2.3-2.3 2.3H9.8c-1.27 0-2.3-1.03-2.3-2.3V9.8c0-1.27 1.03-2.3 2.3-2.3h4.4c1.27 0 2.3 1.03 2.3 2.3v.8c0 .6-.5 1.1-1.1 1.1.6 0 1.1.5 1.1 1.1v1.4zm-4.7-4.8h-2v2h2v-2zm2.3 4.2h-4.3v2h4.3v-2z"
    />
  </svg>
);

// 15. Facebook Official SVG
export const FacebookIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="#1877F2"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// 16. YouTube Official SVG
export const YouTubeIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="#FF0000"
    className={`shrink-0 inline-block align-middle ${className}`}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// 17. Twitter / X Official SVG
export const TwitterXIcon: React.FC<IconProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 inline-block align-middle text-slate-900 ${className}`}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// -------------------------------------------------------------
// UNIFIED RESOLVER COMPONENTS
// -------------------------------------------------------------

/**
 * Real Brand Icon for Web Browsers (Chrome, Safari, Firefox, Edge, Opera, Samsung, Brave, etc.)
 */
export const BrowserIcon: React.FC<{
  browser?: string;
  os?: string;
  size?: number;
  className?: string;
}> = ({ browser, os, size = 15, className = "" }) => {
  const b = (browser || "").toLowerCase().trim();
  const o = (os || "").toLowerCase().trim();

  if (b.includes("chrome") || b.includes("chromium") || b.includes("crios")) {
    return <ChromeIcon size={size} className={className} />;
  }
  if (b.includes("safari") || b.includes("applewebkit") || b.includes("mobile safari")) {
    return <SafariIcon size={size} className={className} />;
  }
  if (b.includes("firefox") || b.includes("fxios")) {
    return <FirefoxIcon size={size} className={className} />;
  }
  if (b.includes("edge") || b.includes("edg")) {
    return <EdgeIcon size={size} className={className} />;
  }
  if (b.includes("opera") || b.includes("opr")) {
    return <OperaIcon size={size} className={className} />;
  }
  if (b.includes("samsung")) {
    return <SamsungInternetIcon size={size} className={className} />;
  }
  if (b.includes("brave")) {
    return <BraveIcon size={size} className={className} />;
  }

  // Smart fallback based on OS (iOS/Mac -> Safari, Android/Windows -> Chrome)
  if (o.includes("ios") || o.includes("iphone") || o.includes("ipad") || o.includes("mac") || o.includes("apple")) {
    return <SafariIcon size={size} className={className} />;
  }
  if (o.includes("android") || o.includes("windows") || o.includes("linux")) {
    return <ChromeIcon size={size} className={className} />;
  }

  return <ChromeIcon size={size} className={className} />;
};

/**
 * Real Brand Icon for Operating Systems (Windows, Apple / iOS / macOS, Android, Linux)
 */
export const OsIcon: React.FC<{
  os?: string;
  deviceType?: string;
  size?: number;
  className?: string;
}> = ({ os, deviceType, size = 14, className = "" }) => {
  const o = (os || "").toLowerCase().trim();
  const d = (deviceType || "").toLowerCase().trim();

  if (
    o.includes("ios") ||
    o.includes("iphone") ||
    o.includes("ipad") ||
    o.includes("mac") ||
    o.includes("apple") ||
    o.includes("darwin")
  ) {
    return <AppleIcon size={size} className={className} />;
  }

  if (o.includes("android")) {
    return <AndroidIcon size={size} className={className} />;
  }

  if (o.includes("windows") || o.includes("win")) {
    return <WindowsIcon size={size} className={className} />;
  }

  if (o.includes("linux") || o.includes("ubuntu") || o.includes("debian") || o.includes("fedora")) {
    return <LinuxIcon size={size} className={className} />;
  }

  if (d === "mobile") {
    return <AndroidIcon size={size} className={className} />;
  }

  return <WindowsIcon size={size} className={className} />;
};

/**
 * Real Brand Icon for Incoming Referrers (Google, Blogspot, Facebook, YouTube, Twitter/X, etc.)
 */
export const ReferrerBrandIcon: React.FC<{
  referrer?: string | null;
  browser?: string;
  size?: number;
  className?: string;
}> = ({ referrer, browser, size = 15, className = "" }) => {
  const ref = (referrer || "").toLowerCase().trim();

  if (ref.includes("google")) {
    return <GoogleIcon size={size} className={className} />;
  }
  if (ref.includes("blogspot") || ref.includes("blogger")) {
    return <BloggerIcon size={size} className={className} />;
  }
  if (ref.includes("facebook") || ref.includes("fb.me") || ref.includes("fb.com")) {
    return <FacebookIcon size={size} className={className} />;
  }
  if (ref.includes("youtube") || ref.includes("youtu.be")) {
    return <YouTubeIcon size={size} className={className} />;
  }
  if (ref.includes("twitter") || ref.includes("t.co") || ref.includes("x.com")) {
    return <TwitterXIcon size={size} className={className} />;
  }

  // Fallback to real browser icon if direct or web
  return <BrowserIcon browser={browser} size={size} className={className} />;
};
