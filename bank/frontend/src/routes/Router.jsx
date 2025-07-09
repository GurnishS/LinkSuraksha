import {Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Transactions from "../pages/Transactions";
import TransactionDetails from "../pages/TransactionDetails";
import PaymentPage from "../pages/PaymentPage";
import LinkPaymentGateway from "../pages/LinkGateway";
import Redirect from "../pages/Redirect";

function Router() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transaction/:id" element={<TransactionDetails />} />
        <Route path="/transfer" element={<PaymentPage />} />
        <Route path="/link/:customerId/:token" element={<LinkPaymentGateway />} />
        <Route path="*" element={<Redirect />} />
      </Routes>
  );
}

export default Router;