import type { SVGProps } from "react";

type IconName =
  | "menu"
  | "search"
  | "sun"
  | "moon"
  | "today"
  | "missed"
  | "spark"
  | "tasks"
  | "lists"
  | "due"
  | "reminder"
  | "repeat"
  | "sort"
  | "more"
  | "check";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, ...props }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8
  };

  switch (name) {
    case "menu":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path {...common} d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <circle {...common} cx="11" cy="11" r="6.5" />
          <path {...common} d="m16.2 16.2 3.8 3.8" />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <circle {...common} cx="12" cy="12" r="4.5" />
          <path
            {...common}
            d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"
          />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path
            {...common}
            d="M14.8 3.5a8 8 0 1 0 5.7 12.9A8.5 8.5 0 0 1 14.8 3.5Z"
          />
        </svg>
      );
    case "today":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <rect {...common} x="4.5" y="5.5" width="15" height="14" rx="2.5" />
          <path {...common} d="M8 3.5v4M16 3.5v4M4.5 9.5h15" />
        </svg>
      );
    case "missed":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path {...common} d="M12 6v6l4 2" />
          <circle {...common} cx="12" cy="12" r="8" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path
            {...common}
            d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z"
          />
          <path {...common} d="M18.5 15.5 19.5 18l2.5 1-2.5 1-1 2.5-1-2.5L15 19l2.5-1Z" />
        </svg>
      );
    case "tasks":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path {...common} d="M8 7.5h10M8 12h10M8 16.5h10" />
          <circle {...common} cx="4.8" cy="7.5" r="1.3" />
          <circle {...common} cx="4.8" cy="12" r="1.3" />
          <circle {...common} cx="4.8" cy="16.5" r="1.3" />
        </svg>
      );
    case "lists":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path
            {...common}
            d="M9 7h10M9 12h10M9 17h10M4.5 7h.01M4.5 12h.01M4.5 17h.01"
          />
        </svg>
      );
    case "due":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <rect {...common} x="4.5" y="5.5" width="15" height="14" rx="2.5" />
          <path {...common} d="M8 3.5v4M16 3.5v4M4.5 9.5h15M9.5 13h5" />
        </svg>
      );
    case "reminder":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path
            {...common}
            d="M8 17.5h8l-1-1.5v-4a3 3 0 1 0-6 0v4Zm2.5 2h3"
          />
        </svg>
      );
    case "repeat":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path {...common} d="M7 7h9l-2-2M17 17H8l2 2M17 7v4M7 17v-4" />
        </svg>
      );
    case "sort":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path
            {...common}
            d="M7 5v14m0 0-2.5-2.5M7 19l2.5-2.5M17 19V5m0 0-2.5 2.5M17 5l2.5 2.5"
          />
        </svg>
      );
    case "more":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
          <path {...common} d="m6.5 12.5 3.6 3.6 7.4-8.1" />
        </svg>
      );
  }
}
