#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address,
    Env,
    Vec
};

#[test]
fn test_create_proposal() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let proposer = Address::generate(&env);
    let emp1 = Address::generate(&env);
    
    let employees = Vec::from_array(&env, [emp1]);
    let amounts = Vec::from_array(&env, [100i128]);

    let proposal_id: u32 = client.create_proposal(&proposer, &employees, &amounts);
    
    assert_eq!(proposal_id, 1);
}

#[test]
fn test_approve_proposal() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let proposer = Address::generate(&env);
    let emp1 = Address::generate(&env);
    let employees = Vec::from_array(&env, [emp1]);
    let amounts = Vec::from_array(&env, [100i128]);

    let proposal_id: u32 = client.create_proposal(&proposer, &employees, &amounts);

    let approver1 = Address::generate(&env);
    client.approve_proposal(&approver1, &proposal_id);

    let proposal_state = client.get_proposal(&proposal_id);
    
    assert_eq!(proposal_state.approvals, 1);
}

#[test]
fn test_execution_fails_without_multisig() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let proposer = Address::generate(&env);
    let emp1 = Address::generate(&env);
    let employees = Vec::from_array(&env, [emp1]);
    let amounts = Vec::from_array(&env, [100i128]);

    let proposal_id: u32 = client.create_proposal(&proposer, &employees, &amounts);

    let executor = Address::generate(&env);
    let dummy_token = Address::generate(&env);

    let result = client.try_execute_proposal(&executor, &proposal_id, &dummy_token);
    
    assert!(result.is_err());
}