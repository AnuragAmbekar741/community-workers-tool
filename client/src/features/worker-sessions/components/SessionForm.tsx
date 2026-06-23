import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, useWatch, type Control, type Resolver } from "react-hook-form";

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
import { DISTRICT_OPTIONS, TOPIC_OPTIONS, type District } from "@/lib/constants";
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
  defaultDistrict?: District;
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
  control: Control<SessionFormInput>;
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
              required
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

export function SessionForm({ defaultDistrict }: SessionFormProps) {
  const navigate = useNavigate();
  const createSessionMutation = useCreateSession();
  const [rootError, setRootError] = useState<string | null>(null);

  const schema = useMemo(() => createSessionFormSchema(), []);

  const form = useForm<SessionFormInput, unknown, SessionFormValues>({
    resolver: zodResolver(schema) as Resolver<
      SessionFormInput,
      unknown,
      SessionFormValues
    >,
    defaultValues: sessionFormDefaultValues(defaultDistrict),
  });

  const control = form.control as unknown as Control<SessionFormInput>;

  const watchedValues = useWatch({ control: form.control });
  const topic = watchedValues.topic;
  const referralsMade = watchedValues.referralsMade;
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
          control={control}
          name="sessionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session date</FormLabel>
              <FormControl>
                <Input type="date" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
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
          control={control}
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
            control={control}
            name="topicOther"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic description</FormLabel>
                <FormControl>
                  <Input required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <NumberField
          control={control}
          name="durationMin"
          label="Duration (minutes)"
        />

        <div className="space-y-4 rounded-md border border-border p-4">
          <p className="text-base font-medium">Participants</p>
          <NumberField control={control} name="nWomen" label="Women" />
          <NumberField control={control} name="nMen" label="Men" />
          <NumberField control={control} name="nGirls" label="Girls" />
          <NumberField control={control} name="nBoys" label="Boys" />
          <NumberField control={control} name="nElders" label="Elders" />
          <NumberField control={control} name="nOthers" label="Others" />
          <p className="text-base text-muted-foreground">
            Total reached: <span className="font-medium">{totalReached}</span>
          </p>
        </div>

        <div className="space-y-4 rounded-md border border-border p-4">
          <p className="text-base font-medium">Referrals</p>
          <FormField
            control={control}
            name="referralsMade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referrals made?</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === "no") {
                      form.setValue("nReferrals", "");
                      form.setValue("referralReason", "");
                      form.clearErrors(["nReferrals", "referralReason"]);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select yes or no" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {referralsMade === "yes" ? (
            <>
              <FormField
                control={control}
                name="nReferrals"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Number of referrals</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        required
                        min={1}
                        value={
                          value === undefined || value === null
                            ? ""
                            : String(value)
                        }
                        onChange={(event) => onChange(event.target.value)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="referralReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for referral</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}
        </div>

        <FormField
          control={control}
          name="keyIssues"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
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
