import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";

import Product from "../components/Product";
import HeadComponent from "../components/Head";
import CreateProduct from "../components/CreateProduct";
import NetworkStatus from "../components/NetworkStatus";

const App = () => {
  // This will fetch the users' public key (wallet address) from any wallet we support
  const { publicKey } = useWallet();
  const [products, setProducts] = useState([]);
  const isOwner = publicKey
    ? publicKey.toString() === process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY
    : false;
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetch(`/api/fetchProducts`)
        .then((response) => response.json())
        .then((data) => {
          setProducts(data);
          console.log("Products", data);
        });
    }
  }, [publicKey]);

  const renderNotConnectedContainer = () => (
    <div>
      <img
        src="https://c.tenor.com/NLHYdGDUr0AAAAAC/solana-sol.gif"
        alt="emoji"
      />

      <div className="button-container">
        <WalletMultiButton className="cta-button connect-wallet-button" />
      </div>
    </div>
  );

  return (
    <div className="App">
      <HeadComponent />
      <NetworkStatus />
      <div className="container">
        <header className="header-container">
          <p className="header">My Emoji Store</p>
          <p className="sub-text">Lets sell and buy emoji's 😳 😈</p>
        </header>

        <main>
          {/* We only render the connect button if public key doesn't exist */}
          {publicKey ? (
            <>
              <div className="wallet-connected-container">
                <p className="wallet-connected">Wallet is Connected!</p>
                <WalletDisconnectButton />  
              </div>
              {isOwner && (
                <button
                  className="create-product-button"
                  onClick={() => setCreating(!creating)}
                >
                  {creating ? "Close" : "Create Product"}
                </button>
              )}
              {creating && <CreateProduct />}
              <div className="products-container">
                {products.map((product) => (
                  <Product key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            renderNotConnectedContainer()
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
