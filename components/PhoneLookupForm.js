"use client";

import { useEffect, useMemo, useState } from "react";

const initialForm = {
  fullName: "",
  email: "",
  linkedinUrl: "",
  companyDomain: "",
  companyName: "",
};
const SHOW_DEBUG = process.env.NEXT_PUBLIC_SHOW_DEBUG === "true";
const VENDORS = [
  { key: "contactout", label: "Contactout", logo: "/images/contactout.png" },
  { key: "hunter", label: "Hunter", logo: "/images/hunter.png" },
  { key: "rocketreach", label: "RocketReach", logo: "/images/roaketreach.png" },
  { key: "datagma", label: "Datagma", logo: "/images/datagma.png" },
  { key: "bettercontact", label: "BetterContact", logo: "/images/bettercontact.png" },
  { key: "apollo", label: "Apollo", logo: "/images/apollo.png" },
  { key: "people-data-lab", label: "People Data Lab", logo: "/images/people-data-lab.png" },
  { key: "enrow", label: "Enrow", logo: "/images/enrow.png" },
  { key: "prospeo", label: "Prospeo", logo: "/images/prospeo.png" },
];

function VendorLogo({ vendor, isActive }) {
  return (
    <div
      className={[
        "flex h-10 w-10 items-center justify-center rounded-xl border bg-white/5 transition-all",
        isActive ? "border-cyan-400/70 shadow-[0_0_0_3px_rgba(34,211,238,0.15)]" : "border-white/10",
      ].join(" ")}
      title={vendor.label}
      aria-label={vendor.label}
    >
      <img src={vendor.logo} alt={vendor.label} className="h-7 w-7 object-contain" />
    </div>
  );
}

function ScrapingAnimation({ active, variant = "inline" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!active) return;

    // reset for each new scrape session
    setActiveIndex(0);

    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % VENDORS.length);
    }, 700);

    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const currentVendor = VENDORS[activeIndex];
  const wrapperClass = variant === "overlay" ? "flex w-full flex-col items-center justify-center gap-4" : "mt-3";

  return (
    <div className={wrapperClass}>
      <div className={variant === "overlay" ? "flex flex-wrap items-center justify-center gap-3" : "flex flex-wrap items-center justify-center gap-2"}>
        {VENDORS.map((v, idx) => (
          <div key={v.key} className={idx === activeIndex ? "scale-105" : "scale-100"}>
            <VendorLogo vendor={v} isActive={idx === activeIndex} />
          </div>
        ))}
      </div>
      <p
        className={
          variant === "overlay"
            ? "text-center text-sm text-white/80"
            : "mt-2 text-center text-xs text-white/60"
        }
        aria-live="polite"
      >
        Scraping with <span className="font-semibold text-white">{currentVendor.label}</span>...
      </p>
    </div>
  );
}

export default function PhoneLookupForm() {
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canSubmit = useMemo(() => {
    return Boolean(form.fullName.trim() || form.email.trim() || form.linkedinUrl.trim());
  }, [form]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!canSubmit) {
      setError("Enter at least full name, work email, or LinkedIn URL.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/find-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        setError(data?.error || "Phone lookup failed. Please try again.");
        return;
      }

      setResult(data);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="relative">
        <div className={isLoading ? "pointer-events-none opacity-50" : ""}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="fullName"
              name="fullName"
              label="Name"
              value={form.fullName}
              onChange={updateField}
              placeholder="Jane"
              helperText="Optional if work email or LinkedIn URL is provided."
            />

            <InputField
              id="email"
              name="email"
              label="Work Email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="jane@company.com"
              helperText="Use a professional email for better match accuracy."
            />

            <InputField
              id="linkedinUrl"
              name="linkedinUrl"
              label="LinkedIn URL"
              value={form.linkedinUrl}
              onChange={updateField}
              placeholder="https://www.linkedin.com/in/jane-smith"
              helperText="Paste the full profile URL when possible."
            />

            <InputField
              id="companyDomain"
              name="companyDomain"
              label="Company Domain (Optional)"
              value={form.companyDomain}
              onChange={updateField}
              placeholder="company.com"
              helperText="Helps disambiguate similarly named contacts."
            />

            <InputField
              id="companyName"
              name="companyName"
              label="Company Name (Optional)"
              value={form.companyName}
              onChange={updateField}
              placeholder="Acme Inc"
              helperText="Provide if the domain is unknown."
            />

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <div className="inline-flex items-center gap-2">
                  <Spinner />
                  <span>Finding phone</span>
                </div>
              ) : (
                "Find Phone"
              )}
            </button>

            <p className="text-xs text-slate-500">
              At least one of Full Name, Work Email, or LinkedIn URL is required.
            </p>
          </form>
        </div>

        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/55 backdrop-blur-sm">
            <div className="w-full px-4">
              <ScrapingAnimation active={true} variant="overlay" />
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      ) : null}

      {result ? <ResultCard result={result} /> : null}
    </div>
  );
}

function InputField({ id, name, label, type = "text", value, onChange, placeholder, helperText }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-white/90">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20"
      />
      {helperText ? <p className="mt-1.5 text-xs text-white/50">{helperText}</p> : null}
    </div>
  );
}

function ResultCard({ result }) {
  const found = Boolean(result?.found);
  return (
    <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-white">Lookup Result</h2>
      <p className="mt-2 text-sm text-white/80">
        {found ? (
          <>
            Phone found: <span className="font-semibold text-white">{result.phone}</span>
          </>
        ) : (
          "No phone found for this contact."
        )}
      </p>
      {SHOW_DEBUG ? (
        <p className="mt-1 text-xs text-white/50">
          Status: {result?.status || "unknown"} | Reason: {result?.reason || "n/a"} | Request ID:{" "}
          {result?.requestId || "n/a"}
        </p>
      ) : null}
    </section>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
      aria-hidden="true"
    />
  );
}
