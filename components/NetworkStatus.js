import React from "react";
import { areWeOnDevnet } from "../lib/util";

const NetworkStatus = () => {
  return (
    <button className="network-status">
      {areWeOnDevnet() ? "Devnet" : "Mainnet"}
    </button>
  )
} 

export default NetworkStatus;