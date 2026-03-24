import "./globals.css";

export const metadata = {
  title: "Contact Phone Lookup",
  description: "Secure Contact phone enrichment lookup",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
