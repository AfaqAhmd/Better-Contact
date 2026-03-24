import PhoneLookupForm from "../components/PhoneLookupForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center justify-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-6">
            {/* <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Better Contact
            </p> */}
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Phone Lookup</h1>
            <p className="mt-2 text-sm text-slate-600">
              Securely enrich a contact and retrieve phone numbers through the server.
            </p>
          </header>
          <PhoneLookupForm />
        </section>
      </div>
    </main>
  );
}
