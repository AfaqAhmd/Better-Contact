import "./globals.css";

export const metadata = {
  title: "Better Contact Phone Lookup",
  description: "Secure Better Contact phone enrichment lookup",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
