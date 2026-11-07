# RentRoll 🏠⛓️

> **Rental records made simple.**  
> A lightweight, transparent on-chain rental payment record dApp designed for landlords, property managers, and tenants on **Botchain Mainnet**.

---

## 📖 Overview

**RentRoll** provides an immutable, decentralized registry for rental payment records. 
Landlords can register rental units using anonymous unit references, define rent amounts and due dates, and update payment statuses (Paid / Unpaid). Anyone (tenants, prospective renters, auditors) can lookup and verify the payment status of any rental unit using its unique Rental ID—**without needing to connect a wallet**.

### Key Design & Privacy Principles
- **Zero Tenant PII On-Chain**: No tenant names, phone numbers, email addresses, or physical home addresses are stored on the blockchain. Records use anonymous unit identifiers (e.g., `Unit 4B`, `Studio 102`).
- **Cryptographic Access Control**: Enforced directly inside the Solidity smart contract. Only the wallet address that created a rental record can mark rent as paid/unpaid or update rent terms.
- **Record Verification Only**: RentRoll records verified payment states and history timestamps; it does not process or custody fiat or escrow funds.
- **Dark Charcoal Modern UI**: Styled with clean typography, rounded cards, subtle purple and green accents, and full responsiveness across mobile, tablet, and desktop devices.

---

## ⚡ Blockchain Configuration (Botchain Mainnet)

