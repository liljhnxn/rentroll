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
              Timestamps and payment histories are recorded permanently on the BOT Chain blockchain, creating dispute-proof proof of payment records.
            </div>
          </div>
        </section>

        {/* BOT Chain Ecosystem Section */}
        <section className="mt-8 rounded-2xl bg-gradient-to-r from-charcoal-900 via-charcoal-850 to-charcoal-900 border border-brand-purple/20 p-6 backdrop-blur shadow-lg shadow-brand-purple/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-charcoal-950 flex items-center justify-center shadow-lg shadow-brand-purple/25 ring-1 ring-white/10 shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/botchain-logo.png" alt="BOT Chain Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    BOT Chain Ecosystem
                  </h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/40">
                    Chain ID: 677
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                  RentRoll is proudly built on BOT Chain — utilizing fast block finality and low transaction fees to deliver decentralized rental payment verification.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-purple hover:bg-brand-purpleDark text-white shadow-md shadow-brand-purple/20 transition cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/botchain-logo.png" alt="BOT Chain" className="w-4 h-4 rounded-xs object-cover" />
                <span>BOT Chain Website</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-charcoal-800 hover:bg-charcoal-750 text-neutral-200 border border-charcoal-700 hover:border-brand-purple/40 transition cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/botchain-logo.png" alt="BOT Chain Explorer" className="w-4 h-4 rounded-xs object-cover" />
                <span>BOT Chain Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-charcoal-800 bg-charcoal-900/60 py-8 mt-16 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-charcoal-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-charcoal-950 flex items-center justify-center ring-1 ring-white/10 shrink-0 overflow-hidden shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/botchain-logo.png" alt="BOT Chain" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-200">BOT Chain</span>
                  <span className="text-[10px] text-brand-purple font-mono bg-charcoal-800 px-2 py-0.5 rounded border border-charcoal-700">Chain ID: 677</span>
                </div>
                <p className="text-[11px] text-neutral-500">Decentralized AI & smart contracts network</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-neutral-300 hover:text-brand-purple transition group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/botchain-logo.png" alt="BOT Chain" className="w-4 h-4 rounded-xs object-cover" />
                <span>BOT Chain Website: https://botchain.ai</span>
                <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-brand-purple" />
              </a>
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-neutral-300 hover:text-brand-purple transition group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/botchain-logo.png" alt="BOT Chain Explorer" className="w-4 h-4 rounded-xs object-cover" />
                <span>BOT Chain Explorer: https://scan.botchain.ai</span>
                <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-brand-purple" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-300">RentRoll</span>
              <span>— Simple, verifiable on-chain rental payment records on BOT Chain.</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Network className="w-3.5 h-3.5 text-brand-purple" />
                <span>BOT Chain (677)</span>
              </div>
              {DEFAULT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
                <a
                  href={`https://scan.botchain.ai/address/${DEFAULT_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition font-mono"
                  title="View Verified Mainnet Contract on BotchainScan"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Mainnet Contract: {shortenAddress(DEFAULT_CONTRACT_ADDRESS)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

