import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/base/button";
import { Checkbox } from "@/components/base/checkbox";
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
import { useRegister } from "@/hooks/use-register";
import { WorkerSystemIdCallout } from "@/features/auth/components/WorkerSystemIdCallout";
import {
  DISTRICT_OPTIONS,
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  ORGANISATION_OPTIONS,
  VILLAGE_OPTIONS,
  WORKER_ROLE_OPTIONS,
} from "@/lib/constants";
import { isApiError } from "@/lib/api-error";
import {
  registerFormDefaultValues,
  registerFormSchema,
  toRegisterRequest,
  type RegisterFormInput,
  type RegisterFormValues,
} from "@/lib/register-schema";

export function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [rootError, setRootError] = useState<string | null>(null);
  const [registeredSystemId, setRegisteredSystemId] = useState<string | null>(
    null,
  );

  const form = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerFormSchema) as Resolver<
      RegisterFormInput,
      unknown,
      RegisterFormValues
    >,
    defaultValues: registerFormDefaultValues,
  });

  async function onSubmit(values: RegisterFormValues) {
    setRootError(null);
    try {
      const result = await registerMutation.mutateAsync(toRegisterRequest(values));
      setRegisteredSystemId(result.user.systemId);
    } catch (error) {
      if (isApiError(error)) {
        setRootError(error.message);
      } else {
        setRootError("Registration failed. Please try again.");
      }
    }
  }

  if (registeredSystemId) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Registration submitted</h2>
          <p className="text-base text-muted-foreground">
            Your account is awaiting admin approval. You cannot log sessions
            until you are approved.
          </p>
        </div>

        <WorkerSystemIdCallout systemId={registeredSystemId} variant="success" />

        <Button
          type="button"
          className="h-11 w-full"
          onClick={() =>
            navigate("/login", {
              replace: true,
              state: { registeredSystemId },
            })
          }
        >
          Continue to sign in
        </Button>

        <Button asChild variant="outline" className="h-11 w-full">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  autoComplete="off"
                  value={value === undefined || value === null ? "" : String(value)}
                  onChange={(event) => onChange(event.target.value)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organisation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisation</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select organisation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ORGANISATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workerRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Worker role</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {WORKER_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EDUCATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DISTRICT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="villages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Villages</FormLabel>
              <div className="space-y-2 rounded-md border border-border p-3">
                {VILLAGE_OPTIONS.map((option) => {
                  const checked = field.value.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex min-h-11 cursor-pointer items-center gap-3"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          if (isChecked === true) {
                            field.onChange([...field.value, option.value]);
                            return;
                          }
                          field.onChange(
                            field.value.filter((v) => v !== option.value),
                          );
                        }}
                      />
                      <span className="text-base">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentGiven"
          render={({ field }) => (
            <FormItem>
              <div className="flex min-h-11 items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel className="font-normal">
                    I consent to my data being collected for this programme
                  </FormLabel>
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />

        {rootError ? (
          <p className="text-sm text-destructive" role="alert">
            {rootError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? "Registering…" : "Register"}
        </Button>

        <Button asChild variant="outline" className="w-full">
          <Link to="/">Back to home</Link>
        </Button>
      </form>
    </Form>
  );
}
