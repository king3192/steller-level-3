# RentStar - Soroban Smart Contracts Documentation

RentStar implements a dual-contract design pattern on Stellar to segregate roommate records (storage) from transaction processing (logic).

---

## 1. RoomManager Contract

The `RoomManager` contract manages tenant records, allocated shares, payment status, and landlord administrator keys.

### Errors (`pub enum Error`)
- **`NotAuthorized (1)`**: The sender is not permitted to perform the operation.
- **`AlreadyInitialized (2)`**: The initialization method was called after the contract was already active.
- **`NotInitialized (3)`**: The requested method cannot be executed because the contract is not initialized yet.
- **`RoommateNotFound (4)`**: The specified roommate address is not in the registry.
- **`InvalidAmount (5)`**: The rent share or payment amount is zero or negative.
- **`ExceedsShare (6)`**: The contribution would exceed the roommate's assigned share.

### Storage Keys (`pub enum DataKey`)
- `Admin`: Landlord `Address`.
- `RentSplit`: Authorized payment contract `Address`.
- `RoommateShare(Address)`: Target roommate's assigned share (`i128`).
- `RoommatePaid(Address)`: Target roommate's cumulative payments (`i128`).
- `TotalRent`: Sum of all roommate shares (`i128`).
- `Initialized`: Status flag (`bool`).

### Functions

#### `initialize(env: Env, admin: Address) -> Result<(), Error>`
Sets the administrator/landlord account.
- **Arguments**:
  - `admin`: The landlord's Stellar public key.
- **Panics**: If already initialized.

#### `set_rent_split(env: Env, rent_split: Address) -> Result<(), Error>`
Links the authorized `RentSplit` contract address that can submit payments.
- **Arguments**:
  - `rent_split`: The deployed `RentSplit` contract address.
- **Access**: Only callable by the initialized `Admin` (requires admin auth).

#### `add_roommate(env: Env, roommate: Address, share: i128) -> Result<(), Error>`
Registers a roommate address and sets their rent share.
- **Arguments**:
  - `roommate`: Roommate's Stellar public key.
  - `share`: Share of the total rent (in XLM).
- **Access**: Only callable by `Admin` (requires admin auth).
- **Events Emitted**:
  - Topic: `(Symbol::shor("add_room"), roommate)`
  - Data: `share` (`i128`)

#### `record_payment(env: Env, roommate: Address, amount: i128) -> Result<(), Error>`
Updates the roommate's paid balance.
- **Arguments**:
  - `roommate`: Roommate who paid.
  - `amount`: Payment value.
- **Access**: Only callable by the linked `RentSplit` contract (requires RentSplit auth).

#### Read-Only Getters:
- `get_share(env: Env, roommate: Address) -> i128`: Returns the assigned rent share.
- `get_paid(env: Env, roommate: Address) -> i128`: Returns cumulative paid rent.
- `is_roommate(env: Env, roommate: Address) -> bool`: Returns `true` if the address is registered.
- `get_total_rent(env: Env) -> i128`: Returns total pool rent.
- `get_admin(env: Env) -> Option<Address>`: Returns the landlord's address.
- `get_rent_split(env: Env) -> Option<Address>`: Returns the linked split contract address.

---

## 2. RentSplit Contract

The `RentSplit` contract handles incoming payments from roommates, validates constraints, and executes cross-contract updates.

### Errors (`pub enum Error`)
- **`AlreadyPaid (1)`**: The global rent pool has already been fully collected.
- **`InvalidAmount (2)`**: The payment amount is zero or negative.
- **`NotInitialized (3)`**: The contract has not been initialized.
- **`AlreadyInitialized (4)`**: The contract is already initialized.
- **`AmountExceedsOwed (5)`**: The payment would exceed the global outstanding rent pool balance.
- **`NotRoommate (6)`**: The sender address is not registered in the RoomManager registry.
- **`AmountExceedsShare (7)`**: The payment would exceed the sender's individual remaining rent share.
- **`RoomManagerError (8)`**: The cross-contract call to `RoomManager` failed.

### Functions

#### `initialize(env: Env, room_manager: Address) -> Result<(), Error>`
Links this processor to the target roommate registry contract.
- **Arguments**:
  - `room_manager`: The deployed `RoomManager` contract ID.

#### `pay_rent(env: Env, payer: Address, amount: i128) -> Result<(), Error>`
Submits a rent payment.
- **Arguments**:
  - `payer`: Roommate paying rent.
  - `amount`: Amount in XLM to contribute.
- **Access**: Requires `payer` signature auth (`payer.require_auth()`).
- **Logic**:
  1. Checks if `RoomManager.is_roommate(payer)` is true.
  2. Queries `RoomManager` to ensure `amount` fits within individual and global outstanding limits.
  3. Invokes `RoomManager.record_payment(payer, amount)` via cross-contract call.
  4. Increments local trackers and emits events.
- **Events Emitted**:
  - Topic: `(Symbol::short("pay_rent"), payer)`
  - Data: `(amount, total_collected)`

#### Read-Only Getters:
- `get_balance(env: Env, _payer: Address) -> i128`: Returns global outstanding rent balance.
- `get_total_paid(env: Env) -> i128`: Returns total rent collected.
- `get_roommate_balance(env: Env, roommate: Address) -> i128`: Returns roommate's outstanding balance.
- `get_room_manager(env: Env) -> Option<Address>`: Returns the linked RoomManager contract ID.
