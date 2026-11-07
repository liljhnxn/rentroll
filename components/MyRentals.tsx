"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { RENT_ROLL_ABI, DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";
import { RentalRecord, PaymentStatus } from "@/lib/types";
import {
  formatRent,
  formatDate,
  formatDateTime,
  copyToClipboard,
  parseContractError,
} from "@/lib/utils";
import { EditRentalModal } from "./EditRentalModal";
import {
  Home,
  CheckCircle2,
  Clock,
  Edit,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";

interface MyRentalsProps {
  onRefreshStats?: () => void;
}

export function MyRentals({ onRefreshStats }: MyRentalsProps) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingRental, setEditingRental] = useState<RentalRecord | null>(null);
  const [actionRentalId, setActionRentalId] = useState<bigint | null>(null);
  const [actionType, setActionType] = useState<"paid" | "unpaid" | null>(null);

  // Read landlord's rentals
  const {
    data: myRentalsData,
    isLoading,
    isRefetching,
    refetch,
    error: readError,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: RENT_ROLL_ABI,
    functionName: "getMyRentals",
    account: address,
    query: {
      enabled: isConnected && !!address && DEFAULT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  const {
    data: txHash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  React.useEffect(() => {
    if (isConfirmed) {
      refetch();
      onRefreshStats?.();
      setActionRentalId(null);
      setActionType(null);
      resetWrite();
    }
  }, [isConfirmed, refetch, onRefreshStats, resetWrite]);

  const handleMarkPaid = (rentalId: bigint) => {
    setActionRentalId(rentalId);
    setActionType("paid");
    try {
      writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: RENT_ROLL_ABI,
        functionName: "markRentPaid",
        args: [rentalId],
      });
    } catch {
      setActionRentalId(null);
      setActionType(null);
    }
  };

  const handleMarkUnpaid = (rentalId: bigint) => {
    setActionRentalId(rentalId);
    setActionType("unpaid");
    try {
      writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: RENT_ROLL_ABI,
        functionName: "markRentUnpaid",
        args: [rentalId],
      });
    } catch {
      setActionRentalId(null);
      setActionType(null);
    }
  };

  const handleCopyId = async (id: string) => {
    const ok = await copyToClipboard(id);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!mounted || !isConnected) {
    return null;
  }

  const rentals = (myRentalsData as unknown as RentalRecord[]) || [];

  return (
    <section className="mt-8 bg-charcoal-900/90 rounded-2xl border border-charcoal-800 p-6 shadow-xl backdrop-blur">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-green/10 text-brand-green">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">My Managed Rental Units</h3>
            <p className="text-xs text-neutral-400">
              Only you ({address?.slice(0, 6)}...{address?.slice(-4)}) have authorization to update these records
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700 text-xs text-neutral-300 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-brand-purple" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Global Status/Error */}
      {writeError && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{parseContractError(writeError)}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-purple mx-auto mb-2" />
          <p className="text-xs text-neutral-400">Loading your registered rental units...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && rentals.length === 0 && (
        <div className="py-12 px-4 text-center rounded-xl bg-charcoal-850/40 border border-charcoal-800">
          <Home className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-neutral-200">No Rental Records Found</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
            You haven't registered any rental properties on Botchain Mainnet yet. Use the registration form above to get started.
          </p>
        </div>
      )}

      {/* Records Cards / Table Grid */}
      {!isLoading && rentals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rentals.map((rental) => {
            const isPaid = Number(rental.status) === PaymentStatus.Paid;
            const rentalIdStr = rental.rentalId.toString();
            const isProcessingThis =
              actionRentalId === rental.rentalId && (isWritePending || isConfirming);

            return (
              <div
                key={rentalIdStr}
                className="rounded-xl bg-charcoal-850/80 border border-charcoal-750 p-4 flex flex-col justify-between hover:border-charcoal-700 transition shadow-md"
              >
                <div>
                  {/* Card Header: Unit & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-charcoal-800 text-neutral-300 border border-charcoal-700">
                          #{rentalIdStr}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(rentalIdStr)}
                          className="p-1 text-neutral-400 hover:text-white transition"
                          title="Copy Rental ID"
                        >
                          {copiedId === rentalIdStr ? (
                            <Check className="w-3 h-3 text-brand-green" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold text-white tracking-tight">
                        {rental.unitReference}
                      </h4>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        isPaid
                          ? "bg-brand-greenMuted text-brand-green border border-brand-green/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Unpaid</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs py-2 border-y border-charcoal-750/60 my-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Rent Amount:</span>
                      <span className="font-mono font-medium text-white">
                        {formatRent(rental.rentAmount)} BOT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Due Date:</span>
                      <span className="font-medium text-neutral-200">
                        {formatDate(rental.dueDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Last Payment:</span>
                      <span className="font-mono text-neutral-300">
                        {formatDateTime(rental.lastPaymentTimestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Landlord Action Controls */}
                <div className="pt-2 mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Mark as Paid Button */}
                    <button
                      type="button"
                      disabled={isPaid || isProcessingThis}
                      onClick={() => handleMarkPaid(rental.rentalId)}
                      className="py-1.5 px-2 rounded-lg text-xs font-medium text-white bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border border-brand-green/30 transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isProcessingThis && actionType === "paid" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Mark Paid</span>
                    </button>

                    {/* Mark as Unpaid Button */}
                    <button
                      type="button"
                      disabled={!isPaid || isProcessingThis}
                      onClick={() => handleMarkUnpaid(rental.rentalId)}
                      className="py-1.5 px-2 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isProcessingThis && actionType === "unpaid" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>Mark Unpaid</span>
                    </button>
                  </div>

                  {/* Edit Rental Button */}
                  <button
                    type="button"
                    onClick={() => setEditingRental(rental)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Edit Rent & Due Date</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <EditRentalModal
        isOpen={!!editingRental}
        rental={editingRental}
        onClose={() => setEditingRental(null)}
        onUpdated={() => {
          refetch();
          onRefreshStats?.();
        }}
      />
    </section>
  );
}

