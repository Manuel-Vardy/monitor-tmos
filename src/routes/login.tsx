import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import type { InstitutionType } from "@/lib/institution-types";
import { INSTITUTION_TYPES } from "@/lib/institution-types";
import { INSTITUTION_META } from "@/lib/institution-config";
import { useInstitution } from "@/hooks/use-institution";

const SESSION_KEY = "tmos_session_v1";

function readSession(): {
  accountId?: string;
  onboardingComplete?: boolean;
  institutionType?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed?.["version"] !== 1) return null;
    return parsed as { accountId?: string; onboardingComplete?: boolean; institutionType?: string };
  } catch {
    return null;
  }
}

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  beforeLoad: () => {
    const session = readSession();
    if (session?.accountId && session?.onboardingComplete) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — Trite Merchant OS" },
      { name: "description", content: "Sign in to your Trite Merchant OS account." },
    ],
  }),
  component: SignInPage,
});

const businessTypeButtons = INSTITUTION_TYPES.map((type) => ({
  id: type,
  label: INSTITUTION_META[type].label,
}));

function SignInPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { setInstitution } = useInstitution();

  // Step: 1 = business type, 2 = sign in
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<string>(INSTITUTION_TYPES[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const typeToUse = selectedType as InstitutionType;
    setInstitution(typeToUse, "acc-demo-001");
    try {
      const existing = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}");
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...existing, version: 1, onboardingComplete: true }),
      );
    } catch { /* silent */ }
    const destination = search.redirect ?? "/";
    await navigate({ to: destination });
  }

  return (
    <section className="min-h-screen bg-white text-black antialiased dark:bg-[#050505] dark:text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* ── Left: hero panel ── */}
        <div className="flex flex-col items-center justify-center gap-6 overflow-hidden bg-[#eefce3] px-8 py-10 text-zinc-900 sm:px-12 lg:px-14 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-[480px] space-y-4 text-center">
            <img src="/tritee-logo.png" alt="Trite logo" className="mx-auto h-8 w-auto object-contain" />
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl lg:text-[36px] lg:leading-[1.15]">
              The operating system African businesses run on.
            </h1>
            <p className="text-sm font-normal text-zinc-700 sm:text-base leading-relaxed">
              Sell, stock, invoice, reconcile and get paid: cash, mobile money, card and stablecoins, across one branch or many.
            </p>
          </div>
          <div className="w-full max-w-[480px] overflow-hidden rounded-2xl shadow-md" style={{ height: "280px" }}>
            <img src="/images/woman-working.jpg" alt="Business owner using Trite" className="h-full w-full object-cover" />
          </div>
          <p className="mt-4 text-xs text-zinc-500 text-center">© Trite Software and Consultancy Services Limited</p>
        </div>

        {/* ── Right: stepped form ── */}
        <div className="relative flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
          <a
            href="/"
            className="fixed top-4 right-4 z-50 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors lg:absolute lg:top-6 lg:right-6 lg:z-auto"
          >
            <span className="text-base leading-none">‹</span>
            Back to Dashboard
          </a>

          <div className="mx-auto w-full max-w-[440px]">

            {/* ── Step indicator ── */}
            <div className="mb-8 flex items-center justify-center gap-2">
              <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${step === 2 ? "bg-[#22c55e] text-white" : "bg-[#22c55e] text-white"}`}>
                {step === 2 ? "✓" : "1"}
              </span>
              <span className="h-px w-8 bg-black/15 dark:bg-white/20" />
              <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${step === 2 ? "bg-[#22c55e] text-white" : "bg-black/10 text-black/40 dark:bg-white/10 dark:text-white/40"}`}>
                2
              </span>
            </div>

            {/* ── Step 1: Business type ── */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-black dark:text-white">
                    What type of business are you?
                  </h1>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {businessTypeButtons.map((item) => {
                    const isSelected = selectedType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedType(item.id)}
                        className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 border outline-none ${
                          isSelected
                            ? "bg-[#22c55e] border-[#22c55e] text-white shadow-sm scale-105"
                            : "bg-black/5 border-transparent text-black/80 hover:bg-black/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-10 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] text-base font-semibold text-white transition-all hover:bg-[#16a34a] hover:shadow-md"
                >
                  Next <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {/* ── Step 2: Sign in ── */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-black dark:text-white">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-sm text-black/50 dark:text-white/50">
                    Sign in to your account to continue
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/80 dark:text-white/80">
                      Email
                    </label>
                    <div className="flex h-12 items-center rounded-xl border border-black/20 bg-white px-4 transition-all focus-within:border-[#22c55e] focus-within:ring-1 focus-within:ring-[#22c55e] dark:border-white/20 dark:bg-white/5">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="kwame.mensah@gmail.com"
                        className="w-full bg-transparent text-sm text-black outline-none dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-black/80 dark:text-white/80">
                        Password
                      </label>
                      <a href="#" className="text-xs text-[#22c55e] hover:underline underline-offset-2">
                        Forgot password?
                      </a>
                    </div>
                    <div className="flex h-12 items-center rounded-xl border border-black/20 bg-white px-4 transition-all focus-within:border-[#22c55e] focus-within:ring-1 focus-within:ring-[#22c55e] dark:border-white/20 dark:bg-white/5">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-transparent text-sm text-black outline-none dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="ml-2 shrink-0 text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#22c55e] text-base font-semibold text-white transition-all hover:bg-[#16a34a] hover:shadow-md"
                  >
                    Sign in
                  </button>
                </form>

                {/* Back link */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-6 flex w-full items-center justify-center gap-1 text-xs text-black/40 hover:text-black/70 dark:text-white/40 dark:hover:text-white/70 transition-colors"
                >
                  ← Change business type
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
