import { useState, useEffect } from "react";
import { StellarWalletsKit, WalletNetwork, allowAllModules, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit";

export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: allowAllModules(),
});

export function useWallet() {
  const [address, setAddress] = useState(null);

  const connect = async () => {
    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          setAddress(address);
        },
      });
    } catch (error) {
      console.error("Connection cancelled:", error);
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  // 🛡️ SENSITIVITY FIX: Auto-detects if the user switches accounts in their wallet!
  useEffect(() => {
    let interval;
    if (address) {
      interval = setInterval(async () => {
        try {
          const response = await kit.getAddress();
          // If the wallet returns a new address, update the state instantly
          if (response && response.address && response.address !== address) {
            setAddress(response.address);
          }
        } catch (error) {
          // Fail silently if wallet is locked or unavailable
        }
      }, 2000); // Checks quietly every 2 seconds
    }
    return () => clearInterval(interval);
  }, [address]);

  return { address, connect, disconnect };
}