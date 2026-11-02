"use client";

import React, { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { RENT_ROLL_ABI, DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";
import { RentalRecord } from "@/lib/types";
import { fromUnixTimestampToInput, parseContractError } from "@/lib/utils";
import {
  X,
  Edit3,
  Calendar,
  Coins,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

interface EditRentalModalProps {
  rental: RentalRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditRentalModal({
  rental,
  isOpen,
  onClose,
  onUpdated,
}: EditRentalModalProps) {
  const [rentAmount, setRentAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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

  useEffect(() => {
    if (rental && isOpen) {
      setRentAmount(formatEther(rental.rentAmount));
      setDueDate(fromUnixTimestampToInput(rental.dueDate));
      setFormError(null);
      resetWrite();
    }
  }, [rental, isOpen, resetWrite]);

  useEffect(() => {
    if (isConfirmed) {
      onUpdated?.();
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onUpdated, onClose]);

  if (!isOpen || !rental) return null;

  const now = new Date(Date.now() + 5 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const minDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(rentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Rent amount must be greater than 0.");
      return;
    }

    if (!dueDate) {
      setFormError("Payment due date is required.");
      return;
    }

    const dueTimestamp = Math.floor(new Date(dueDate).getTime() / 1000);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (dueTimestamp <= currentTimestamp) {
      setFormError("Due date must be in the future.");
      return;
    }

    try {
      const amountWei = parseEther(rentAmount.trim());
      writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: RENT_ROLL_ABI,
        functionName: "updateRental",
        args: [rental.rentalId, amountWei, BigInt(dueTimestamp)],
      });
    } catch (err: any) {
      setFormError(parseContractError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-700 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-charcoal-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Edit Rental #{rental.rentalId.toString()}
            </h3>
            <p className="text-xs text-neutral-400 truncate max-w-xs">
              {rental.unitReference}
            </p>
          </div>
        </div>

        {isConfirmed ? (
          <div className="p-6 text-center rounded-xl bg-charcoal-850 border border-brand-green/30">
            <Check className="w-8 h-8 text-brand-green mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">Rental Record Updated!</h4>
            <p className="text-xs text-neutral-400 mt-1">Changes have been saved on-chain.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-neutral-400" />
                Rent Amount (BOHR)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="e.g. 1.25"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Payment Due Date
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition [color-scheme:dark]"
              />
            </div>

            {(formError || writeError) && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError || parseContractError(writeError)}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-neutral-300 bg-charcoal-800 hover:bg-charcoal-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isWritePending || isConfirming}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-white bg-brand-purple hover:bg-brand-purpleDark shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isWritePending || isConfirming ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

