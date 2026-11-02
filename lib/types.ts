export enum PaymentStatus {
  Unpaid = 0,
  Paid = 1,
}

export interface RentalRecord {
  rentalId: bigint;
  landlord: `0x${string}`;
  unitReference: string;
  rentAmount: bigint;
  dueDate: bigint;
  status: PaymentStatus;
  lastPaymentTimestamp: bigint;
  createdAt: bigint;
}

export interface RentalFormData {
  unitReference: string;
  rentAmount: string;
  dueDate: string;
}

export interface UpdateRentalFormData {
  rentalId: bigint;
  rentAmount: string;
  dueDate: string;
}

