import PhoneLookupForm from "../components/PhoneLookupForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col items-center">
        <header className="w-full text-center">
          {/* <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Better Contact</p> */}
          <img src="/images/obs-newlogo.png" alt="Outreach Boosters" className="mx-auto h-40 w-auto" />
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Phone Lookup</h1>
          <p className="mt-2 text-sm text-white/70">
            Securely enrich a contact and retrieve phone numbers through the server.
          </p>
        </header>

        <section className="mt-7 w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-8">
          <PhoneLookupForm />
        </section>

        <section className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Data sources we use</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <img src="/images/contactout.png" alt="Contactout" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
            <img src="/images/hunter.png" alt="Hunter" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
            <img src="/images/roaketreach.png" alt="RocketReach" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
            <img src="/images/datagma.png" alt="Datagma" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
            <img src="/images/bettercontact.png" alt="BetterContact" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
            <img src="/images/apollo.png" alt="Apollo" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
            <img src="/images/people-data-lab.png" alt="People Data Lab" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
            <img src="/images/enrow.png" alt="Enrow" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
            <img src="/images/prospeo.png" alt="Prospeo" className="h-10 w-auto rounded-xl border border-white/10 bg-white/5 p-2" />
          </div>
        </section>

        <footer className="mt-auto w-full pt-10">
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
            <p className="text-sm text-white/70">© 2026 Outreach Boosters. All rights reserved</p>

            <div className="mt-5">
              <p className="text-sm font-semibold text-white/90">Contact Us</p>
              <a
                href="mailto:info@outreachboosters.io"
                className="mt-1 inline-block text-sm text-white/70 underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
              >
                info@outreachboosters.io
              </a>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-white/90">Follow Us</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
                <SocialLink
                  href="https://www.facebook.com/people/Outreach-Boosters-AI/61567629869482/"
                  label="Facebook"
                  icon={<FacebookIcon />}
                />
                <SocialLink
                  href="https://www.youtube.com/@outreachboostersAI"
                  label="YouTube"
                  icon={<YoutubeIcon />}
                />
                <SocialLink
                  href="https://www.linkedin.com/company/outreach-boosters-ai/posts/?feedView=all"
                  label="LinkedIn"
                  icon={<LinkedInIcon />}
                />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function SocialLink({ href, label, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8.1V12h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4V12h2.5l-.4 2.9h-2v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M21.6 7.2a4.3 4.3 0 0 0-3-3C16.2 3.5 12 3.5 12 3.5s-4.2 0-6.6.7a4.3 4.3 0 0 0-3 3A45.5 45.5 0 0 0 2.7 12a45.5 45.5 0 0 0 .3 4.8 4.3 4.3 0 0 0 3 3c2.4.7 6.6.7 6.6.7s4.2 0 6.6-.7a4.3 4.3 0 0 0 3-3A45.5 45.5 0 0 0 21.3 12a45.5 45.5 0 0 0 .3-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M20.4 20.4h-3.5v-5.6c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8v5.7H7.6V9h3.3v1.5h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3ZM4.9 7.4a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM6.6 20.4H3.3V9h3.3v11.4Z" />
    </svg>
  );
}
