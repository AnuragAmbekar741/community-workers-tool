import { LandingHeroPanel } from "./LandingHeroPanel";
import { LandingSignInPanel } from "./LandingSignInPanel";

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="order-1 w-full lg:order-2 lg:w-[42%]">
        <LandingSignInPanel />
      </div>
      <div className="order-2 w-full lg:order-1 lg:w-[58%]">
        <LandingHeroPanel />
      </div>
    </div>
  );
}
