import React, { useState, useEffect } from 'react';
import '../CSS/Cart.css'; // Make sure your CSS is updated to match
import { useLocation, useNavigate } from 'react-router-dom';

const Cart = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize cart items from location state, or an empty array
    // We use useState to allow for local modifications (e.g., quantity changes)
    const [cartItems, setCartItems] = useState(location.state?.cartItems || []);

    // Effect to update cartItems if location state changes (e.g., user navigates back to cart with new items)
    useEffect(() => {
        setCartItems(location.state?.cartItems || []);
    }, [location.state?.cartItems]);

    const getTotal = () =>
        cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleQuantityChange = (id, newQuantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, newQuantity) } // Ensure quantity is at least 1
                    : item
            )
        );
    };

    const handleRemoveItem = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const handleProceedToBuy = () => {
        const amount = getTotal();
        if (amount > 0) {
            navigate('/payment', { state: { amount, cartItems } }); // Pass cartItems to payment if needed
        } else {
            alert('Your cart is empty. Please add items before proceeding to checkout.');
        }
    };

    return (
        <div className="cart-container">
            <h1 className="cart-title">Your Cart</h1>

            {cartItems.length === 0 ? 
            (
                <div className="cart-empty-message">
                    <p>Your cart is empty.</p>
                    <button onClick={() => navigate('/')} className="cart-shop-now-button">
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items-list">
                        <div className="cart-header-row">
                            <div className="cart-header-cell product-header">Product</div>
                            <div className="cart-header-cell description-header">Description</div>
                            <div className="cart-header-cell price-header">Price</div>
                            <div className="cart-header-cell quantity-header">Quantity</div>
                            <div className="cart-header-cell subtotal-header">Subtotal</div>
                            <div className="cart-header-cell actions-header">Actions</div>
                        </div>
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item-row">
                                <div className="cart-item-cell product-info">
                                    {item.image && <img src={item.image} alt={item.name} className="cart-item-image" />}
                                    <span className="cart-item-name">{item.name}</span>
                                </div>
                                <div className="cart-item-cell cart-item-description">
                                    {item.description || 'No description available'}
                                </div>
                                <div className="cart-item-cell cart-item-price">₹{item.price.toFixed(2)}</div>
                                <div className="cart-item-cell cart-item-quantity">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="quantity-button"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                            className="quantity-input"
                                            min="1"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            className="quantity-button"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="cart-item-cell cart-item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</div>
                                <div className="cart-item-cell cart-item-actions">
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="remove-item-button"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="cart-total">
                            <strong>Total:</strong> ₹{getTotal().toFixed(2)}
                        </div>
                        <button onClick={handleProceedToBuy} className="proceed-to-buy-button">
                            Proceed to Buy
                        </button>
                    </div>
                </div>
                )}
        </div>
    );
};

export default Cart;