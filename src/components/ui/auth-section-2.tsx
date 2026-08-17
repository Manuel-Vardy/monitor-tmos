 "use client";

import { useState, type ReactNode } from "react";

const HERO_IMAGE = "/images/woman-working.jpg";
const HERO_DESCRIPTION =
  "From retail shops and restaurants to schools, hotels, and pharmacies. Trite gives every African business one platform to sell, manage stock, send invoices, accept payments, and stay in control.";


export interface AuthSectionTwoProps {
  businessTypes?: Array<{ id: string; label: string }>;
  selectedType?: string | null;
  onSelectType?: (id: string) => void;
  onSubmit?: (data: { firstName: string; lastName: string; email: string; type: string }) => void;
}

const defaultBusinessTypes = [
  { id: "retail", label: "Retail & Shops" },
  { id: "wholesale", label: "Wholesale & Depot" },
  { id: "restaurant", label: "Restaurant & Food" },
  { id: "pharmacy", label: "Pharmacy & Clinic" },
  { id: "professional_services", label: "Services & Consultancy" },
  { id: "manufacturer", label: "Factory & Manufacturing" },
];

export default function AuthSectionTwo({
  businessTypes = defaultBusinessTypes,
  selectedType: externalSelectedType,
  onSelectType,
  onSubmit,
}: AuthSectionTwoProps) {
  const [internalSelectedType, setInternalSelectedType] = useState<string>(businessTypes[0]?.id ?? "retail");

  const currentType = externalSelectedType !== undefined ? externalSelectedType : internalSelectedType;

  const handleTypeSelect = (id: string) => {
    setInternalSelectedType(id);
    onSelectType?.(id);
  };


  return (
    <section className="min-h-screen bg-white text-black antialiased dark:bg-[#050505] dark:text-white">
      {/* 50 / 50 Equal Split Grid Layout */}
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Light Mint Green Hero Section with Text Pushed Up & 4 Image Carousel */}
        <div className="flex flex-col items-center justify-center gap-6 overflow-hidden bg-[#eefce3] px-8 py-10 text-zinc-900 sm:px-12 lg:px-14 lg:py-16 xl:px-20">
          {/* Top Text Section — centered */}
          <div className="mx-auto w-full max-w-[480px] space-y-4 text-center">
            <img
              src="/tritee-logo.png"
              alt="Trite logo"
              className="mx-auto h-8 w-auto object-contain"
            />
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl lg:text-[36px] lg:leading-[1.15]">
              The operating system African businesses run on.
            </h1>
            <p className="text-sm font-normal text-zinc-700 sm:text-base leading-relaxed">
              Sell, stock, invoice, reconcile and get paid: cash, mobile money, card and stablecoins, across one branch or many.
            </p>
          </div>

          {/* Static image */}
          <div className="w-full max-w-[480px] overflow-hidden rounded-2xl shadow-md" style={{ height: "280px" }}>
            <img
              src={HERO_IMAGE}
              alt="Business owner using Trite"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Summary description removed */}

          <p className="mt-4 text-xs text-zinc-500 text-center">
            © Trite Software and Consultancy Services Limited
          </p>
        </div>

        {/* Right Side: Log In Content & Form */}
        <div className="relative flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
          {/* Back to Dashboard button */}
          <a
            href="/"
            className="absolute top-6 right-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <span className="text-base leading-none">‹</span>
            Back to Trite Dashboard
          </a>
          <AuthForm
            businessTypes={businessTypes}
            selectedType={currentType}
            onSelectType={handleTypeSelect}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </section>
  );
}



function AuthForm({
  businessTypes,
  selectedType,
  onSelectType,
  onSubmit,
}: {
  businessTypes: Array<{ id: string; label: string }>;
  selectedType: string | null;
  onSelectType: (id: string) => void;
  onSubmit?: (data: { firstName: string; lastName: string; email: string; type: string }) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [noEmails, setNoEmails] = useState(false);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ firstName, lastName, email, type: selectedType || "" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[500px]">
      {/* ------------------------------------------------------------------------- */}
      {/* Business Type Selector (Header only, NO icons, NO descriptions)          */}
      {/* Button form with curved edges arranged on top of login                    */}
      {/* ------------------------------------------------------------------------- */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-center text-black dark:text-white sm:text-2xl mb-4">
          What type of business are you signing in to?
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {businessTypes.map((item) => {
            const isSelected = selectedType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectType(item.id)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 border-0 outline-none ${
                  isSelected
                    ? "bg-[#22c55e] text-white shadow-sm scale-105"
                    : "bg-black/5 text-black/80 hover:bg-black/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-black dark:text-white">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Enter your details to access your account
        </p>
      </div>


      <form onSubmit={handleSubmitForm} className="space-y-4">
        {/* First & Last Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <InputContainer label="First Name">
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-transparent text-sm text-black outline-none dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
              placeholder="Kwame"
            />
          </InputContainer>

          <InputContainer label="Last Name">
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-transparent text-sm text-black outline-none dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
              placeholder="Mensah"
            />
          </InputContainer>
        </div>

        {/* Email */}
        <InputContainer label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-sm text-black outline-none dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
            placeholder="kwame.mensah@gmail.com"
          />
        </InputContainer>

        {/* Password */}
        <InputContainer label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-sm text-black outline-none dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
            placeholder="••••••••••••"
          />
        </InputContainer>

        <div className="space-y-3 pt-2 text-xs leading-4 text-black/60 dark:text-white/60">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={noEmails}
              onChange={(e) => setNoEmails(e.target.checked)}
              className="mt-0.5 rounded border-black/25 dark:border-white/30 accent-[#22c55e]"
            />
            <span>I'd like to receive product updates, feature announcements, and marketing emails from Trite. You can unsubscribe at any time.</span>
          </label>

          <p className="text-xs text-black/50 dark:text-white/50">
            By creating an account, you agree to our{" "}
            <a href="#" className="font-medium underline underline-offset-2 hover:text-[#22c55e] dark:hover:text-[#22c55e]">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium underline underline-offset-2 hover:text-[#22c55e] dark:hover:text-[#22c55e]">
              Privacy Policy
            </a>.
          </p>
        </div>

        <button
          type="submit"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-black text-base font-medium text-white transition-all hover:bg-black/85 hover:shadow-md dark:bg-white dark:text-black dark:hover:bg-white/85"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

function InputContainer({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-xs font-bold uppercase tracking-wider text-black/80 dark:text-white/80">
        {label}
      </label>
      <div className="flex h-12 items-center rounded-xl border border-black/20 bg-white px-4 transition-all focus-within:border-[#22c55e] focus-within:ring-1 focus-within:ring-[#22c55e] dark:border-white/20 dark:bg-white/5 dark:focus-within:border-[#22c55e] dark:focus-within:ring-[#22c55e]">
        {children}
      </div>
    </div>
  );
}

function MidjourneyLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 25.5c5.4-3.3 9-9.7 9.8-18.8 5.2 5.5 8 11.8 8.8 18.8H5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8 23.5h18M10.5 20.5h12.8M12.7 17.5h8.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M14.9 6.8c-1.1 7.6.7 13.4 5.3 17"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}


