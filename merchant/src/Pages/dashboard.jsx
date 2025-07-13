import { useState } from 'react';
import { Search, ShoppingCart, User, Heart, Star, Filter, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../CSS/dashboard.css';

const Dashboard = () => {
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCart, setShowCart] = useState(false);
    const navigate = useNavigate()

    // Hardcoded product data
    const products = [
        {
            id: 1,
            name: "Wireless Bluetooth Headphones",
            price: 2,
            originalPrice: 4999,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
            category: "Electronics",
            rating: 4.5,
            reviews: 234,
            discount: 40,
            inStock: true
        },
        {
            id: 2,
            name: "Smart Fitness Watch",
            price: 5999,
            originalPrice: 8999,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
            category: "Electronics",
            rating: 4.3,
            reviews: 189,
            discount: 33,
            inStock: true
        },
        {
            id: 3,
            name: "Premium Coffee Maker",
            price: 12999,
            originalPrice: 15999,
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
            category: "Home & Kitchen",
            rating: 4.7,
            reviews: 145,
            discount: 19,
            inStock: true
        },
        {
            id: 4,
            name: "Casual Cotton T-Shirt",
            price: 799,
            originalPrice: 1299,
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
            category: "Fashion",
            rating: 4.2,
            reviews: 312,
            discount: 38,
            inStock: true
        },
        {
            id: 5,
            name: "Gaming Mechanical Keyboard",
            price: 4599,
            originalPrice: 6999,
            image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
            category: "Electronics",
            rating: 4.6,
            reviews: 278,
            discount: 34,
            inStock: false
        },
        {
            id: 6,
            name: "Organic Face Cream",
            price: 1899,
            originalPrice: 2499,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop",
            category: "Beauty",
            rating: 4.4,
            reviews: 167,
            discount: 24,
            inStock: true
        },
        {
            id: 7,
            name: "Yoga Mat Premium",
            price: 1599,
            originalPrice: 2299,
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
            category: "Sports",
            rating: 4.5,
            reviews: 203,
            discount: 30,
            inStock: true
        },
        {
            id: 8,
            name: "Stainless Steel Water Bottle",
            price: 899,
            originalPrice: 1299,
            image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop",
            category: "Sports",
            rating: 4.3,
            reviews: 156,
            discount: 31,
            inStock: true
        }
    ];

    const categories = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports'];

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prev =>
            prev
                .map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    const toggleWishlist = (productId) => {
        setWishlistItems(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const totalCartPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="surakshakart-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h1 className="logo">SurakshaKart</h1>
                    </div>

                    <div className="search-section">
                        <div className="search-bar">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="icon-btn" title="Account">
                            <User size={20} />
                            <span className="icon-label">Account</span>
                        </button>
                        <button
                            className="icon-btn"
                            title="Wishlist"
                            onClick={() => setSelectedCategory('All')}
                        >
                            <Heart size={20} />
                            {wishlistItems.length > 0 && <span className="badge">{wishlistItems.length}</span>}
                            <span className="icon-label">Wishlist</span>
                        </button>
                        <button
                            className="icon-btn"
                            title="Cart"
                            onClick={() => navigate('/Cart', { state: { cartItems } })}
                        >
                            <ShoppingCart size={20} />
                            {totalCartItems > 0 && <span className="badge">{totalCartItems}</span>}
                            <span className="icon-label">Cart</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <div className="mobile-categories">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`mobile-category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h2 className="hero-title">Welcome to SurakshaKart</h2>
                    <p className="hero-subtitle">Your trusted marketplace for quality products</p>
                    <button className="cta-button" onClick={() => setSelectedCategory('All')}>Shop Now</button>
                </div>
            </section>

            {/* Main Content */}
            <main className="main-content">
                {/* Filters */}
                <div className="filters-section">
                    <div className="categories-filter">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="filter-actions">
                        <button className="filter-btn" title="Filters">
                            <Filter size={16} />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="products-section">
                    <div className="section-header">
                        <h3>Featured Products</h3>
                        <p>{filteredProducts.length} products found</p>
                    </div>

                    <div className="products-grid">
                        {filteredProducts.length === 0 ? (
                            <div className="no-products">No products found.</div>
                        ) : (
                            filteredProducts.map(product => (
                                <div key={product.id} className="product-card">
                                    <div className="product-image-container">
                                        <img src={product.image} alt={product.name} className="product-image" />
                                        {product.discount > 0 && (
                                            <span className="discount-badge">{product.discount}% OFF</span>
                                        )}
                                        <button
                                            className={`wishlist-btn ${wishlistItems.includes(product.id) ? 'active' : ''}`}
                                            onClick={() => toggleWishlist(product.id)}
                                            title={wishlistItems.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                        >
                                            <Heart size={16} />
                                        </button>
                                        {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
                                    </div>

                                    <div className="product-info">
                                        <h4 className="product-name">{product.name}</h4>
                                        <div className="product-rating">
                                            <div className="stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
                                                    />
                                                ))}
                                            </div>
                                            <span className="rating-text">({product.reviews})</span>
                                        </div>

                                        <div className="product-pricing">
                                            <span className="current-price">₹{product.price.toLocaleString()}</span>
                                            {product.originalPrice > product.price && (
                                                <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                                            )}
                                        </div>

                                        <button
                                            className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                                            onClick={() => product.inStock && addToCart(product)}
                                            disabled={!product.inStock}
                                        >
                                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Cart Section (toggleable) */}
                {showCart && (
                    <div className="cart-preview">
                        <h3>🛒 Cart Preview</h3>
                        {cartItems.length === 0 ? (
                            <p>Your cart is empty</p>
                        ) : (
                            <>
                                <ul>
                                    {cartItems.map(item => (
                                        <li key={item.id}>
                                            {item.name} - Qty: {item.quantity} - ₹{item.price} each
                                            <button
                                                className="remove-cart-btn"
                                                onClick={() => removeFromCart(item.id)}
                                                title="Remove one"
                                            >-</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="cart-total">
                                    <strong>Total: ₹{totalCartPrice.toLocaleString()}</strong>
                                </div>
                            </>
                        )}
                        <button className="close-cart-btn" onClick={() => setShowCart(false)}>Close</button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h5>About SurakshaKart</h5>
                        <p>Your trusted online marketplace for quality products with secure shopping experience.</p>
                    </div>
                    <div className="footer-section">
                        <h5>Quick Links</h5>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#help">Help Center</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>Categories</h5>
                        <ul>
                            <li><a href="#electronics">Electronics</a></li>
                            <li><a href="#fashion">Fashion</a></li>
                            <li><a href="#home">Home & Kitchen</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>Connect</h5>
                        <p>Follow us on social media for latest updates and offers.</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 SurakshaKart. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;