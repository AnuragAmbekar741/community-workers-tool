import { RegisterForm } from "./RegisterForm";

export function RegisterPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-sm p-4">
      <h1 className="mb-6 text-2xl font-semibold">Register</h1>
      <RegisterForm />
    </main>
  );
}