| Parameter | Mainnet (Active) | Testnet |
|---|---|---|
| **Network Name** | Botchain Mainnet | Botchain Testnet |
| **Chain ID** | `677` (`0x2a5`) | `968` (`0x3c8`) |
| **Currency Symbol** | `BOT` | `BOHR` |
| **Total Supply** | 150 Million BOT | — |
| **RPC Endpoint** | `https://rpc.botchain.ai` | `https://rpc.bohr.life` |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) | [https://scan.bohr.life](https://scan.bohr.life) |
| **Verified Contract** | [`0x3F61d8C503CAA6CF6a785a253bFd3895b49790f8`](https://scan.botchain.ai/address/0x3F61d8C503CAA6CF6a785a253bFd3895b49790f8#code) | [`0xDfA9407DD6D940A4613E07c73f2ef838cc64Da15`](https://scan.bohr.life/address/0xDfA9407DD6D940A4613E07c73f2ef838cc64Da15#code) |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server-Side Rendering & Static Generation)
- **Language**: TypeScript & Solidity `^0.8.24`
- **Styling**: Tailwind CSS
- **Smart Contract Development**: Hardhat, Ethers v6, TypeChain
- **Web3 Integration**: [wagmi v2](https://wagmi.sh/), [viem](https://viem.sh/), MetaMask Injected Connector
- **Icons**: Lucide React

---

## 📂 Project Structure

```
Rentroll/
├── app/
│   ├── globals.css          # Tailwind CSS styles and dark theme variables
│   ├── layout.tsx           # Next.js root layout with Web3 providers
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── Header.tsx           # Navigation, logo, wallet connect & network switcher
│   ├── DashboardOverview.tsx # Real-time metric cards (total, paid, unpaid, volume)
│   ├── RegisterRental.tsx   # Rental unit registration form with confirmation modal
│   ├── RentalLookup.tsx     # Public lookup by Rental ID (no wallet required)
│   ├── MyRentals.tsx        # Landlord management dashboard (Mark Paid/Unpaid/Edit)
│   ├── EditRentalModal.tsx  # Modal to update rent amounts and due dates
│   └── Providers.tsx        # React Query and Wagmi provider wrapper
├── contracts/
│   └── RentRoll.sol         # Solidity smart contract
├── scripts/
│   └── deploy.ts            # Hardhat deployment script for Botchain Testnet
├── test/
│   └── RentRoll.test.ts     # Automated Hardhat unit tests (15 test scenarios)
├── lib/
│   ├── chain.ts             # Botchain Testnet viem chain definition
│   ├── contract.ts          # Contract ABI and address configuration
│   ├── types.ts             # TypeScript interfaces and enum definitions
│   ├── utils.ts             # Currency formatting, date parsing, copy-to-clipboard
│   └── wagmi.ts             # Wagmi client configuration
├── hardhat.config.ts        # Hardhat configuration with Botchain network setup
├── tailwind.config.ts       # Tailwind theme colors and charcoal palette
├── tsconfig.json            # TypeScript configuration
└── package.json             # Scripts and dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MetaMask](https://metamask.io/) browser extension configured with Botchain Testnet:
  - Network Name: `Botchain Testnet`
  - RPC URL: `https://rpc.bohr.life`
  - Chain ID: `968`
  - Symbol: `BOHR`

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Populate `.env` with your deployment private key and deployed contract address:
```ini
PRIVATE_KEY=your_private_key_here
BOTCHAIN_RPC_URL=https://rpc.bohr.life
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

---

## 🧪 Smart Contract Testing

Run the full suite of automated unit tests covering all functional and security requirements:

```bash
npm run test
```

### Tested Scenarios (15/15 Passing):
1. **Rental Registration**:
   - Registering rental units and emitting `RentalRegistered` events.
   - Sequential, unique Rental ID generation (starts at #1001).
   - Reverting empty rental unit references (`EmptyUnitReference`).
   - Reverting zero rent amounts (`InvalidRentAmount`).
   - Reverting past or current payment due dates (`InvalidDueDate`).
2. **Payment Status Transitions**:
   - Landlord marking rent as `Paid` and recording payment timestamp.
   - Reverting unauthorized callers attempting to mark as `Paid` (`NotLandlord`).
   - Landlord marking rent as `Unpaid` and emitting `RentUnpaid`.
   - Reverting unauthorized callers attempting to mark as `Unpaid`.
3. **Updating Records**:
   - Landlord updating rent amount and due dates with `RentalUpdated` events.
   - Preventing non-landlords from updating rental terms.
   - Rejecting zero amounts or invalid future dates on updates.
4. **Queries & Retrievals**:
   - Reverting non-existent IDs with `RentalNotFound`.
   - Returning landlord-specific rental records via `getMyRentals()`.

---

## 📦 Smart Contract Deployment

### Mainnet (Chain ID 677)
```bash
npm run deploy:mainnet
npm run verify:mainnet <CONTRACT_ADDRESS>
```

### Testnet (Chain ID 968)
```bash
npm run deploy:testnet
npm run verify:testnet <CONTRACT_ADDRESS>
```
   ```
4. The script deploys `RentRoll.sol` to Botchain Testnet, logs the deployed address, and automatically updates `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env`.

---

## 💻 Running the Web Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 📱 User Walkthrough

1. **Dashboard Overview**:
   - View total units, active paid rentals, unpaid rentals, and total recorded rent volume directly from the Botchain blockchain.
2. **Connect Wallet**:
   - Click **Connect Wallet** in the header. If connected to another chain, click **Switch to Botchain (968)**.
3. **Register a Rental Unit**:
   - Enter an anonymous unit identifier (e.g. `Unit 2A - Westside`).
   - Enter rent amount in `BOHR`.
   - Choose a future payment due date.
   - Click **Register Rental** and confirm the transaction in MetaMask.
   - Once confirmed, copy your newly generated **Rental ID** and view the transaction on BohrScan.
4. **Public Record Lookup**:
   - Without connecting any wallet, enter any Rental ID in the **Rental Record Lookup** box.
   - View verified on-chain payment status, due date, landlord address, and last payment timestamp.
5. **Landlord Unit Management**:
   - Under **My Managed Rental Units**, landlords can:
     - Click **Mark Paid** when rent is received to update status and timestamp.
     - Click **Mark Unpaid** if a new billing cycle begins.
     - Click **Edit Rent & Due Date** to modify the terms for the next cycle.

---

## 🛡️ License
MIT License.

