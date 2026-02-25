import { Horizon } from "@stellar/stellar-sdk";

export const server = new Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

export async function getBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find(b => b.asset_type === "native");
    return balance ? balance.balance : "0";
  } catch (error) {
    console.error("Balance fetch error:", error);
    return "0";
  }
}