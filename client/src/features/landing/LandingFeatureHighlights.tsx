import { FileOutput, RefreshCw, Smartphone } from "lucide-react";

const FEATURES = [
  {
    icon: Smartphone,
    text: "Log sessions from your phone in the field",
  },
  {
    icon: RefreshCw,
    text: "Reach syncs to the supervisor dashboard",
  },
  {
    icon: FileOutput,
    text: "Review and export for government handover",
  },
] as const;

export function LandingFeatureHighlights() {
  return (
    <ul className="space-y-4">
      {FEATURES.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-white/10"
          >
            <Icon className="size-4 text-landing-hero-fg" strokeWidth={2} />
          </span>
          <p className="text-base leading-relaxed text-landing-hero-muted">
            {text}
          </p>
        </li>
      ))}
    </ul>
  );
}
