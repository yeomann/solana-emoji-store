import React, { useState, useMemo, useEffect } from "react";
import { Keypair, Transaction } from "@solana/web3.js";
import { findReference, FindReferenceError } from "@solana/pay";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { InfinitySpin } from "react-loader-spinner";
import IPFSDownload from "./IpfsDownload";
import { addOrder, hasPurchased, fetchItem } from "../lib/api";

const STATUS = {
  Initial: "Initial",
  Submitted: "Submitted",
  Paid: "Paid",
};

export default function Buy({ itemID }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Public key used to identify the order

  // const [paid, setPaid] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state of all above
  const [status, setStatus] = useState(STATUS.Initial); // Tracking transaction status
  const [item, setItem] = useState(null); // IPFS hash & filename of the purchased item

  // useMemo is a React hook that only computes the value if the dependencies change
  const order = useMemo(
    () => ({
      buyer: publicKey.toString(),
      orderID: orderID.toString(),
      itemID: itemID,
    }),
    [publicKey, orderID, itemID]
  );

  // Fetch the transaction object from the server
  const processTransaction = async (type) => {
    setLoading(true);
    const txResponse = await fetch("../api/createTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...order, transactionType: type }),
    });
    const txData = await txResponse.json();

    // We create a transaction object
    const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
    console.log("Tx data is", tx);

    // Attempt to send the transaction to the network
    try {
      // Send the transaction to the network
      const txHash = await sendTransaction(tx, connection);
      console.log(
        `Transaction sent: https://solscan.io/tx/${txHash}?cluster=devnet`
      );
      setStatus(STATUS.Submitted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if this address already has already purchased this item
    // If so, fetch the item and set paid to true
    // Async function to avoid blocking the UI
    async function checkPurchased() {
      const purchased = await hasPurchased(publicKey, itemID);
      if (purchased) {
        setStatus(STATUS.Paid);
        console.log("Address has already purchased this item!");
        const item = await fetchItem(itemID);
        setItem(item);
      }
    }
    checkPurchased();
  }, [publicKey, itemID]);

  useEffect(() => {
    console.log("%c status [useEffect]", "background: red; color:white");
    console.log("status=", status);
    // Check if transaction was confirmed
    if (status === STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        console.log(
          "interval running for finding reference of orderID=",
          orderID
        );
        try {
          // Look for our orderID on the blockchain
          const result = await findReference(connection, orderID);
          console.log("Finding tx reference", result.confirmationStatus);

          // If the transaction is confirmed or finalized, the payment was successful!
          if (
            result.confirmationStatus === "confirmed" ||
            result.confirmationStatus === "finalized"
          ) {
            clearInterval(interval);
            setStatus(STATUS.Paid);
            setLoading(false);
            console.log("Adding order");
            addOrder(order);
            alert("Thank you for your purchase!");
          }
        } catch (e) {
          if (e instanceof FindReferenceError) {
            return null;
          }
          console.error("Unknown error", e);
        } finally {
          setLoading(false);
        }
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }

    async function getItem(itemID) {
      const item = await fetchItem(itemID);
      setItem(item);
    }

    if (status === STATUS.Paid) {
      getItem(itemID);
    }
  }, [status]);

  if (!publicKey) {
    return (
      <div>
        <p>You need to connect your wallet to make transactions</p>
      </div>
    );
  }

  if (loading) {
    return <InfinitySpin color="gray" />;
  }


  return (
    <div>
      {/* Display either buy button or IPFSDownload component based on if Hash exists */}
      {item ? (
        <IPFSDownload hash={item.hash} filename={item.filename} />
      ) : (
        <button disabled={loading} className="buy-button" onClick={processTransaction}>
          Buy now 🠚
        </button>
      )}
    </div>
  );

  return (
    <div>
      {paid ? (
        <IPFSDownload
          filename="emojis.zip"
          hash="QmWWH69mTL66r3H8P4wUn24t1L5pvdTJGUTKBqT11KCHS5"
          cta="Download emojis"
        />
      ) : (
        <div style={{ display: "flex" }}>
          <button
            disabled={loading}
            className="buy-button"
            onClick={() => processTransaction("sol")}
          >
            Buy now - SOL
          </button>
          <button
            disabled={loading}
            className="buy-button"
            onClick={() => processTransaction("usdc")}
          >
            Buy now - USDC
          </button>
        </div>
      )}
    </div>
  );
}
