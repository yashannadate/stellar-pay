import { useState, useEffect } from "react";
import { isConnected, requestAccess, setAllowed,} from "@stellar/freighter-api";

export function useWallet() {
  const [address, setAddress] = useState(null);

  const connect = async () => {
    try {
      //checking freighter extension
      const freighterDetected = await isConnected();

      if (!freighterDetected) {
        //if not found send user to the download page
        alert("Freighter Wallet not detected! Redirecting to download page.");
        window.open("https://www.freighter.app/", "_blank");
        return;
      }

      await setAllowed();
      const response = await requestAccess();

 if (response && response.address) {
        setAddress(response.address);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Please make sure your freighter wallet is unlocked and try again.");
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (await isConnected()) {
          const response = await requestAccess();
          if (response && response.address) {
            setAddress(response.address);
          }
        }
      } catch (e) {
      }
    };
    checkConnection();
  }, []);

  return { address, connect, disconnect };
}