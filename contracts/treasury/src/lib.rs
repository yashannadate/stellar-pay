#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype,
    symbol_short, Address, Env, Vec, token // 🛡️ FIX 1: Imported the token module
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TreasuryError {
    ProposalNotFound = 1,
    AlreadyExecuted = 2,
    NotEnoughApprovals = 3,
    MismatchedLengths = 4,
    EmptyPayroll = 5,
    AlreadyApproved = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PayrollProposal {
    pub proposal_id: u32,
    pub proposer: Address,
    pub employees: Vec<Address>,
    pub amounts: Vec<i128>,
    pub approvals: u32,
    pub approvers: Vec<Address>,
    pub executed: bool,
}

#[contracttype]
pub enum DataKey {
    Proposal(u32),
    ProposalCount,
}

#[contract]
pub struct TreasuryContract;

const REQUIRED_APPROVALS: u32 = 2;

#[contractimpl]
impl TreasuryContract {

    pub fn create_proposal(
        env: Env,
        proposer: Address,
        employees: Vec<Address>,
        amounts: Vec<i128>,
    ) -> Result<u32, TreasuryError> {

        proposer.require_auth();

        if employees.is_empty() {
            return Err(TreasuryError::EmptyPayroll);
        }

        if employees.len() != amounts.len() {
            return Err(TreasuryError::MismatchedLengths);
        }

        let mut count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::ProposalCount)
            .unwrap_or(0);

        count += 1;

        let proposal = PayrollProposal {
            proposal_id: count,
            proposer,
            employees,
            amounts,
            approvals: 0,
            approvers: Vec::new(&env),
            executed: false,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Proposal(count), &proposal);

        env.storage()
            .instance()
            .set(&DataKey::ProposalCount, &count);

        env.events()
            .publish((symbol_short!("created"), count), count);

        Ok(count)
    }

    pub fn approve_proposal(
        env: Env,
        approver: Address,
        proposal_id: u32,
    ) -> Result<(), TreasuryError> {

        approver.require_auth();

        let mut proposal: PayrollProposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(TreasuryError::ProposalNotFound)?;

        if proposal.executed {
            return Err(TreasuryError::AlreadyExecuted);
        }

        if proposal.approvers.contains(&approver) {
            return Err(TreasuryError::AlreadyApproved);
        }

        proposal.approvals += 1;
        proposal.approvers.push_back(approver.clone());

        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        env.events()
            .publish((symbol_short!("approved"), proposal_id), proposal_id);

        Ok(())
    }

    pub fn execute_proposal(
        env: Env,
        executor: Address,
        proposal_id: u32,
        token: Address, // 🛡️ FIX 2: We must tell the contract WHICH token to send
    ) -> Result<(), TreasuryError> {

        executor.require_auth();

        let mut proposal: PayrollProposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(TreasuryError::ProposalNotFound)?;

        if proposal.executed {
            return Err(TreasuryError::AlreadyExecuted);
        }

        if proposal.approvals < REQUIRED_APPROVALS {
            return Err(TreasuryError::NotEnoughApprovals);
        }

        // 🛡️ FIX 3: Actually move the money!
        let token_client = token::Client::new(&env, &token);
        let contract_address = env.current_contract_address();

        for i in 0..proposal.employees.len() {
            let employee = proposal.employees.get(i).unwrap();
            let amount = proposal.amounts.get(i).unwrap();
            // Contract sends its own funds to the employee
            token_client.transfer(&contract_address, &employee, &amount);
        }

        proposal.executed = true;

        env.storage()
            .persistent()
            .set(&DataKey::Proposal(proposal_id), &proposal);

        env.events()
            .publish((symbol_short!("executed"), proposal_id), proposal.employees.len() as u32);

        Ok(())
    }

    pub fn get_proposal(
        env: Env,
        proposal_id: u32,
    ) -> Result<PayrollProposal, TreasuryError> {
        env.storage()
            .persistent()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(TreasuryError::ProposalNotFound)
    }
}