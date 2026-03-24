"use client";

import { useMemo, useState } from "react";

const initialForm = {
  fullName: "",
  email: "",
  linkedinUrl: "",
  companyDomain: "",
  companyName: "",
};
const SHOW_DEBUG = process.env.NEXT_PUBLIC_SHOW_DEBUG === "true";

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="fullName"
          name="fullName"
          label="Full Name"
          value={form.fullName}
          onChange={updateField}
          placeholder="Jane Smith"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Spinner />
              Searching phone...
            </>
          ) : (
            "Find Phone"
          )}
        </button>

        <p className="text-xs text-slate-500">
          At least one of Full Name, Work Email, or LinkedIn URL is required.
        </p>
      </form>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {result ? <ResultCard result={result} /> : null}
    </div>
  );
}

function InputField({ id, name, label, type = "text", value, onChange, placeholder, helperText }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
      {helperText ? <p className="mt-1.5 text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}

function ResultCard({ result }) {
  const found = Boolean(result?.found);
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">Lookup Result</h2>
      <p className="mt-2 text-sm text-slate-700">
        {found ? (
          <>
            Phone found: <span className="font-semibold text-slate-900">{result.phone}</span>
          </>
        ) : (
          "No phone found for this contact."
        )}
      </p>
      {SHOW_DEBUG ? (
        <p className="mt-1 text-xs text-slate-500">
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
