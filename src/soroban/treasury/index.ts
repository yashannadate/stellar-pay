import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS",
  }
} as const

export type DataKey = {tag: "Proposal", values: readonly [u32]} | {tag: "ProposalCount", values: void};

export const TreasuryError = {
  1: {message:"ProposalNotFound"},
  2: {message:"AlreadyExecuted"},
  3: {message:"NotEnoughApprovals"},
  4: {message:"MismatchedLengths"},
  5: {message:"EmptyPayroll"},
  6: {message:"AlreadyApproved"}
}


export interface PayrollProposal {
  amounts: Array<i128>;
  approvals: u32;
  approvers: Array<string>;
  employees: Array<string>;
  executed: boolean;
  proposal_id: u32;
  proposer: string;
}

export interface Client {
  /**
   * Construct and simulate a get_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proposal: ({proposal_id}: {proposal_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<PayrollProposal>>>

  /**
   * Construct and simulate a create_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_proposal: ({proposer, employees, amounts}: {proposer: string, employees: Array<string>, amounts: Array<i128>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a approve_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_proposal: ({approver, proposal_id}: {approver: string, proposal_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a execute_proposal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  execute_proposal: ({executor, proposal_id, token}: {executor: string, proposal_id: u32, token: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAACFByb3Bvc2FsAAAAAQAAAAQAAAAAAAAAAAAAAA1Qcm9wb3NhbENvdW50AAAA",
        "AAAAAAAAAAAAAAAMZ2V0X3Byb3Bvc2FsAAAAAQAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAEAAAPpAAAH0AAAAA9QYXlyb2xsUHJvcG9zYWwAAAAH0AAAAA1UcmVhc3VyeUVycm9yAAAA",
        "AAAAAAAAAAAAAAAPY3JlYXRlX3Byb3Bvc2FsAAAAAAMAAAAAAAAACHByb3Bvc2VyAAAAEwAAAAAAAAAJZW1wbG95ZWVzAAAAAAAD6gAAABMAAAAAAAAAB2Ftb3VudHMAAAAD6gAAAAsAAAABAAAD6QAAAAQAAAfQAAAADVRyZWFzdXJ5RXJyb3IAAAA=",
        "AAAABAAAAAAAAAAAAAAADVRyZWFzdXJ5RXJyb3IAAAAAAAAGAAAAAAAAABBQcm9wb3NhbE5vdEZvdW5kAAAAAQAAAAAAAAAPQWxyZWFkeUV4ZWN1dGVkAAAAAAIAAAAAAAAAEk5vdEVub3VnaEFwcHJvdmFscwAAAAAAAwAAAAAAAAARTWlzbWF0Y2hlZExlbmd0aHMAAAAAAAAEAAAAAAAAAAxFbXB0eVBheXJvbGwAAAAFAAAAAAAAAA9BbHJlYWR5QXBwcm92ZWQAAAAABg==",
        "AAAAAAAAAAAAAAAQYXBwcm92ZV9wcm9wb3NhbAAAAAIAAAAAAAAACGFwcHJvdmVyAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAEAAAPpAAAD7QAAAAAAAAfQAAAADVRyZWFzdXJ5RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAQZXhlY3V0ZV9wcm9wb3NhbAAAAAMAAAAAAAAACGV4ZWN1dG9yAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAANVHJlYXN1cnlFcnJvcgAAAA==",
        "AAAAAQAAAAAAAAAAAAAAD1BheXJvbGxQcm9wb3NhbAAAAAAHAAAAAAAAAAdhbW91bnRzAAAAA+oAAAALAAAAAAAAAAlhcHByb3ZhbHMAAAAAAAAEAAAAAAAAAAlhcHByb3ZlcnMAAAAAAAPqAAAAEwAAAAAAAAAJZW1wbG95ZWVzAAAAAAAD6gAAABMAAAAAAAAACGV4ZWN1dGVkAAAAAQAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAAAAAAIcHJvcG9zZXIAAAAT" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_proposal: this.txFromJSON<Result<PayrollProposal>>,
        create_proposal: this.txFromJSON<Result<u32>>,
        approve_proposal: this.txFromJSON<Result<void>>,
        execute_proposal: this.txFromJSON<Result<void>>
  }
}