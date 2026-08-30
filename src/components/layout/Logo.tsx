import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: number | string;
}

export function LogoIcon({ className, size = 32 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200 group-hover:scale-105", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Primary gradient */}
        <linearGradient id="omni-grad-primary" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Accent cyan-blue gradient */}
        <linearGradient id="omni-grad-accent" x1="12" y1="8" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Subtle highlight overlay */}
        <linearGradient id="omni-grad-glow" x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Drop shadow */}
        <filter id="omni-shadow" x="0" y="2" width="48" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#omni-shadow)">
        {/* Outer squircle base */}
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill="url(#omni-grad-primary)"
        />

        {/* Inner glow border */}
        <rect
          x="4.5"
          y="4.5"
          width="39"
          height="39"
          rx="11.5"
          stroke="url(#omni-grad-glow)"
          strokeWidth="1"
          fill="none"
        />

        {/* Modern Geometric Omni/Tool Emblem: Interlocking dynamic polygons */}
        <path
          d="M14 18L24 12L34 18V30L24 36L14 30V18Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeOpacity="0.95"
          fill="url(#omni-grad-accent)"
          fillOpacity="0.25"
        />

        {/* Center precision node & dynamic crossbar */}
        <path
          d="M24 12V36"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <path
          d="M14 24H34"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Center core glowing gem */}
        <circle cx="24" cy="24" r="3.5" fill="white" />
        <circle cx="24" cy="24" r="1.75" fill="#4F46E5" />
      </g>
    </svg>
  );
}

interface LogoProps {
  className?: string;
  showDomain?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showDomain = true, size = "md" }: LogoProps) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 font-heading font-bold tracking-tight text-foreground transition-colors hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg",
        className
      )}
    >
      <LogoIcon size={iconSizes[size]} />
      <div className="flex flex-col">
        <span className={cn("leading-tight font-extrabold tracking-tight font-heading flex items-center gap-1", textSizes[size])}>
          <span>OmniTools</span>
        </span>
        {showDomain && (
          <span className="text-[10px] font-mono text-muted-foreground font-normal tracking-wide">
            tools.rokyuddin.com
          </span>
        )}
      </div>
    </Link>
  );
}
