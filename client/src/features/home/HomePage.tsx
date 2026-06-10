import { Button } from "@/components/base/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/base/card";
import { Input } from "@/components/base/input";

export function HomePage() {
  return (
    <main className="mx-auto min-h-dvh max-w-lg space-y-4 p-4">
      <h1>Page Title</h1>
      <h2>Section Title</h2>
      <p>Body text at 16px Roboto.</p>

      <Card>
        <CardHeader>
          <CardTitle>Form example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Phone number" type="tel" />
          <Button className="w-full">Primary action</Button>
        </CardContent>
      </Card>
    </main>
  );
}
