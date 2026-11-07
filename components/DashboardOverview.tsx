"use client";

import React, { useEffect, useState } from "react";
import { useReadContract, useAccount, useReadContracts } from "wagmi";
import { RENT_ROLL_ABI, DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";
import { formatRent } from "@/lib/utils";
import { Building, CheckCircle2, Clock, Coins, RefreshCw } from "lucide-react";
import { RentalRecord } from "@/lib/types";

export function DashboardOverview({ refreshTrigger }: { refreshTrigger?: number }) {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Get total rentals registered in the contract
  const {
    data: totalRentalsData,
    refetch: refetchTotal,
    isLoading: isLoadingTotal,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: RENT_ROLL_ABI,
    functionName: "getTotalRentals",
  });

  const totalCount = totalRentalsData ? Number(totalRentalsData) : 0;

  // Prepare calls to get details for all rentals (1001 to 1000 + totalCount)
  const rentalCalls = Array.from({ length: totalCount }, (_, i) => ({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: RENT_ROLL_ABI,
    functionName: "getRental" as const,
    args: [BigInt(1001 + i)],
  }));

  const {
    data: allRentalsData,
    refetch: refetchAllRentals,
    isLoading: isLoadingAll,
    isRefetching,
  } = useReadContracts({
    contracts: rentalCalls,
    query: {
      enabled: totalCount > 0 && DEFAULT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    },
  });

  useEffect(() => {
    refetchTotal();
    refetchAllRentals();
  }, [refreshTrigger, refetchTotal, refetchAllRentals]);

  // Aggregate metrics
  let paidCount = 0;
  let unpaidCount = 0;
  let totalAmountWei = 0n;

  if (allRentalsData) {
    for (const res of allRentalsData) {
      if (res.status === "success" && res.result) {
        const rental = res.result as unknown as RentalRecord;
        if (Number(rental.status) === 1) {
          paidCount++;
        } else {
          unpaidCount++;
        }
        totalAmountWei += BigInt(rental.rentAmount);
      }
    }
  }

  const handleManualRefresh = () => {
    refetchTotal();
    refetchAllRentals();
  };

  const statCards = [
    {
      label: "Total Rental Units",
      value: isLoadingTotal ? "..." : totalCount.toString(),
      subtext: "On-chain registered units",
      icon: Building,
      iconBg: "bg-brand-purple/10 text-brand-purple",
      border: "border-charcoal-800 hover:border-brand-purple/30",
    },
    {
      label: "Paid Rentals",
      value: isLoadingAll ? "..." : paidCount.toString(),
      subtext: "Current cycle settled",
      icon: CheckCircle2,
      iconBg: "bg-brand-green/10 text-brand-green",
      border: "border-charcoal-800 hover:border-brand-green/30",
    },
    {
      label: "Unpaid Rentals",
      value: isLoadingAll ? "..." : unpaidCount.toString(),
      subtext: "Awaiting payment",
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-400",
      border: "border-charcoal-800 hover:border-amber-500/30",
    },
    {
      label: "Recorded Rent Volume",
      value: isLoadingAll ? "..." : `${formatRent(totalAmountWei)} BOT`,
      subtext: "Total monthly rental value",
      icon: Coins,
      iconBg: "bg-indigo-500/10 text-indigo-400",
      border: "border-charcoal-800 hover:border-indigo-500/30",
    },
  ];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time on-chain statistics from Botchain Mainnet
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefetching || isLoadingTotal}
          title="Refresh stats"
          className="p-2 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-brand-purple" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-charcoal-900/90 border ${card.border} shadow-lg backdrop-blur transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight text-white font-mono">
                  {card.value}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

