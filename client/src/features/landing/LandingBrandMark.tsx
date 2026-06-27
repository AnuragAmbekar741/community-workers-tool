type LandingBrandMarkProps = {
  className?: string;
};

export function LandingBrandMark({ className }: LandingBrandMarkProps) {
  return (
    <div
      className={className}
      aria-hidden="true"
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label=""
      >
        <rect width="36" height="36" rx="8" fill="var(--landing-hero-accent)" />
        <rect x="10" y="17" width="4" height="10" rx="1" fill="white" />
        <rect x="16" y="11" width="4" height="16" rx="1" fill="white" />
        <rect x="22" y="20" width="4" height="7" rx="1" fill="white" />
      </svg>
    </div>
  );
}
