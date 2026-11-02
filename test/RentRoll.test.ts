import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { RentRoll } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RentRoll Contract", function () {
  let rentRoll: RentRoll;
  let owner: HardhatEthersSigner;
  let landlord1: HardhatEthersSigner;
  let landlord2: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  const UNIT_NAME_1 = "Sunset Apartment 302";
  const UNIT_NAME_2 = "Downtown Loft 5B";
  const RENT_AMOUNT_1 = ethers.parseEther("1.5");
  const RENT_AMOUNT_2 = ethers.parseEther("2.0");

  beforeEach(async function () {
    [owner, landlord1, landlord2, stranger] = await ethers.getSigners();
    const RentRollFactory = await ethers.getContractFactory("RentRoll");
    rentRoll = (await RentRollFactory.deploy()) as unknown as RentRoll;
    await rentRoll.waitForDeployment();
  });

  describe("1. Rental Registration", function () {
    it("should allow a landlord to register a rental unit and emit RentalRegistered event", async function () {
      const futureDue = (await time.latest()) + 30 * 24 * 60 * 60; // 30 days from now

      const tx = await rentRoll
        .connect(landlord1)
        .registerRental(UNIT_NAME_1, RENT_AMOUNT_1, futureDue);

      await expect(tx)
        .to.emit(rentRoll, "RentalRegistered")
        .withArgs(1001, landlord1.address, UNIT_NAME_1, RENT_AMOUNT_1, futureDue);

      const rental = await rentRoll.getRental(1001);
      expect(rental.rentalId).to.equal(1001);
      expect(rental.landlord).to.equal(landlord1.address);
      expect(rental.unitReference).to.equal(UNIT_NAME_1);
      expect(rental.rentAmount).to.equal(RENT_AMOUNT_1);
      expect(rental.dueDate).to.equal(futureDue);
      expect(rental.status).to.equal(0); // 0 = Unpaid
      expect(rental.lastPaymentTimestamp).to.equal(0);
      expect(rental.createdAt).to.be.greaterThan(0);

      expect(await rentRoll.getTotalRentals()).to.equal(1);
    });

    it("should generate sequentially unique rental IDs", async function () {
      const futureDue = (await time.latest()) + 10 * 24 * 60 * 60;

      await rentRoll.connect(landlord1).registerRental(UNIT_NAME_1, RENT_AMOUNT_1, futureDue);
      await rentRoll.connect(landlord2).registerRental(UNIT_NAME_2, RENT_AMOUNT_2, futureDue + 100);

      const rental1 = await rentRoll.getRental(1001);
      const rental2 = await rentRoll.getRental(1002);

      expect(rental1.rentalId).to.equal(1001);
      expect(rental2.rentalId).to.equal(1002);
      expect(await rentRoll.getTotalRentals()).to.equal(2);
    });

    it("should reject empty rental reference", async function () {
      const futureDue = (await time.latest()) + 10 * 24 * 60 * 60;

      await expect(
        rentRoll.connect(landlord1).registerRental("", RENT_AMOUNT_1, futureDue)
      ).to.be.revertedWithCustomError(rentRoll, "EmptyUnitReference");
    });

    it("should reject zero rent amounts", async function () {
      const futureDue = (await time.latest()) + 10 * 24 * 60 * 60;

      await expect(
        rentRoll.connect(landlord1).registerRental(UNIT_NAME_1, 0, futureDue)
      ).to.be.revertedWithCustomError(rentRoll, "InvalidRentAmount");
    });

    it("should reject past or current due dates", async function () {
      const pastDue = (await time.latest()) - 100;

      await expect(
        rentRoll.connect(landlord1).registerRental(UNIT_NAME_1, RENT_AMOUNT_1, pastDue)
      ).to.be.revertedWithCustomError(rentRoll, "InvalidDueDate");
    });
  });

  describe("2. Payment Status Management", function () {
    let rentalId: bigint;
    let futureDue: number;

    beforeEach(async function () {
      futureDue = (await time.latest()) + 15 * 24 * 60 * 60;
      await rentRoll.connect(landlord1).registerRental(UNIT_NAME_1, RENT_AMOUNT_1, futureDue);
      rentalId = 1001n;
    });

    it("should allow only the landlord to mark rent as Paid", async function () {
      const tx = await rentRoll.connect(landlord1).markRentPaid(rentalId);

      await expect(tx).to.emit(rentRoll, "RentPaid");

      const rental = await rentRoll.getRental(rentalId);
      expect(rental.status).to.equal(1); // 1 = Paid
      expect(rental.lastPaymentTimestamp).to.be.greaterThan(0);
    });

    it("should reject non-landlords from marking rent as Paid", async function () {
      await expect(
        rentRoll.connect(stranger).markRentPaid(rentalId)
      ).to.be.revertedWithCustomError(rentRoll, "NotLandlord");
    });

    it("should allow only the landlord to mark rent as Unpaid", async function () {
      // First mark paid
      await rentRoll.connect(landlord1).markRentPaid(rentalId);
      expect((await rentRoll.getRental(rentalId)).status).to.equal(1);

      // Now mark unpaid
      const tx = await rentRoll.connect(landlord1).markRentUnpaid(rentalId);
      await expect(tx).to.emit(rentRoll, "RentUnpaid");

      const rental = await rentRoll.getRental(rentalId);
      expect(rental.status).to.equal(0); // 0 = Unpaid
    });

    it("should reject non-landlords from marking rent as Unpaid", async function () {
      await rentRoll.connect(landlord1).markRentPaid(rentalId);

      await expect(
        rentRoll.connect(stranger).markRentUnpaid(rentalId)
      ).to.be.revertedWithCustomError(rentRoll, "NotLandlord");
    });
  });

  describe("3. Updating Rental Records", function () {
    let rentalId: bigint;
    let initialDue: number;

    beforeEach(async function () {
      initialDue = (await time.latest()) + 20 * 24 * 60 * 60;
      await rentRoll.connect(landlord1).registerRental(UNIT_NAME_1, RENT_AMOUNT_1, initialDue);
      rentalId = 1001n;
    });

    it("should allow the landlord to update rent amount and due date", async function () {
      const newDue = (await time.latest()) + 45 * 24 * 60 * 60;
      const newRent = ethers.parseEther("1.8");

      const tx = await rentRoll
        .connect(landlord1)
        .updateRental(rentalId, newRent, newDue);

      await expect(tx)
        .to.emit(rentRoll, "RentalUpdated")
        .withArgs(rentalId, landlord1.address, newRent, newDue);

      const rental = await rentRoll.getRental(rentalId);
      expect(rental.rentAmount).to.equal(newRent);
      expect(rental.dueDate).to.equal(newDue);
    });

    it("should reject updates from non-landlords", async function () {
      const newDue = (await time.latest()) + 45 * 24 * 60 * 60;
      const newRent = ethers.parseEther("1.8");

      await expect(
        rentRoll.connect(stranger).updateRental(rentalId, newRent, newDue)
      ).to.be.revertedWithCustomError(rentRoll, "NotLandlord");
    });

    it("should reject updating with zero rent amount", async function () {
      const newDue = (await time.latest()) + 45 * 24 * 60 * 60;

      await expect(
        rentRoll.connect(landlord1).updateRental(rentalId, 0, newDue)
      ).to.be.revertedWithCustomError(rentRoll, "InvalidRentAmount");
    });

    it("should reject updating with past due date", async function () {
      const pastDue = (await time.latest()) - 10;
      const newRent = ethers.parseEther("1.8");

      await expect(
        rentRoll.connect(landlord1).updateRental(rentalId, newRent, pastDue)
      ).to.be.revertedWithCustomError(rentRoll, "InvalidDueDate");
    });
  });

  describe("4. Queries and Retrievals", function () {
    it("should revert getRental for non-existent rental IDs", async function () {
      await expect(rentRoll.getRental(9999)).to.be.revertedWithCustomError(
        rentRoll,
        "RentalNotFound"
      );
    });

    it("should return all rentals created by a connected landlord", async function () {
      const due1 = (await time.latest()) + 10 * 24 * 60 * 60;
      const due2 = (await time.latest()) + 20 * 24 * 60 * 60;
      const due3 = (await time.latest()) + 30 * 24 * 60 * 60;

      await rentRoll.connect(landlord1).registerRental("Unit 101", RENT_AMOUNT_1, due1);
      await rentRoll.connect(landlord2).registerRental("Unit 201", RENT_AMOUNT_2, due2);
      await rentRoll.connect(landlord1).registerRental("Unit 102", RENT_AMOUNT_1, due3);

      const landlord1Rentals = await rentRoll.connect(landlord1).getMyRentals();
      expect(landlord1Rentals.length).to.equal(2);
      expect(landlord1Rentals[0].unitReference).to.equal("Unit 101");
      expect(landlord1Rentals[1].unitReference).to.equal("Unit 102");

      const landlord2Rentals = await rentRoll.connect(landlord2).getMyRentals();
      expect(landlord2Rentals.length).to.equal(1);
      expect(landlord2Rentals[0].unitReference).to.equal("Unit 201");

      const strangerRentals = await rentRoll.connect(stranger).getMyRentals();
      expect(strangerRentals.length).to.equal(0);
    });
  });
});
