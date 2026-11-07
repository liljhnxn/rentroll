"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { botchainMainnet } from "@/lib/chain";
import { shortenAddress, copyToClipboard } from "@/lib/utils";
import {
  Building2,
  Wallet,
  LogOut,
  Copy,
  Check,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [noWalletModalOpen, setNoWalletModalOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWrongNetwork = mounted && isConnected && chain?.id !== botchainMainnet.id;

  const handleCopy = async () => {
    if (!address) return;
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    setLocalError(null);

    // 1. Check if browser has an injected Web3 provider (e.g. MetaMask)
    const hasEthereum = typeof window !== "undefined" && Boolean((window as any).ethereum);

    if (!hasEthereum) {
      setNoWalletModalOpen(true);
      return;
    }

    try {
      // 2. Prioritize MetaMask or Injected connector
      const targetConnector =
        connectors.find(
          (c) =>
            c.id === "metaMask" ||
            c.id === "injected" ||
            c.name.toLowerCase().includes("metamask") ||
            c.name.toLowerCase().includes("injected")
        ) || connectors[0];

      if (targetConnector) {
        await connectAsync({
          connector: targetConnector,
          chainId: botchainMainnet.id,
        });
      } else {
        // Fallback: direct window.ethereum request
        await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      const msg = err?.message || String(err);
      if (msg.includes("User rejected") || msg.includes("denied")) {
        setLocalError("Connection rejected in wallet.");
      } else if (msg.includes("already pending")) {
        setLocalError("A connection request is already pending in MetaMask. Please open your extension.");
      } else {
        setLocalError(msg.length > 80 ? `${msg.slice(0, 80)}...` : msg);
      }
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: botchainMainnet.id });
      } else if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2a5" }], // 677 in hex
          });
        } catch (switchErr: any) {
          // If error 4902, chain has not been added to MetaMask yet
          if (switchErr.code === 4902 || switchErr?.message?.includes("Unrecognized chain")) {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x2a5",
                  chainName: "Botchain Mainnet",
                  nativeCurrency: {
                    name: "BOT",
                    symbol: "BOT",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.botchain.ai"],
                  blockExplorerUrls: ["https://scan.botchain.ai"],
                },
              ],
            });
          }
        }
      }
    } catch (err: any) {
      console.error("Network switch error:", err);
    }
  };

  return (
    <header className="w-full border-b border-charcoal-800 bg-charcoal-900/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-purple to-brand-purpleDark flex items-center justify-center shadow-lg shadow-brand-purple/20 ring-1 ring-white/10">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">RentRoll</span>
              <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-charcoal-800 text-brand-purple border border-brand-purple/30">
                Botchain Mainnet
              </span>
            </div>
            <p className="text-xs text-neutral-400">Rental records made simple.</p>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
          {/* Wrong Network Button */}
          {mounted && isConnected && isWrongNetwork && (
            <button
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{isSwitching ? "Switching..." : "Switch to Botchain (677)"}</span>
            </button>
          )}

          {!mounted ? (
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white/50 bg-charcoal-800 border border-charcoal-750"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          ) : !isConnected ? (
            <div className="flex flex-col items-end">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-brand-purple hover:bg-brand-purpleDark shadow-md shadow-brand-purple/25 transition-all duration-200 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>

              {localError && (
                <span className="text-[11px] text-red-400 mt-1 max-w-xs text-right">
                  {localError}
                </span>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-sm text-neutral-200 transition-colors cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                <span className="font-mono text-xs font-medium">
                  {shortenAddress(address || "")}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-charcoal-850 border border-charcoal-700 shadow-2xl p-2 z-40 text-xs text-neutral-300 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-charcoal-700 mb-1">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                        Connected Landlord
                      </p>
                      <p className="font-mono text-xs text-neutral-200 truncate mt-0.5">
                        {address}
                      </p>
                    </div>

                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-charcoal-700 transition-colors text-left cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-brand-green" />
                      ) : (
                        <Copy className="w-4 h-4 text-neutral-400" />
                      )}
                      <span>{copied ? "Address Copied!" : "Copy Address"}</span>
                    </button>

                    {isWrongNetwork && (
                      <button
                        onClick={() => {
                          handleSwitchNetwork();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors text-left mt-1 cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Switch to Botchain</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        disconnect();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-left mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* No Wallet Detected Modal */}
      {noWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-charcoal-900 border border-charcoal-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setNoWalletModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-charcoal-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple mx-auto flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">
                MetaMask Not Detected
              </h3>
              <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                To connect as a landlord and register rental units, please install the MetaMask extension or open this application in a Web3-enabled browser.
              </p>

              <div className="space-y-2">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-purple hover:bg-brand-purpleDark shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Install MetaMask Extension</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setNoWalletModalOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-charcoal-800 hover:bg-charcoal-750 transition cursor-pointer"
                >
                  Continue Browsing Public Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
