# RentRoll: On-Chain Rental Payment Records

**Whitepaper & Project Deck**  
**Version:** 1.0  
**Date:** November 2026  
**Network:** Botchain Mainnet (Chain ID: 677)  
**Smart Contract:** [`0x3F61d8C503CAA6CF6a785a253bFd3895b49790f8`](https://scan.botchain.ai/address/0x3F61d8C503CAA6CF6a785a253bFd3895b49790f8#code)  
**BOT Chain Website:** [https://botchain.ai](https://botchain.ai)  
**BOT Chain Explorer:** [https://scan.botchain.ai](https://scan.botchain.ai)  
**Repository:** [https://github.com/liljhnxn/rentroll.git](https://github.com/liljhnxn/rentroll.git)  

---

## Executive Summary

**RentRoll** is a decentralized, on-chain rental record registry built on Botchain. It provides landlords and property managers with an immutable, transparent ledger to track rental payment statuses while preserving tenant privacy through a zero-PII (Personally Identifiable Information) architectural model. 

Anyone—tenants, future landlords, underwriters, or auditors—can verify the complete, tamper-proof payment history of a rental unit via a unique Rental ID without connecting a Web3 wallet.

---

## 1. Problem Statement

Traditional rental record-keeping faces three systemic issues:

1. **Disputed Payment Histories**: Landlords and tenants frequently disagree on payment statuses, due dates, and receipts. Paper records and centralized spreadsheets can be retroactively edited, deleted, or fabricated.
2. **Tenant Privacy Vulnerabilities**: Centralized property management platforms aggregate sensitive tenant data (names, social security numbers, bank details, phone numbers). Data breaches expose tenants to identity theft and harassment.
3. **Friction & Lack of Portability**: Good tenants have no simple, trustless mechanism to prove consistent on-time payment track records to prospective new landlords or credit evaluators without disclosing private banking statements.

---

## 2. The Solution: RentRoll

RentRoll decouples payment verification from fund custody and personal identification:

- **Immutable Proof of Status**: All rental records, payment status transitions, and update timestamps are etched onto the Botchain blockchain.
- **Zero Tenant PII**: Only anonymous unit references (e.g., `Unit 4B`, `Loft 102`) are stored on-chain. No names, personal documents, or banking credentials exist in the contract.
- **Cryptographic Access Control**: Solidity access modifiers ensure that only the wallet that registered the unit can mark rent as `Paid` or `Unpaid`, or update rent terms.
- **Universal, Wallet-Free Verification**: Prospective tenants, lenders, or inspection authorities can look up any Rental ID without needing Web3 onboarding or wallet connection.

---

## 3. Product Architecture

```
+-------------------------------------------------------------+
|                     Next.js Frontend                        |
|  - Dashboard Overview (Total Units, Paid/Unpaid, Volume)    |
|  - Public Rental Lookup (Search by Rental ID, No Wallet)    |
|  - Landlord Console (Register Unit, Mark Paid/Unpaid, Edit) |
+------------------------------+------------------------------+
                               |
                        wagmi / viem
                               |
+------------------------------v------------------------------+
|                     BOT Chain Mainnet                       |
|                     RPC: https://rpc.botchain.ai            |
|                     Chain ID: 677                           |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|                    RentRoll.sol Smart Contract              |
|  - Unique Rental ID generator (from #1001)                  |
|  - Struct: id, landlord, unitRef, rentAmount, dueDate,      |
|            status, lastPaymentTimestamp, createdAt          |
|  - Custom Errors: NotLandlord, RentalNotFound, etc.         |
|  - Events: RentalRegistered, RentPaid, RentUnpaid, Updated  |
+-------------------------------------------------------------+
```

---

## 4. Smart Contract Specifications

### 4.1 Data Structure
```solidity
struct Rental {
    uint256 rentalId;
    address landlord;
    string unitReference;
    uint256 rentAmount;
    uint256 dueDate;
    PaymentStatus status; // 0 = Unpaid, 1 = Paid
    uint256 lastPaymentTimestamp;
    uint256 createdAt;
}
```

### 4.2 Security & Permissions
- `registerRental(string unitReference, uint256 rentAmount, uint256 dueDate)`: Requires non-empty unit reference, non-zero rent amount, and future due date. Emits `RentalRegistered`.
- `markRentPaid(uint256 rentalId)`: Guarded by `NotLandlord(rentalId, msg.sender)`. Updates timestamp and sets status to `Paid`.
- `markRentUnpaid(uint256 rentalId)`: Guarded by landlord check. Resets status to `Unpaid` for new billing cycles.
- `updateRental(uint256 rentalId, uint256 newRent, uint256 newDue)`: Allows original landlord to adjust terms for subsequent periods.
- `getRental(uint256 rentalId)`: Public view function.
- `getMyRentals()`: Returns all rental records owned by the calling landlord address.

---

## 5. Technology Stack

- **Smart Contract**: Solidity `^0.8.24`, EVM target `paris`, 200 optimizer runs
- **Development Tooling**: Hardhat, Ethers v6, TypeChain
- **Frontend Framework**: Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **Web3 Layer**: wagmi v2, viem, MetaMask Injected Connector
- **Blockchain**: BOT Chain Mainnet (Chain ID `677`, BotchainScan explorer)

---

## 6. Market Opportunity & User Segments

1. **Independent Landlords**: Manage 1 to 50 units with zero software subscription fees and zero database maintenance.
2. **Tenants**: Obtain an on-chain, unforgeable payment track record to showcase credibility to future landlords.
3. **Property Managers & Co-ops**: Transparent, publicly verifiable rent rolls for multi-stakeholder residential associations.

---

## 7. Roadmap

### Phase 1: Core Foundation (Current)
- [x] Solidity smart contract architecture with custom errors & events.
- [x] Hardhat automated test suite (15/15 passing).
- [x] Deployment & source code verification on BOT Chain Mainnet (`0x3F61d8C503CAA6CF6a785a253bFd3895b49790f8`).
- [x] Responsive Next.js frontend with dark charcoal UI, live stats, and public lookup.

### Phase 2: Automation & Notifications
- [ ] Auto-roll feature: Automatically transition status to `Unpaid` upon reaching due date.
- [ ] On-chain batch registration for multi-family property managers.
- [ ] Opt-in decentralized notification alerts (via Push Protocol / XMTP).

### Phase 3: Identity & Reputation
- [ ] Zero-Knowledge proof integration allowing tenants to prove on-time payment track records without revealing rental address or rent amounts.
- [ ] Multi-sig property management authority delegation.

---

## 8. Deployment & Reference Links

- **BOT Chain Website**: [https://botchain.ai](https://botchain.ai)
- **BOT Chain Explorer**: [https://scan.botchain.ai](https://scan.botchain.ai)
- **Verified Contract**: [`0x3F61d8C503CAA6CF6a785a253bFd3895b49790f8`](https://scan.botchain.ai/address/0x3F61d8C503CAA6CF6a785a253bFd3895b49790f8#code)
- **Network**: BOT Chain Mainnet | Chain ID: `677` | Currency: `BOT` | RPC: `https://rpc.botchain.ai`
- **Source Code**: [https://github.com/liljhnxn/rentroll.git](https://github.com/liljhnxn/rentroll.git)

