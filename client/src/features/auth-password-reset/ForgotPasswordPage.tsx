import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { Button } from "@/components/base/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/base/form";
import { Input } from "@/components/base/input";
import { LandingBrandMark } from "@/features/landing/LandingBrandMark";
import {
  useConfirmResetPhone,
  useResetPassword,
} from "@/hooks/use-password-reset";
import { isApiError } from "@/lib/api-error";
import {
  confirmPhoneSchema,
  newPasswordSchema,
  type ConfirmPhoneValues,
  type NewPasswordValues,
} from "@/lib/password-reset-schema";

type Step = "phone" | "password" | "complete";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("phone");
  const [resetToken, setResetToken] = useState("");
  const [confirmedPhone, setConfirmedPhone] = useState("");
  const [rootError, setRootError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const confirmPhoneMutation = useConfirmResetPhone();
  const resetPasswordMutation = useResetPassword();

  const phoneForm = useForm<ConfirmPhoneValues>({
    resolver: zodResolver(confirmPhoneSchema),
    defaultValues: { phone: "" },
    mode: "onBlur",
  });

  const passwordForm = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  async function confirmPhone(values: ConfirmPhoneValues) {
    setRootError(null);
    try {
      const result = await confirmPhoneMutation.mutateAsync({
        phone: values.phone.trim(),
      });
      setResetToken(result.resetToken);
      setConfirmedPhone(values.phone.trim());
      setStep("password");
    } catch (error) {
      setRootError(
        isApiError(error)
          ? error.message
          : "We could not confirm that phone number. Please try again.",
      );
    }
  }

  async function savePassword(values: NewPasswordValues) {
    setRootError(null);
    try {
      await resetPasswordMutation.mutateAsync({
        resetToken,
        password: values.password,
      });
      setResetToken("");
      setStep("complete");
    } catch (error) {
      setRootError(
        isApiError(error)
          ? error.message
          : "We could not reset your password. Please try again.",
      );
    }
  }

  function returnToPhoneStep() {
    setRootError(null);
    setResetToken("");
    passwordForm.reset();
    setStep("phone");
  }

  return (
    <main className="grid min-h-dvh bg-muted/40 lg:grid-cols-[minmax(320px,0.8fr)_minmax(520px,1.2fr)]">
      <aside className="hidden bg-landing-hero-bg px-12 py-14 text-landing-hero-fg lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <LandingBrandMark />
          <span className="text-base font-semibold tracking-tight">
            Fieldwork platform
          </span>
        </div>
        <div className="max-w-md space-y-5">
          <div className="flex size-12 items-center justify-center rounded-lg border border-landing-hero-divider bg-white/5">
            <ShieldCheck
              className="size-6 text-landing-hero-accent"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Secure access, restored simply.
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-landing-hero-muted">
            Confirm the phone number registered to your account, then choose a
            new password.
          </p>
        </div>
        <p className="text-sm text-landing-hero-muted-subtle">
          Your recovery session expires after 10 minutes.
        </p>
      </aside>

      <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to sign in
          </Link>

          <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            {step !== "complete" ? (
              <ol
                className="mb-8 grid grid-cols-2 gap-3"
                aria-label="Password reset progress"
              >
                <ProgressStep
                  number={1}
                  label="Confirm phone"
                  state={step === "phone" ? "current" : "complete"}
                />
                <ProgressStep
                  number={2}
                  label="New password"
                  state={step === "password" ? "current" : "upcoming"}
                />
              </ol>
            ) : null}

            {step === "phone" ? (
              <>
                <header className="mb-6 space-y-2">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="size-5" aria-hidden="true" />
                  </div>
                  <h1 className="pt-2 text-2xl font-semibold">
                    Forgot password?
                  </h1>
                  <p className="text-muted-foreground">
                    Enter the phone number linked to your worker or user
                    account.
                  </p>
                </header>

                <Form {...phoneForm}>
                  <form
                    className="space-y-5"
                    onSubmit={phoneForm.handleSubmit(confirmPhone)}
                  >
                    <RootError message={rootError} />
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registered phone number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="+267..."
                              autoFocus
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Use the same number you provided when registering.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="h-12 w-full"
                      disabled={confirmPhoneMutation.isPending}
                    >
                      {confirmPhoneMutation.isPending
                        ? "Confirming…"
                        : "Confirm phone number"}
                    </Button>
                  </form>
                </Form>
              </>
            ) : null}

            {step === "password" ? (
              <>
                <header className="mb-6 space-y-2">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <LockKeyhole className="size-5" aria-hidden="true" />
                  </div>
                  <h1 className="pt-2 text-2xl font-semibold">
                    Create a new password
                  </h1>
                  <p className="text-muted-foreground">
                    Phone number confirmed:{" "}
                    <span className="font-medium text-foreground">
                      {confirmedPhone}
                    </span>
                  </p>
                </header>

                <Form {...passwordForm}>
                  <form
                    className="space-y-5"
                    onSubmit={passwordForm.handleSubmit(savePassword)}
                  >
                    <RootError message={rootError} />
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                className="h-12 pr-12"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                autoFocus
                              />
                            </FormControl>
                            <button
                              type="button"
                              className="absolute right-0 top-0 flex size-12 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                              onClick={() => setShowPassword((value) => !value)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              aria-pressed={showPassword}
                            >
                              {showPassword ? (
                                <EyeOff className="size-5" />
                              ) : (
                                <Eye className="size-5" />
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Use at least 8 characters.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm new password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-12"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="h-12 w-full"
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending
                        ? "Updating password…"
                        : "Reset password"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 w-full"
                      onClick={returnToPhoneStep}
                      disabled={resetPasswordMutation.isPending}
                    >
                      Use a different phone number
                    </Button>
                  </form>
                </Form>
              </>
            ) : null}

            {step === "complete" ? (
              <div className="py-2 text-center" role="status">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="size-7" aria-hidden="true" />
                </div>
                <h1 className="mt-5 text-2xl font-semibold">Password updated</h1>
                <p className="mt-2 text-muted-foreground">
                  Your new password is ready. You can now sign in to your
                  account.
                </p>
                <Button asChild className="mt-7 h-12 w-full">
                  <Link to="/login">Continue to sign in</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function ProgressStep({
  number,
  label,
  state,
}: {
  number: number;
  label: string;
  state: "current" | "complete" | "upcoming";
}) {
  return (
    <li
      className="flex items-center gap-2 text-sm"
      aria-current={state === "current" ? "step" : undefined}
    >
      <span
        className={
          state === "upcoming"
            ? "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-muted-foreground"
            : "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        }
      >
        {state === "complete" ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          number
        )}
      </span>
      <span
        className={
          state === "upcoming"
            ? "text-muted-foreground"
            : "font-medium text-foreground"
        }
      >
        {label}
      </span>
    </li>
  );
}

function RootError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {message}
    </div>
  );
}
