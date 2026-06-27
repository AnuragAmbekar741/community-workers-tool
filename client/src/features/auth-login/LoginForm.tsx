import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";

import { Button } from "@/components/base/button";
import { WorkerSystemIdCallout } from "@/features/auth/components/WorkerSystemIdCallout";
import { getRegisteredSystemIdFromState } from "@/features/auth/lib/register-login-state";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/base/form";
import { Input } from "@/components/base/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { useLogin } from "@/hooks/use-login";
import { isApiError } from "@/lib/api-error";
import { getRoleHomePath } from "@/lib/auth-routes";
import {
  loginFormDefaultValues,
  loginFormSchema,
  toLoginRequest,
  type LoginFormValues,
} from "@/lib/login-schema";

type LoginFormProps = {
  embedded?: boolean;
};

export function LoginForm({ embedded = false }: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loginMutation = useLogin();
  const [rootError, setRootError] = useState<string | null>(null);

  const registeredSystemId = getRegisteredSystemIdFromState(location.state);
  const registeredPending =
    registeredSystemId !== undefined ||
    searchParams.get("registered") === "pending";
  const redirectTo = searchParams.get("redirect");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: loginFormDefaultValues,
  });

  const identifierType = form.watch("identifierType");

  async function onSubmit(values: LoginFormValues) {
    setRootError(null);

    try {
      const me = await loginMutation.mutateAsync(toLoginRequest(values));
      const destination =
        redirectTo && redirectTo.startsWith("/")
          ? redirectTo
          : getRoleHomePath(me.role);
      navigate(destination, { replace: true });
    } catch (error) {
      if (isApiError(error)) {
        setRootError(error.message);
        return;
      }

      setRootError("Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {registeredPending ? (
          <div className="space-y-3" role="status">
            <p className="text-base text-muted-foreground">
              Registration submitted. Sign in after an admin approves your
              account.
            </p>
            {registeredSystemId ? (
              <WorkerSystemIdCallout
                systemId={registeredSystemId}
                variant="success"
              />
            ) : null}
          </div>
        ) : null}

        {rootError ? (
          <div
            className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-base text-destructive"
            role="alert"
          >
            {rootError}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="identifierType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Log in with</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("phone", "");
                  form.setValue("systemId", "");
                }}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="phone">Phone number</SelectItem>
                  <SelectItem value="systemId">System ID</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {identifierType === "phone" ? (
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    autoComplete="tel"
                    className="h-11"
                    placeholder="+267..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="systemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System ID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="username"
                    className="h-11"
                    placeholder="ADMIN or CW0001"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="current-password"
                  className="h-11"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-base text-muted-foreground">
          {embedded ? "New to the pilot?" : "New worker?"}{" "}
          <Link
            to="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </Form>
  );
}
