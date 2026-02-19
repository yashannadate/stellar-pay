import { Horizon, TransactionBuilder, Operation, Asset, Networks, BASE_FEE,} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

// Connection
export const server = new Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

export async function getBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const balance = account.balances.find(
      (b) => b.asset_type === "native"
    );
    return balance ? balance.balance : "0";
  } catch (error) {
    // returns 0 if account is inactive / network fails
    console.error("Balance fetch error:", error);
    return "0";
  }
}

export async function sendPayment(sender, destination, amount) {
  //address
  if (!destination.startsWith("G") || destination.length !== 56) {
    throw new Error("Invalid Destination Address");
  }

  // positive amount
  if (Number(amount) <= 0) {
    throw new Error("Invalid Amount");
  }

  const account = await server.loadAccount(sender);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: Number(amount).toFixed(7),
      })
    )
    .setTimeout(30)
    .build();
  
let signed;

try {
  signed = await signTransaction(transaction.toXDR(), {
 networkPassphrase: Networks.TESTNET,
 });

 if (!signed?.signedTxXdr) {
 throw new Error();
}

} catch (error) {
throw new Error("Transaction cancelled by user ");
}

const tx = TransactionBuilder.fromXDR(
signed.signedTxXdr,
Networks.TESTNET
);

  return await server.submitTransaction(tx);
}