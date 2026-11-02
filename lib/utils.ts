import { formatEther } from "viem";

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length < chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatRent(amount: bigint | number | string): string {
  try {
    const big = BigInt(amount);
    const ethVal = formatEther(big);
    // If it's a neat integer, don't show trailing zeroes
    const num = parseFloat(ethVal);
    if (isNaN(num)) return ethVal;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  } catch {
    return String(amount);
  }
}

export function formatDate(timestamp: bigint | number): string {
  const t = Number(timestamp);
  if (!t || t === 0) return "—";
  return new Date(t * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(timestamp: bigint | number): string {
  const t = Number(timestamp);
  if (!t || t === 0) return "Never";
  return new Date(t * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toUnixTimestamp(dateString: string): bigint {
  const date = new Date(dateString);
  return BigInt(Math.floor(date.getTime() / 1000));
}

export function fromUnixTimestampToInput(timestamp: bigint | number): string {
  const t = Number(timestamp);
  if (!t) return "";
  const d = new Date(t * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function parseContractError(error: any): string {
  if (!error) return "An unknown error occurred.";
  const msg = error?.shortMessage || error?.message || String(error);

  if (msg.includes("EmptyUnitReference")) {
    return "Rental unit name or reference cannot be empty.";
  }
  if (msg.includes("InvalidRentAmount")) {
    return "Rent amount must be greater than zero.";
  }
  if (msg.includes("InvalidDueDate")) {
    return "Due date must be in the future.";
  }
  if (msg.includes("NotLandlord")) {
    return "Access denied: Only the original landlord can modify this record.";
  }
  if (msg.includes("RentalNotFound")) {
    return "Rental record not found for the specified ID.";
  }
  if (msg.includes("User rejected")) {
    return "Transaction was cancelled in your wallet.";
  }
  return msg;
}

