#![no_std]

#[cfg(any(test, feature = "as-library"))]
extern crate std;

use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyPaid = 1,
    InvalidAmount = 2,
    NotInitialized = 3,
    AlreadyInitialized = 4,
    AmountExceedsOwed = 5,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Landlord,
    TotalRent,
    TotalCollected,
    PayerPaid(Address),
    Initialized,
}

#[contract]
pub struct RentSplitContract;

#[contractimpl]
impl RentSplitContract {
    /// Initializes the rent contract with the landlord address and total rent amount.
    pub fn initialize(env: Env, landlord: Address, total_rent: i128) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        if total_rent <= 0 {
            return Err(Error::InvalidAmount);
        }
        env.storage().instance().set(&DataKey::Landlord, &landlord);
        env.storage().instance().set(&DataKey::TotalRent, &total_rent);
        env.storage().instance().set(&DataKey::TotalCollected, &0i128);
        env.storage().instance().set(&DataKey::Initialized, &true);
        Ok(())
    }

    /// Records a rent payment from a roommate.
    /// Requires payer's authorization.
    pub fn pay_rent(env: Env, payer: Address, amount: i128) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::NotInitialized);
        }
        payer.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let total_rent: i128 = env.storage().instance().get(&DataKey::TotalRent).unwrap();
        let mut total_collected: i128 = env.storage().instance().get(&DataKey::TotalCollected).unwrap();

        if total_collected >= total_rent {
            return Err(Error::AlreadyPaid);
        }

        if total_collected + amount > total_rent {
            return Err(Error::AmountExceedsOwed);
        }

        // Update payer's balance paid
        let payer_key = DataKey::PayerPaid(payer.clone());
        let previous_paid: i128 = env.storage().persistent().get(&payer_key).unwrap_or(0);
        let new_paid = previous_paid + amount;
        env.storage().persistent().set(&payer_key, &new_paid);

        // Update total collected
        total_collected += amount;
        env.storage().instance().set(&DataKey::TotalCollected, &total_collected);

        // Emit Soroban event: contains topics [symbol, payer], data (amount, new total_collected)
        env.events().publish(
            (soroban_sdk::symbol_short!("pay_rent"), payer.clone()),
            (amount, total_collected)
        );

        Ok(())
    }

    /// Returns the remaining rent balance that is owed globally.
    pub fn get_balance(env: Env, _payer: Address) -> i128 {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return 0;
        }
        let total_rent: i128 = env.storage().instance().get(&DataKey::TotalRent).unwrap();
        let total_collected: i128 = env.storage().instance().get(&DataKey::TotalCollected).unwrap_or(0);
        
        total_rent - total_collected
    }

    /// Returns the total amount of rent paid/collected so far.
    pub fn get_total_paid(env: Env) -> i128 {
        if !env.storage().instance().has(&DataKey::Initialized) {
            return 0;
        }
        env.storage().instance().get(&DataKey::TotalCollected).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address};
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialization() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RentSplitContract);
        let client = RentSplitContractClient::new(&env, &contract_id);

        let landlord = Address::generate(&env);
        let res = client.initialize(&landlord, &1200);
        assert!(res.is_ok());

        assert_eq!(client.get_total_paid(), 0);
    }

    #[test]
    fn test_double_initialization() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RentSplitContract);
        let client = RentSplitContractClient::new(&env, &contract_id);

        let landlord = Address::generate(&env);
        client.initialize(&landlord, &1200);
        
        let res = client.try_initialize(&landlord, &1000);
        assert!(res.is_err());
    }

    #[test]
    fn test_invalid_initialize_amount() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RentSplitContract);
        let client = RentSplitContractClient::new(&env, &contract_id);

        let landlord = Address::generate(&env);
        let res = client.try_initialize(&landlord, &-5);
        assert!(res.is_err());
    }

    #[test]
    fn test_successful_payments() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RentSplitContract);
        let client = RentSplitContractClient::new(&env, &contract_id);

        let landlord = Address::generate(&env);
        let roommate1 = Address::generate(&env);
        let roommate2 = Address::generate(&env);

        client.initialize(&landlord, &2000);

        env.mock_all_auths();

        // Check initial balances owed
        assert_eq!(client.get_balance(&roommate1), 2000);

        // Roommate 1 pays 800
        client.pay_rent(&roommate1, &800);
        assert_eq!(client.get_total_paid(), 800);
        assert_eq!(client.get_balance(&roommate1), 1200);
        assert_eq!(client.get_balance(&roommate2), 1200);

        // Roommate 2 pays 1200 (reaches total)
        client.pay_rent(&roommate2, &1200);
        assert_eq!(client.get_total_paid(), 2000);
        assert_eq!(client.get_balance(&roommate1), 0);
    }

    #[test]
    fn test_payment_exceeds_owed() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RentSplitContract);
        let client = RentSplitContractClient::new(&env, &contract_id);

        let landlord = Address::generate(&env);
        let roommate = Address::generate(&env);

        client.initialize(&landlord, &1500);

        env.mock_all_auths();
        let res = client.try_pay_rent(&roommate, &1600);
        assert!(res.is_err());
    }

    #[test]
    fn test_payment_after_already_paid() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RentSplitContract);
        let client = RentSplitContractClient::new(&env, &contract_id);

        let landlord = Address::generate(&env);
        let roommate = Address::generate(&env);

        client.initialize(&landlord, &1000);

        env.mock_all_auths();
        client.pay_rent(&roommate, &1000);
        
        // Payer tries to pay more when total rent is fully settled
        let res = client.try_pay_rent(&roommate, &100);
        assert!(res.is_err());
    }
}
