// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RentRoll
 * @dev On-chain rental payment record dApp for landlords and tenants on Botchain Testnet.
 * Records payment statuses without storing sensitive tenant PII on-chain.
 */
contract RentRoll {
    enum PaymentStatus {
        Unpaid,
        Paid
    }

    struct Rental {
        uint256 rentalId;
        address landlord;
        string unitReference;
        uint256 rentAmount;
        uint256 dueDate;
        PaymentStatus status;
        uint256 lastPaymentTimestamp;
        uint256 createdAt;
    }

    // Custom Errors
    error RentalNotFound(uint256 rentalId);
    error NotLandlord(uint256 rentalId, address caller);
    error EmptyUnitReference();
    error InvalidRentAmount();
    error InvalidDueDate();

    // Events
    event RentalRegistered(
        uint256 indexed rentalId,
        address indexed landlord,
        string unitReference,
        uint256 rentAmount,
        uint256 dueDate
    );

    event RentPaid(
        uint256 indexed rentalId,
        address indexed landlord,
        uint256 timestamp
    );

    event RentUnpaid(
        uint256 indexed rentalId,
        address indexed landlord,
        uint256 timestamp
    );

    event RentalUpdated(
        uint256 indexed rentalId,
        address indexed landlord,
        uint256 newRentAmount,
        uint256 newDueDate
    );

    // State Variables
    uint256 private _rentalIdCounter = 1000;
    uint256 private _totalRentals;

    // rentalId => Rental
    mapping(uint256 => Rental) private _rentals;
    // rentalId exists
    mapping(uint256 => bool) private _rentalExists;
    // landlord => list of rental IDs
    mapping(address => uint256[]) private _landlordRentals;

    /**
     * @notice Registers a new rental record.
     * @param unitReference Non-sensitive identifier/reference for the unit (e.g. Unit 4B, Apt 12)
     * @param rentAmount Rent amount (e.g. in wei / native currency)
     * @param dueDate Unix timestamp for the rent payment due date
     * @return rentalId Generated unique identifier for the rental record
     */
    function registerRental(
        string calldata unitReference,
        uint256 rentAmount,
        uint256 dueDate
    ) external returns (uint256) {
        if (bytes(unitReference).length == 0) {
            revert EmptyUnitReference();
        }
        if (rentAmount == 0) {
            revert InvalidRentAmount();
        }
        if (dueDate <= block.timestamp) {
            revert InvalidDueDate();
        }

        _rentalIdCounter++;
        uint256 newRentalId = _rentalIdCounter;

        Rental storage rental = _rentals[newRentalId];
        rental.rentalId = newRentalId;
        rental.landlord = msg.sender;
        rental.unitReference = unitReference;
        rental.rentAmount = rentAmount;
        rental.dueDate = dueDate;
        rental.status = PaymentStatus.Unpaid;
        rental.lastPaymentTimestamp = 0;
        rental.createdAt = block.timestamp;

        _rentalExists[newRentalId] = true;
        _landlordRentals[msg.sender].push(newRentalId);
        _totalRentals++;

        emit RentalRegistered(
            newRentalId,
            msg.sender,
            unitReference,
            rentAmount,
            dueDate
        );

        return newRentalId;
    }

    /**
     * @notice Marks a rental record as Paid. Only callable by the original landlord.
     * @param rentalId The ID of the rental record
     */
    function markRentPaid(uint256 rentalId) external {
        if (!_rentalExists[rentalId]) {
            revert RentalNotFound(rentalId);
        }
        Rental storage rental = _rentals[rentalId];
        if (rental.landlord != msg.sender) {
            revert NotLandlord(rentalId, msg.sender);
        }

        rental.status = PaymentStatus.Paid;
        rental.lastPaymentTimestamp = block.timestamp;

        emit RentPaid(rentalId, msg.sender, block.timestamp);
    }

    /**
     * @notice Marks a rental record as Unpaid. Only callable by the original landlord.
     * @param rentalId The ID of the rental record
     */
    function markRentUnpaid(uint256 rentalId) external {
        if (!_rentalExists[rentalId]) {
            revert RentalNotFound(rentalId);
        }
        Rental storage rental = _rentals[rentalId];
        if (rental.landlord != msg.sender) {
            revert NotLandlord(rentalId, msg.sender);
        }

        rental.status = PaymentStatus.Unpaid;

        emit RentUnpaid(rentalId, msg.sender, block.timestamp);
    }

    /**
     * @notice Updates the rent amount and due date. Only callable by the original landlord.
     * @param rentalId The ID of the rental record
     * @param newRentAmount New rent amount
     * @param newDueDate New payment due date timestamp
     */
    function updateRental(
        uint256 rentalId,
        uint256 newRentAmount,
        uint256 newDueDate
    ) external {
        if (!_rentalExists[rentalId]) {
            revert RentalNotFound(rentalId);
        }
        Rental storage rental = _rentals[rentalId];
        if (rental.landlord != msg.sender) {
            revert NotLandlord(rentalId, msg.sender);
        }
        if (newRentAmount == 0) {
            revert InvalidRentAmount();
        }
        if (newDueDate <= block.timestamp) {
            revert InvalidDueDate();
        }

        rental.rentAmount = newRentAmount;
        rental.dueDate = newDueDate;

        emit RentalUpdated(rentalId, msg.sender, newRentAmount, newDueDate);
    }

    /**
     * @notice Fetches details of a specific rental by ID. Anyone can query this without connecting a wallet.
     * @param rentalId The ID of the rental record
     */
    function getRental(uint256 rentalId) external view returns (Rental memory) {
        if (!_rentalExists[rentalId]) {
            revert RentalNotFound(rentalId);
        }
        return _rentals[rentalId];
    }

    /**
     * @notice Fetches all rental records created by the caller (landlord).
     */
    function getMyRentals() external view returns (Rental[] memory) {
        uint256[] storage ids = _landlordRentals[msg.sender];
        uint256 count = ids.length;
        Rental[] memory rentalsList = new Rental[](count);

        for (uint256 i = 0; i < count; i++) {
            rentalsList[i] = _rentals[ids[i]];
        }

        return rentalsList;
    }

    /**
     * @notice Returns total number of registered rentals.
     */
    function getTotalRentals() external view returns (uint256) {
        return _totalRentals;
    }
}

