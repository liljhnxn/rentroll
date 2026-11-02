export const RENT_ROLL_ABI = [
  {
    inputs: [],
    name: "EmptyUnitReference",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidDueDate",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRentAmount",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "rentalId", type: "uint256" },
      { internalType: "address", name: "caller", type: "address" },
    ],
    name: "NotLandlord",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "rentalId", type: "uint256" }],
    name: "RentalNotFound",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "rentalId", type: "uint256" },
      { indexed: true, internalType: "address", name: "landlord", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "RentPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "rentalId", type: "uint256" },
      { indexed: true, internalType: "address", name: "landlord", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "RentUnpaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "rentalId", type: "uint256" },
      { indexed: true, internalType: "address", name: "landlord", type: "address" },
      { indexed: false, internalType: "string", name: "unitReference", type: "string" },
      { indexed: false, internalType: "uint256", name: "rentAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "dueDate", type: "uint256" },
    ],
    name: "RentalRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "rentalId", type: "uint256" },
      { indexed: true, internalType: "address", name: "landlord", type: "address" },
      { indexed: false, internalType: "uint256", name: "newRentAmount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newDueDate", type: "uint256" },
    ],
    name: "RentalUpdated",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "rentalId", type: "uint256" }],
    name: "getRental",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "rentalId", type: "uint256" },
          { internalType: "address", name: "landlord", type: "address" },
          { internalType: "string", name: "unitReference", type: "string" },
          { internalType: "uint256", name: "rentAmount", type: "uint256" },
          { internalType: "uint256", name: "dueDate", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "uint256", name: "lastPaymentTimestamp", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct RentRoll.Rental",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyRentals",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "rentalId", type: "uint256" },
          { internalType: "address", name: "landlord", type: "address" },
          { internalType: "string", name: "unitReference", type: "string" },
          { internalType: "uint256", name: "rentAmount", type: "uint256" },
          { internalType: "uint256", name: "dueDate", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "uint256", name: "lastPaymentTimestamp", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct RentRoll.Rental[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalRentals",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "rentalId", type: "uint256" }],
    name: "markRentPaid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "rentalId", type: "uint256" }],
    name: "markRentUnpaid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "unitReference", type: "string" },
      { internalType: "uint256", name: "rentAmount", type: "uint256" },
      { internalType: "uint256", name: "dueDate", type: "uint256" },
    ],
    name: "registerRental",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "rentalId", type: "uint256" },
      { internalType: "uint256", name: "newRentAmount", type: "uint256" },
      { internalType: "uint256", name: "newDueDate", type: "uint256" },
    ],
    name: "updateRental",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const DEFAULT_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

