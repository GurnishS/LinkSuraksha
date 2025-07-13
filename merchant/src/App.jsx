import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Payment from './Pages/payment.jsx';
import Cart from './Pages/Cart.jsx';
import Dashboard from './Pages/dashboard.jsx';

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path='/' element={<Home />} /> */}
        <Route path='/payment' element={<Payment />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/' element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}