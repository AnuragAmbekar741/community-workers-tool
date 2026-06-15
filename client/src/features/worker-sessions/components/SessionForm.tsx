import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { Textarea } from "@/components/base/textarea";
import { useCreateSession } from "@/hooks/use-sessions";
import { TOPIC_OPTIONS, VILLAGE_OPTIONS, type Village } from "@/lib/constants";
import { isApiError } from "@/lib/api-error";
import {
  computeTotalReached,
  createSessionFormSchema,
  sessionFormDefaultValues,
  toCreateSessionRequest,
  type SessionFormInput,
  type SessionFormValues,
} from "@/lib/session-schema";

type SessionFormProps = {
  allowedVillages: Village[];
};

function NumberField({
  name,
  label,
  control,
}: {
  name:
    | "durationMin"
    | "nWomen"
    | "nMen"
    | "nGirls"
    | "nBoys"
    | "nElders"
    | "nOthers";
  label: string;
  control: ReturnType<typeof useForm<SessionFormInput>>["control"];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="numeric"
              min={name === "durationMin" ? 10 : 0}
              max={name === "durationMin" ? 300 : undefined}
              value={value === undefined || value === null ? "" : String(value)}
              onChange={(event) => onChange(event.target.value)}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SessionForm({ allowedVillages }: SessionFormProps) {
  const navigate = useNavigate();
  const createSessionMutation = useCreateSession();
  const [rootError, setRootError] = useState<string | null>(null);

  const schema = useMemo(
    () => createSessionFormSchema(allowedVillages),
    [allowedVillages],
  );

  const villageOptions = VILLAGE_OPTIONS.filter((option) =>
    allowedVillages.includes(option.value),
  );

  const form = useForm<SessionFormInput, unknown, SessionFormValues>({
    resolver: zodResolver(schema) as Resolver<
      SessionFormInput,
      unknown,
      SessionFormValues
    >,
    defaultValues: sessionFormDefaultValues,
  });

  const watchedValues = useWatch({ control: form.control });
  const topic = watchedValues.topic;
  const totalReached = computeTotalReached({
    nWomen: Number(watchedValues.nWomen) || 0,
    nMen: Number(watchedValues.nMen) || 0,
    nGirls: Number(watchedValues.nGirls) || 0,
    nBoys: Number(watchedValues.nBoys) || 0,
    nElders: Number(watchedValues.nElders) || 0,
    nOthers: Number(watchedValues.nOthers) || 0,
  });

  async function onSubmit(values: SessionFormValues) {
    setRootError(null);
    try {
      await createSessionMutation.mutateAsync(toCreateSessionRequest(values));
      navigate("/worker", { replace: true });
    } catch (error) {
      if (isApiError(error)) {
        setRootError(error.message);
      } else {
        setRootError("Could not save session. Please try again.");
      }
    }
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
          name="sessionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="village"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Village</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select village" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {villageOptions.map((option) => (
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
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TOPIC_OPTIONS.map((option) => (
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

        {topic === "other" ? (
          <FormField
            control={form.control}
            name="topicOther"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <NumberField
          control={form.control}
          name="durationMin"
          label="Duration (minutes)"
        />

        <div className="space-y-4 rounded-md border border-border p-4">
          <p className="text-base font-medium">Participants</p>
          <NumberField control={form.control} name="nWomen" label="Women" />
          <NumberField control={form.control} name="nMen" label="Men" />
          <NumberField control={form.control} name="nGirls" label="Girls" />
          <NumberField control={form.control} name="nBoys" label="Boys" />
          <NumberField control={form.control} name="nElders" label="Elders" />
          <NumberField control={form.control} name="nOthers" label="Others" />
          <p className="text-base text-muted-foreground">
            Total reached: <span className="font-medium">{totalReached}</span>
          </p>
        </div>

        <FormField
          control={form.control}
          name="keyIssues"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key issues (optional)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {rootError ? (
          <p className="text-base text-destructive" role="alert">
            {rootError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={createSessionMutation.isPending}
        >
          {createSessionMutation.isPending ? "Saving…" : "Save session"}
        </Button>

        <Button asChild variant="outline" className="h-11 w-full">
          <Link to="/worker">Cancel</Link>
        </Button>
      </form>
    </Form>
  );
}
