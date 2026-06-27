import { Fragment } from "react";

import { LandingBrandMark } from "./LandingBrandMark";
import { LandingFeatureHighlights } from "./LandingFeatureHighlights";

const HIGHLIGHTS = [
  {
    title: "District pilot",
    description: "Field-based M&E",
  },
  {
    title: "Community workers",
    description: "Mobile session logging",
  },
  {
    title: "Handover-ready",
    description: "DHIS2 / KoboToolbox export path",
  },
] as const;

export function LandingHeroPanel() {
  return (
    <section
      aria-labelledby="landing-hero-heading"
      className="flex min-h-dvh w-full flex-col justify-between bg-landing-hero-bg px-6 py-10 text-landing-hero-fg sm:px-10 sm:py-12 lg:px-14 lg:py-14"
    >
      <div className="space-y-8 lg:my-auto">
        <div className="flex items-center gap-3">
          <LandingBrandMark />
          <div>
            <p className="text-base font-semibold leading-tight">
              Community Worker M&E Tool
            </p>
            <p className="mt-0.5 text-xs tracking-widest text-landing-hero-muted-subtle uppercase">
              District M&E pilot
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <h1
            id="landing-hero-heading"
            className="text-3xl font-semibold leading-tight tracking-tight lg:text-4xl"
          >
            Monitoring & evaluation, built for the field.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-landing-hero-muted">
            Community workers log sessions from their phones. Supervisors and
            researchers see it all on one dashboard — designed for clean handover
            to government partners.
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-y-4">
          {HIGHLIGHTS.map((highlight, index) => (
            <Fragment key={highlight.title}>
              {index > 0 ? (
                <div
                  aria-hidden="true"
                  className="mx-7 hidden h-10 w-px bg-landing-hero-divider sm:block"
                />
              ) : null}
              <div>
                <p className="text-sm font-semibold">{highlight.title}</p>
                <p className="mt-0.5 text-xs text-landing-hero-muted-subtle">
                  {highlight.description}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="mt-10 max-w-lg lg:mt-12">
        <LandingFeatureHighlights />
      </div>
    </section>
  );
}
