"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { parseEther, decodeEventLog } from "viem";
import { RENT_ROLL_ABI, DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";
import { botchainMainnet } from "@/lib/chain";
import { copyToClipboard, parseContractError } from "@/lib/utils";
import {
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Loader2,
  Calendar,
  Building,
  Coins,
  ShieldAlert,
} from "lucide-react";

interface RegisterRentalProps {
  onSuccessRegistered?: () => void;
}

export function RegisterRental({ onSuccessRegistered }: RegisterRentalProps) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [unitReference, setUnitReference] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [registeredRentalId, setRegisteredRentalId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const isWrongNetwork = isConnected && chain?.id !== botchainMainnet.id;

  const {
    data: txHash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Calculate min datetime string for due date (now + 5 minutes)
  const now = new Date(Date.now() + 5 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const minDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // When receipt is available, decode event log to get rentalId
  React.useEffect(() => {
    if (receipt && isConfirmed) {
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: RENT_ROLL_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "RentalRegistered") {
            const id = (decoded.args as { rentalId: bigint }).rentalId.toString();
            setRegisteredRentalId(id);
            break;
          }
        } catch {
          // not our event log, ignore
        }
      }
      onSuccessRegistered?.();
    }
  }, [receipt, isConfirmed, onSuccessRegistered]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setRegisteredRentalId(null);

    if (!unitReference.trim()) {
      setFormError("Rental unit name or reference is required.");
      return;
    }

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
      setFormError("Payment due date must be in the future.");
      return;
    }

    try {
      const amountWei = parseEther(rentAmount.trim());
      writeContract({
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: RENT_ROLL_ABI,
        functionName: "registerRental",
        args: [unitReference.trim(), amountWei, BigInt(dueTimestamp)],
      });
    } catch (err: any) {
      setFormError(parseContractError(err));
    }
  };

  const handleCopyId = async () => {
    if (!registeredRentalId) return;
    const ok = await copyToClipboard(registeredRentalId);
    if (ok) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetForm = () => {
    setUnitReference("");
    setRentAmount("");
    setDueDate("");
    setRegisteredRentalId(null);
    setFormError(null);
    resetWrite();
  };

  return (
    <div className="bg-charcoal-900/90 rounded-2xl border border-charcoal-800 p-6 shadow-xl backdrop-blur relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Register Rental Unit</h3>
            <p className="text-xs text-neutral-400">
              Create a transparent on-chain rental record
            </p>
          </div>
        </div>
      </div>

      {!mounted || !isConnected ? (
        <div className="p-6 rounded-xl bg-charcoal-850/80 border border-charcoal-750 text-center">
          <ShieldAlert className="w-8 h-8 text-brand-purple mx-auto mb-2" />
          <h4 className="text-sm font-medium text-neutral-200">Connect Wallet Required</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
            Landlords must connect their Web3 wallet to sign the transaction and register rental records.
          </p>
          <button
            type="button"
            onClick={async () => {
              if (typeof window !== "undefined" && (window as any).ethereum) {
                const target = connectors.find((c) => c.id === "injected" || c.id === "metaMask") || connectors[0];
                if (target) {
                  try {
                    await connectAsync({ connector: target, chainId: botchainMainnet.id });
                  } catch (e) {
                    console.error(e);
                  }
                } else {
                  await (window as any).ethereum.request({ method: "eth_requestAccounts" });
                }
              } else {
                window.open("https://metamask.io/download/", "_blank");
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-white bg-brand-purple hover:bg-brand-purpleDark shadow-md transition cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>Connect Wallet Now</span>
          </button>
        </div>
      ) : isWrongNetwork ? (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-amber-200">Incorrect Network</h4>
          <p className="text-xs text-amber-300/80 max-w-sm mx-auto mt-1 mb-3">
            Please switch to Botchain Mainnet (Chain ID 677) to register rental units.
          </p>
          <button
            type="button"
            onClick={() => switchChain?.({ chainId: botchainMainnet.id })}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-charcoal-950 font-semibold text-xs transition cursor-pointer"
          >
            Switch to Botchain Mainnet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit Reference */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-neutral-400" />
              Rental Unit Reference
            </label>
            <input
              type="text"
              value={unitReference}
              onChange={(e) => setUnitReference(e.target.value)}
              placeholder="e.g. Unit 4B - Midtown Plaza or Apt 104"
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Use anonymous unit identifiers. Do not store sensitive tenant PII.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rent Amount */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-neutral-400" />
                Rent Amount (BOT)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="e.g. 1.25"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors font-mono"
              />
            </div>

            {/* Payment Due Date */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Payment Due Date
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-700 text-white text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Validation & Contract Errors */}
          {(formError || writeError) && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{formError || parseContractError(writeError)}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isWritePending || isConfirming}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-brand-purple hover:bg-brand-purpleDark shadow-lg shadow-brand-purple/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
          >
            {isWritePending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isWritePending ? "Confirm in Wallet..." : "Confirming on Botchain..."}
                </span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Register Rental</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Confirmation & Registered Details Modal/Box */}
      {isConfirmed && receipt && (
        <div className="mt-5 p-4 rounded-xl bg-charcoal-850 border border-brand-green/30 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-brand-green text-xs font-semibold uppercase tracking-wider mb-2">
            <Check className="w-4 h-4" />
            <span>Rental Unit Successfully Registered!</span>
          </div>

          {registeredRentalId ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-900 border border-charcoal-750 mb-3">
              <div>
                <span className="text-[11px] text-neutral-400 block">Generated Rental ID</span>
                <span className="font-mono text-lg font-bold text-white tracking-wider">
                  #{registeredRentalId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-neutral-200 text-xs font-medium border border-charcoal-700 transition cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-green" />
                    <span className="text-brand-green">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <p className="text-xs text-neutral-300 mb-3">
              Rental registered. Check your dashboard to view the record.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-charcoal-750">
            {txHash && (
              <a
                href={`https://scan.botchain.ai/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-purple hover:underline"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/botchain-logo.png" alt="BOT Chain" className="w-3.5 h-3.5 rounded-xs object-cover" />
                <span>View on BotchainScan Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={handleResetForm}
              className="text-neutral-400 hover:text-white transition cursor-pointer"
            >
              + Register Another Unit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

