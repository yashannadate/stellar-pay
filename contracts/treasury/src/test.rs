#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address,
    Env,
    Vec
};

#[test]
fn test_treasury_flow() {

    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(TreasuryContract, ());
    let client = TreasuryContractClient::new(&env, &contract_id);

    let proposer = Address::generate(&env);
    let emp1 = Address::generate(&env);
    let emp2 = Address::generate(&env);

    let employees = Vec::from_array(&env, [emp1.clone(), emp2.clone()]);
    let amounts = Vec::from_array(&env, [100i128, 200i128]);

    // Create Proposal
    let proposal_id: u32 = client.create_proposal(
        &proposer,
        &employees,
        &amounts,
    );

    assert_eq!(proposal_id, 1);

    // First Approval
    let approver1 = Address::generate(&env);
    client.approve_proposal(&approver1, &proposal_id);

    let proposal_state = client.get_proposal(&proposal_id);
    assert_eq!(proposal_state.approvals, 1);

    // Double Vote Test (Must Fail)
    let double_vote = client.try_approve_proposal(
        &approver1,
        &proposal_id,
    );

    assert!(double_vote.is_err());

    // Second Approval
    let approver2 = Address::generate(&env);
    client.approve_proposal(&approver2, &proposal_id);

    // Execute Proposal
    let executor = Address::generate(&env);
    client.execute_proposal(&executor, &proposal_id);

    let final_state = client.get_proposal(&proposal_id);

    assert!(final_state.executed);
}