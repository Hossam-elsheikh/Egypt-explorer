import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Egypt Explorer — Your Complete Egypt Travel Guide",
  description:
    "Discover the best places, food, drinks, and services in Egypt. Ratings, prices, and insider tips for every traveler visiting Egypt.",
  keywords: ["Egypt travel", "Egypt guide", "Cairo tourism", "Luxor", "Pyramids", "Egypt food", "Egypt places"],
  openGraph: {
    title: "Egypt Explorer — Your Complete Egypt Travel Guide",
    description: "Discover the best of Egypt: ancient wonders, authentic cuisine, hidden gems, and essential services.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
