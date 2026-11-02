"use client";

import React, { useState } from "react";
import { useReadContract } from "wagmi";
import { RENT_ROLL_ABI, DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";
import {
  shortenAddress,
  formatRent,
  formatDate,
  formatDateTime,
  copyToClipboard,
} from "@/lib/utils";
import { RentalRecord, PaymentStatus } from "@/lib/types";
import {
  Search,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Building,
  User,
  Coins,
  Calendar,
  History,
  AlertCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";

export function RentalLookup() {
  const [searchIdInput, setSearchIdInput] = useState("");
  const [activeRentalId, setActiveRentalId] = useState<bigint | null>(null);
  const [copiedLandlord, setCopiedLandlord] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const {
    data: rentalData,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: RENT_ROLL_ABI,
    functionName: "getRental",
    args: activeRentalId ? [activeRentalId] : undefined,
    query: {
      enabled: activeRentalId !== null && DEFAULT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      retry: false,
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchIdInput.trim();
    if (!trimmed) return;
    try {
      const id = BigInt(trimmed);
      setActiveRentalId(id);
    } catch {
      setActiveRentalId(null);
    }
  };

  const handleCopyLandlord = async (addr: string) => {
    const ok = await copyToClipboard(addr);
    if (ok) {
      setCopiedLandlord(true);
      setTimeout(() => setCopiedLandlord(false), 2000);
    }
  };

  const handleCopyRentalId = async (id: string) => {
    const ok = await copyToClipboard(id);
    if (ok) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const rental = rentalData as unknown as RentalRecord | undefined;
  const isPaid = rental && Number(rental.status) === PaymentStatus.Paid;

  return (
    <div className="bg-charcoal-900/90 rounded-2xl border border-charcoal-800 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Rental Record Lookup</h3>
          <p className="text-xs text-neutral-400">
            Public verification — no wallet connection required
          </p>
        </div>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Enter unique Rental ID (e.g. 1001)"
              value={searchIdInput}
              onChange={(e) => setSearchIdInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!searchIdInput.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Lookup</span>
          </button>
        </div>
      </form>

      {/* Results View */}
      {isLoading && (
        <div className="p-8 text-center rounded-xl bg-charcoal-850/60 border border-charcoal-750">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-400">Querying Botchain Testnet for Rental ID #{activeRentalId?.toString()}...</p>
        </div>
      )}

      {isError && activeRentalId !== null && (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <HelpCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-amber-200">Rental Not Found</h4>
          <p className="text-xs text-amber-300/80 mt-1 max-w-sm mx-auto">
            No on-chain rental record exists for Rental ID #{activeRentalId?.toString()}. Verify the ID and try again.
          </p>
        </div>
      )}

      {!isLoading && !isError && rental && (
        <div className="rounded-xl bg-charcoal-850/90 border border-charcoal-700 overflow-hidden shadow-inner animate-in fade-in zoom-in-95 duration-150">
          {/* Header of Record */}
          <div className="p-4 sm:p-5 border-b border-charcoal-750 flex flex-wrap items-center justify-between gap-3 bg-charcoal-800/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-charcoal-700/60 text-white font-mono font-bold text-sm">
                #{rental.rentalId.toString()}
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">
                  {rental.unitReference}
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Registered on {formatDate(rental.createdAt)}
                </p>
              </div>
            </div>

            {/* Payment Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isPaid
                  ? "bg-brand-greenMuted text-brand-green border border-brand-green/30"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              }`}
            >
              {isPaid ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Paid</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Unpaid</span>
                </>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Rent Amount */}
            <div className="p-3.5 rounded-lg bg-charcoal-900/60 border border-charcoal-750/70">
              <span className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <Coins className="w-3.5 h-3.5 text-neutral-400" />
                Rent Amount
              </span>
              <p className="font-mono text-base font-bold text-white">
                {formatRent(rental.rentAmount)} <span className="text-xs font-normal text-neutral-400">BOHR</span>
              </p>
            </div>

            {/* Payment Due Date */}
            <div className="p-3.5 rounded-lg bg-charcoal-900/60 border border-charcoal-750/70">
              <span className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Payment Due Date
              </span>
              <p className="font-mono text-sm font-semibold text-white">
                {formatDate(rental.dueDate)}
              </p>
            </div>

            {/* Landlord Address */}
            <div className="p-3.5 rounded-lg bg-charcoal-900/60 border border-charcoal-750/70">
              <span className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                Landlord Address
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-200">
                  {shortenAddress(rental.landlord)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyLandlord(rental.landlord)}
                  className="p-1 rounded text-neutral-400 hover:text-white transition cursor-pointer"
                  title="Copy address"
                >
                  {copiedLandlord ? (
                    <Check className="w-3.5 h-3.5 text-brand-green" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Last Payment Timestamp */}
            <div className="p-3.5 rounded-lg bg-charcoal-900/60 border border-charcoal-750/70">
              <span className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <History className="w-3.5 h-3.5 text-neutral-400" />
                Last Payment Recorded
              </span>
              <p className="font-mono text-xs text-neutral-200">
                {formatDateTime(rental.lastPaymentTimestamp)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Default placeholder helper if no search yet */}
      {!isLoading && !rental && !isError && (
        <div className="p-6 rounded-xl bg-charcoal-850/40 border border-charcoal-800 text-center text-neutral-400">
          <p className="text-xs">
            Tenants, property inspectors, or authorized parties can enter any Rental ID above to inspect verified, immutable payment history.
          </p>
        </div>
      )}
    </div>
  );
}

