import React, { useState, useEffect } from "react";
import Product from "../components/Product";

import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import HeadComponent from "../components/Head";

const App = () => {
  // This will fetch the users' public key (wallet address) from any wallet we support
  const { publicKey } = useWallet();
  const [products, setProducts] = useState([]);

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

  const renderItemBuyContainer = () => (
    <div className="products-container">
      {products.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );

  return (
    <div className="App">
      <HeadComponent />
      <div className="container">
        <header className="header-container">
          <p className="header">My Emoji Store</p>
          <p className="sub-text">Lets sell and buy emoji's 😳 😈</p>
        </header>

        <main>
          {/* We only render the connect button if public key doesn't exist */}
          {publicKey ? (
            <>
              "Wallet is Connected!"
              {renderItemBuyContainer()}
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
