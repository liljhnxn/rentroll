import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "RentRoll — On-chain Rental Payment Records",
  description:
    "Lightweight on-chain rental record dApp for landlords and property managers on Botchain Testnet.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-charcoal-950 text-neutral-100 antialiased selection:bg-brand-purple selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

