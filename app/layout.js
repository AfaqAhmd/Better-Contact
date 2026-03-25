import "./globals.css";

export const metadata = {
  title: "Contact Phone Lookup",
  description: "Secure Contact phone enrichment lookup",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/images/obs-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
