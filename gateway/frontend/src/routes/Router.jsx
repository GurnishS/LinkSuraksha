import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/Login";
import Transactions from "../pages/Transactions";
import ManageAccounts from "../pages/ManageAccounts";
import TransferPage from "../pages/TransferPage";
import MerchantTransferPage from "../pages/MerchantTransferPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/manage-accounts" element={<ManageAccounts />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/transfer/:receiverId" element={<TransferPage />} />
        <Route path="/merchant/:transactionId" element={<MerchantTransferPage />} />

      </Routes>
    </Router>
  );
};

export default AppRouter;