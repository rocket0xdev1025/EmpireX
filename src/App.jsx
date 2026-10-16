import { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import Overview from "./pages/Overview.jsx";
import Trade from "./pages/Trade.jsx";
import Borrow from "./pages/Borrow.jsx";
import Tribute from "./pages/Tribute.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import NotFound from "./pages/NotFound.jsx";

const DEMO_ADDRESS = "0x4cD00e387622C35bDDb9b4c962c136462338bC31";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [balances, setBalances] = useState({ usdg: 12500, usdc: 8420.55 });
  const [notice, setNotice] = useState("");

  const account = useMemo(
    () => ({
      wallet,
      balances,
      connect(address = DEMO_ADDRESS) {
        setWallet(address);
        setBalances({ usdg: null, usdc: null });
        setNotice("");
      },
      openConnect() {
        setWalletOpen(true);
      },
      disconnect() {
        setWallet(null);
        setNotice("");
      },
      fund(amount) {
        const value = Number(amount);
        if (!value || value <= 0) return;
        setBalances((current) => ({
          ...current,
          usdg: Math.max(0, current.usdg - value),
          usdc: current.usdc + value,
        }));
        setNotice(`Moved ${value.toLocaleString("en-US")} USDG into USDC for trading.`);
      },
    }),
    [wallet, balances],
  );

  return (
    <Shell
      account={account}
      walletOpen={walletOpen}
      setWalletOpen={setWalletOpen}
      depositOpen={depositOpen}
      setDepositOpen={setDepositOpen}
      notice={notice}
      clearNotice={() => setNotice("")}
    >
      <Routes>
        <Route path="/" element={<Overview onFund={() => setDepositOpen(true)} />} />
        <Route path="/trade" element={<Trade account={account} onFund={() => setDepositOpen(true)} />} />
        <Route path="/trade/:symbol" element={<Trade account={account} onFund={() => setDepositOpen(true)} />} />
        <Route path="/borrow" element={<Borrow account={account} />} />
        <Route path="/tribute" element={<Tribute account={account} />} />
        <Route path="/portfolio" element={<Portfolio account={account} onFund={() => setDepositOpen(true)} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}
