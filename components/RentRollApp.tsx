"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardOverview } from "@/components/DashboardOverview";
import { RegisterRental } from "@/components/RegisterRental";
import { RentalLookup } from "@/components/RentalLookup";
import { MyRentals } from "@/components/MyRentals";
import { ShieldCheck, ExternalLink, Network } from "lucide-react";
import { DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";
import { shortenAddress } from "@/lib/utils";

export default function RentRollApp() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950 text-neutral-100 selection:bg-brand-purple/30 selection:text-brand-purple">
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Info Banner if Contract is not deployed */}
        {DEFAULT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000" && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Notice:</span>
              <span>
                Contract address is not yet configured in <code>.env</code>.
              </span>
            </div>
          </div>
        )}

        {/* Dashboard Overview Cards */}
        <DashboardOverview refreshTrigger={refreshTrigger} />

        {/* Two Column Grid: Register Rental + Rental Lookup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Register Rental Section */}
          <RegisterRental onSuccessRegistered={triggerRefresh} />

          {/* Rental Lookup Section */}
          <RentalLookup />
        </div>

        {/* Landlord Managed Rentals Section */}
        <MyRentals onRefreshStats={triggerRefresh} />

        {/* Security & Privacy Section */}
        <section className="mt-12 rounded-2xl bg-charcoal-900/60 border border-charcoal-800 p-6 backdrop-blur">
          <div className="flex items-center gap-2.5 mb-3 text-brand-purple">
            <ShieldCheck className="w-5 h-5 text-brand-purple" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Privacy & On-Chain Security Guarantee
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-400">
            <div className="p-3.5 rounded-xl bg-charcoal-850/60 border border-charcoal-750">
              <span className="text-neutral-200 font-medium block mb-1">
                Zero Personal Information
              </span>
              No tenant names, phone numbers, or physical home addresses are ever collected or stored on-chain. Only anonymous unit references are used.
            </div>
            <div className="p-3.5 rounded-xl bg-charcoal-850/60 border border-charcoal-750">
              <span className="text-neutral-200 font-medium block mb-1">
                Strict Access Controls
              </span>
              Payment status updates and term modifications are strictly guarded at the smart contract level. Only the original creator address has permission.
            </div>
            <div className="p-3.5 rounded-xl bg-charcoal-850/60 border border-charcoal-750">
              <span className="text-neutral-200 font-medium block mb-1">
                Immutable Payment Records
              </span>
              Timestamps and payment histories are recorded permanently on the Botchain blockchain, creating dispute-proof proof of payment records.
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-charcoal-800 bg-charcoal-900/40 py-6 mt-16 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">RentRoll</span>
            <span>— Simple, verifiable on-chain rental payment records.</span>
          </div>

          <div className="flex items-center gap-5 text-[11px]">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Network className="w-3.5 h-3.5 text-brand-purple" />
              <span>Botchain Testnet (Chain ID: 968)</span>
            </div>
            {DEFAULT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
              <a
                href={`https://scan.bohr.life/address/${DEFAULT_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition font-mono"
              >
                <span>Contract: {shortenAddress(DEFAULT_CONTRACT_ADDRESS)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition"
            >
              <span>BohrScan Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

