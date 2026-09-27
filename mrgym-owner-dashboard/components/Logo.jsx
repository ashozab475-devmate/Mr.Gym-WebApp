export default function Logo({ className = "", mark = "auto" }) {
  // mark: "auto" (icon on all sizes), "iconOnly", or "full" (icon + wordmark)
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="9" fill="#E2492F" />
        {/* stylised dumbbell forming an M-like silhouette */}
        <rect x="5" y="13" width="4" height="6" rx="1" fill="#171613" />
        <rect x="23" y="13" width="4" height="6" rx="1" fill="#171613" />
        <rect x="9" y="15" width="14" height="2" rx="1" fill="#F3EFE6" />
        <circle cx="7" cy="16" r="1.4" fill="#F0B429" />
        <circle cx="25" cy="16" r="1.4" fill="#F0B429" />
      </svg>
      {mark !== "iconOnly" && (
        <span className="font-display text-2xl font-bold tracking-tight">
          Mr<span className="text-coral">Gym</span>
        </span>
      )}
    </span>
  );
}
