
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth, useCart } from './contexts';
// Fix: Import PRODUCT_CATEGORIES and PRODUCT_UNITS from './constants' instead of './types'
import { Product, User, UserRole, Order, OrderStatus, PaymentMethod, CartItem, FarmerRequest } from './types';
import { ROUTES, APP_NAME, PRODUCT_CATEGORIES, PRODUCT_UNITS } from './constants';
import { 
  Button, Input, Select, Textarea, ProductCard, CartItemRow, LoadingSpinner, Modal, DashboardCard, EmptyState, Pagination, Alert,
  ShoppingCartIcon, UserIcon, PlusIcon, MinusIcon, TrashIcon 
} from './components';
import { 
  mockFetchProducts, mockFetchProductById, mockPlaceOrder, mockFetchOrders, mockFetchOrderById,
  mockAddProduct, mockUpdateProduct, mockDeleteProduct, mockUpdateOrderStatus,
  mockFetchAllUsers, mockFetchFarmerRequests, mockUpdateFarmerRequestStatus,
  mockAdminUpdateProduct, mockAdminDeleteProduct
} from './services';


export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const { products } = await mockFetchProducts({page: 1, limit: 4}); // Fetch 4 products for featured section
        setFeaturedProducts(products.filter(p => p.isAvailable && p.quantity > 0));
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-light via-green-200 to-yellow-100 py-16 md:py-24 rounded-lg shadow-lg mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-dark mb-4">Welcome to {APP_NAME}!</h1>
          <p className="text-lg md:text-xl text-neutral-dark mb-8">Fresh produce directly from farms to your doorstep. Support local farmers, eat healthy.</p>
          <div className="space-x-4">
            <Link to={ROUTES.PRODUCTS}>
              <Button size="lg" variant="primary">Shop Fresh Produce</Button>
            </Link>
            {!currentUser || currentUser.role !== UserRole.FARMER && (
               <Link to={currentUser ? (currentUser.role === UserRole.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.REGISTER) : ROUTES.REGISTER}>
                 <Button size="lg" variant="outline">
                   {currentUser && currentUser.role === UserRole.ADMIN ? "Admin Panel" : "Sell Your Produce"}
                 </Button>
               </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Featured Products</h2>
        {loading ? <LoadingSpinner /> : (
          featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} userRole={currentUser?.role} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No featured products available at the moment. Check back soon!</p>
          )
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10 text-center">How It Works</h2>
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border border-gray-200 rounded-lg">
            <div className="text-primary text-4xl mb-4">🧑‍🌾</div>
            <h3 className="text-xl font-semibold mb-2">Farmers List Produce</h3>
            <p className="text-gray-600">Farmers register and list their fresh fruits, vegetables, and other farm products with details.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
             <div className="text-primary text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">Customers Shop</h3>
            <p className="text-gray-600">You browse the available produce, add items to your cart, and place an order securely.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
             <div className="text-primary text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Direct Delivery</h3>
            <p className="text-gray-600">We ensure fresh produce is delivered from the farm to your home, minimizing middlemen.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser) {
      // Fix: Type cast location.state to access 'from' property safely
      const fromState = location.state as { from?: { pathname: string } } | null;
      const from = fromState?.from?.pathname || (
        currentUser.role === UserRole.ADMIN ? ROUTES.ADMIN_DASHBOARD :
        currentUser.role === UserRole.FARMER ? ROUTES.FARMER_DASHBOARD :
        ROUTES.PRODUCTS
      );
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location.state]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation is handled by useEffect
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-primary text-center mb-6">Login to {APP_NAME}</h2>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p className="text-center mt-4 text-sm text-gray-600">
        Don't have an account? <Link to={ROUTES.REGISTER} className="text-primary hover:underline">Register here</Link>
      </p>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

 useEffect(() => {
    if (currentUser) {
      // Fix: Type cast location.state to access 'from' property safely
      const fromState = location.state as { from?: { pathname: string } } | null;
      const from = fromState?.from?.pathname || (
        currentUser.role === UserRole.ADMIN ? ROUTES.ADMIN_DASHBOARD :
        currentUser.role === UserRole.FARMER ? ROUTES.FARMER_DASHBOARD :
        ROUTES.PRODUCTS
      );
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const registeredUser = await register({ name, email, password, role, address, phone });
      if (registeredUser) {
        if (role === UserRole.FARMER) {
          setSuccessMessage("Registration successful! Your farmer account is pending admin approval. You will be notified once approved.");
          // Don't navigate immediately for farmer, let them see the message
          setTimeout(() => navigate(ROUTES.LOGIN), 5000); // Or navigate to a pending approval page
        } else {
          setSuccessMessage("Registration successful! You are now logged in.");
           // Navigation will be handled by useEffect
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-primary text-center mb-6">Register for {APP_NAME}</h2>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMessage && <Alert type="success" message={successMessage} />}
      <form onSubmit={handleSubmit}>
        <Input label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <Select
            label="Register as"
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
            options={[
                { value: UserRole.CUSTOMER, label: 'Customer' },
                { value: UserRole.FARMER, label: 'Farmer' },
            ]}
            required
        />
        {role === UserRole.FARMER && (
          <>
            <Textarea label="Farm Address (or Primary Address)" value={address} onChange={e => setAddress(e.target.value)} required />
            <Input label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
            <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded-md my-2">Note: Farmer accounts require admin approval after registration before you can list products.</p>
          </>
        )}
         {role === UserRole.CUSTOMER && (
          <>
            <Textarea label="Shipping Address" value={address} onChange={e => setAddress(e.target.value)} />
            <Input label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </>
        )}
        <Button type="submit" className="w-full mt-4" isLoading={isLoading} disabled={isLoading || !!successMessage}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      <p className="text-center mt-4 text-sm text-gray-600">
        Already have an account? <Link to={ROUTES.LOGIN} className="text-primary hover:underline">Login here</Link>
      </p>
    </div>
  );
};


export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const limit = 8; // Products per page

  const fetchProductsList = useCallback(async (page: number, category: string, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const { products: fetchedProducts, total } = await mockFetchProducts({ 
        page, 
        limit, 
        category: category || undefined, 
        searchTerm: search || undefined 
      });
      setProducts(fetchedProducts);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      setError("Failed to fetch products. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsList(currentPage, selectedCategory, searchTerm);
  }, [currentPage, selectedCategory, searchTerm, fetchProductsList]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    // useEffect will trigger fetch
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Browse Our Fresh Produce</h1>
      
      <div className="mb-6 p-4 bg-white shadow rounded-lg md:flex md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex-grow md:mr-4 mb-4 md:mb-0">
          <Input 
            type="search" 
            placeholder="Search for products (e.g., tomatoes, apples)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            wrapperClassName="mb-0"
            className="h-11"
          />
          {/* Hidden submit button for form submission on enter, or explicit button */}
          {/* <Button type="submit" className="hidden">Search</Button> */}
        </form>
        <Select
          options={[{ value: '', label: 'All Categories' }, ...PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))]}
          value={selectedCategory}
          onChange={(e) => {setSelectedCategory(e.target.value); setCurrentPage(1);}}
          wrapperClassName="mb-0 md:w-64"
          className="h-11"
          placeholder="All Categories" // Added placeholder text for better UX, consistent with options
        />
      </div>

      {loading && <LoadingSpinner />}
      {error && <Alert type="error" message={error} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState 
          title="No Products Found" 
          message="We couldn't find any products matching your criteria. Try adjusting your filters or check back later!"
          icon={<ShoppingCartIcon className="w-12 h-12 text-primary"/>}
        />
      )}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} userRole={currentUser?.role} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};


export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProduct = await mockFetchProductById(id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError("Product not found.");
          // navigate(ROUTES.NOT_FOUND, { replace: true }); // Alternative
        }
      } catch (err) {
        setError("Failed to fetch product details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product && currentUser?.role === UserRole.CUSTOMER) {
      addToCart(product, quantity);
      // Consider adding a toast notification here
      alert(`${quantity} ${product.name}(s) added to cart!`);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error} />;
  if (!product) return <EmptyState title="Product Not Found" message="The product you are looking for does not exist or may have been removed." />;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img 
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/400`} 
            alt={product.name} 
            className="w-full h-auto max-h-[500px] object-contain rounded-lg border border-gray-200"
          />
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-3">Category: {product.category}</p>
          <p className="text-sm text-gray-500 mb-4">Sold by: {product.farmerName}</p>
          
          <p className="text-3xl font-bold text-primary mb-4">₹{product.price.toFixed(2)} <span className="text-lg text-gray-600 font-normal">/ {product.unit}</span></p>
          
          <p className={`text-lg mb-4 ${product.isAvailable && product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.isAvailable && product.quantity > 0 ? `In Stock: ${product.quantity} ${product.unit}` : 'Currently Out of Stock'}
          </p>

          <div className="prose max-w-none text-gray-700 mb-6">
            <h3 className="text-xl font-semibold mb-1">Description</h3>
            <p>{product.description}</p>
          </div>
          
          {currentUser?.role === UserRole.CUSTOMER && product.isAvailable && product.quantity > 0 && (
            <div className="flex items-center space-x-4 mt-6">
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button variant="ghost" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <MinusIcon className="w-5 h-5" />
                </Button>
                <input 
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.quantity)))}
                  className="w-16 text-center border-l border-r border-gray-300 text-lg py-1.5"
                  min="1"
                  max={product.quantity}
                />
                <Button variant="ghost" onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))} aria-label="Increase quantity">
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </div>
              <Button size="lg" onClick={handleAddToCart} disabled={quantity > product.quantity}>
                <ShoppingCartIcon className="w-5 h-5 mr-2" /> Add to Cart
              </Button>
            </div>
          )}
          {currentUser?.role === UserRole.FARMER && product.farmerId === currentUser.id && (
             <Link to={`/farmer/products/edit/${product.id}`}>
                <Button size="lg" variant="outline" className="mt-6">Edit This Product</Button>
             </Link>
          )}
        </div>
      </div>
    </div>
  );
};


export const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <EmptyState 
        title="Your Cart is Empty" 
        message="Looks like you haven't added any products to your cart yet. Start browsing to find fresh produce!"
        actionText="Browse Products"
        onActionClick={() => navigate(ROUTES.PRODUCTS)}
        icon={<ShoppingCartIcon className="w-16 h-16 text-primary" />}
      />
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Shopping Cart</h1>
      <div className="mb-6">
        {cartItems.map(item => (
          <CartItemRow 
            key={item.product.id} 
            item={item} 
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
          />
        ))}
      </div>
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-lg text-gray-600">Subtotal:</p>
          <p className="text-xl font-semibold text-gray-800">₹{getCartTotal().toFixed(2)}</p>
        </div>
        <p className="text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" onClick={clearCart} className="w-full sm:w-auto">
            <TrashIcon className="w-5 h-5 mr-2" /> Clear Cart
          </Button>
          <Button onClick={() => navigate(ROUTES.CHECKOUT)} className="w-full sm:w-auto" size="lg">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: ROUTES.CHECKOUT } } });
    }
    if (cartItems.length === 0 && currentUser) {
      navigate(ROUTES.PRODUCTS);
    }
  }, [currentUser, cartItems, navigate]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError("Shipping address is required.");
      return;
    }
     if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    setError('');
    setIsLoading(true);

    if (!currentUser) {
        setError("User not logged in.");
        setIsLoading(false);
        return;
    }

    try {
      const orderData: Omit<Order, 'id' | 'orderDate' | 'userName'> = {
        userId: currentUser.id,
        items: cartItems,
        totalAmount: getCartTotal(),
        status: OrderStatus.PENDING,
        paymentMethod,
        shippingAddress,
      };
      const newOrder = await mockPlaceOrder(orderData, currentUser);
      clearCart();
      navigate(`${ROUTES.ORDER_CONFIRMATION.replace(':orderId', newOrder.id)}`);
    } catch (err) {
      setError((err as Error).message || "Failed to place order. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return <LoadingSpinner message="Redirecting to login..." />;
  if (cartItems.length === 0) return <LoadingSpinner message="Your cart is empty. Redirecting..." />;


  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmitOrder} className="grid md:grid-cols-2 gap-8">
        {/* Shipping Details */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Shipping Details</h2>
          <Textarea 
            label="Shipping Address" 
            value={shippingAddress} 
            onChange={e => setShippingAddress(e.target.value)} 
            required 
            rows={3}
          />
          <Input 
            label="Phone Number" 
            type="tel"
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            required 
          />
          {/* Add more fields like name, city, pincode if needed */}
        </div>

        {/* Order Summary & Payment */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
            {cartItems.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} (x{item.quantity})</span>
                <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 mb-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-3">Payment Method</h2>
          <Select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
            options={[
              { value: PaymentMethod.COD, label: 'Cash on Delivery (COD)' },
              { value: PaymentMethod.UPI, label: 'UPI (Simulated)' },
              { value: PaymentMethod.CARD, label: 'Credit/Debit Card (Simulated)' },
            ]}
            wrapperClassName="mb-6"
          />
           {paymentMethod !== PaymentMethod.COD && (
            <p className="text-sm text-amber-600 bg-amber-100 p-3 rounded-md mb-4">
              Note: Online payment methods are simulated for this demo. No actual payment will be processed.
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Placing Order...' : `Place Order (Pay ₹${getCartTotal().toFixed(2)})`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      navigate(ROUTES.HOME); // Or an error page
      return;
    }
    const fetchOrder = async () => {
      try {
        const fetchedOrder = await mockFetchOrderById(orderId);
        setOrder(fetchedOrder);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!order) return <Alert type="error" message="Order not found or there was an error retrieving your order details." />;

  return (
    <div className="max-w-2xl mx-auto text-center bg-white shadow-lg rounded-lg p-8">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
        <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Thank You For Your Order!</h1>
      <p className="text-gray-600 mb-1">Your order <strong className="text-primary">#{order.id.substring(0,8)}</strong> has been placed successfully.</p>
      <p className="text-gray-600 mb-6">We've sent a confirmation email to your registered address (simulated).</p>
      
      <div className="text-left border border-gray-200 rounded-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Order Summary:</h2>
        <p><strong>Order ID:</strong> #{order.id.substring(0,8)}</p>
        <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
        <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
          order.status === OrderStatus.PROCESSING ? 'bg-blue-100 text-blue-800' :
          order.status === OrderStatus.SHIPPED ? 'bg-indigo-100 text-indigo-800' :
          order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'}`}>{order.status}</span></p>
      </div>

      <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
        <Link to={ROUTES.ORDER_HISTORY}>
          <Button variant="outline">View Order History</Button>
        </Link>
        <Link to={ROUTES.PRODUCTS}>
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
};

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 5; // Orders per page


  const fetchUserOrders = useCallback(async (page: number) => {
    if (!currentUser) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setLoading(true);
    try {
      const {orders: fetchedOrders, total} = await mockFetchOrders({ userId: currentUser.id, page, limit });
      setOrders(fetchedOrders);
      setTotalPages(Math.ceil(total/limit));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchUserOrders(currentPage);
  }, [currentUser, currentPage, fetchUserOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Order History</h1>
      {orders.length === 0 ? (
        <EmptyState 
          title="No Orders Yet" 
          message="You haven't placed any orders. Start shopping to see your orders here."
          actionText="Start Shopping"
          onActionClick={() => navigate(ROUTES.PRODUCTS)}
          icon={<ShoppingCartIcon className="w-16 h-16 text-primary" />}
        />
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">Order #{order.id.substring(0, 8)}</h2>
                  <p className="text-sm text-gray-500">Placed on: {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <p className="text-lg font-semibold mt-2 sm:mt-0">Total: ₹{order.totalAmount.toFixed(2)}</p>
              </div>
              <p className="text-sm mb-1"><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === OrderStatus.PROCESSING ? 'bg-blue-100 text-blue-800' :
                  order.status === OrderStatus.SHIPPED ? 'bg-indigo-100 text-indigo-800' :
                  order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'}`}>{order.status}</span>
              </p>
              <p className="text-sm mb-3"><strong>Items:</strong> {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              <div className="max-h-32 overflow-y-auto text-sm mb-3 pr-2">
                {order.items.map(item => (
                  <div key={item.product.id} className="flex justify-between py-0.5">
                    <span>{item.product.name} (x{item.quantity})</span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Link to={`${ROUTES.ORDER_HISTORY}/${order.id}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </div>
          ))}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

// Placeholder for OrderDetailsPage (Can be expanded similar to OrderConfirmationPage but for existing orders)
export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId || !currentUser) {
      navigate(ROUTES.HOME); 
      return;
    }
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const fetchedOrder = await mockFetchOrderById(orderId);
        if (fetchedOrder && (fetchedOrder.userId === currentUser.id || currentUser.role === UserRole.ADMIN || (currentUser.role === UserRole.FARMER && fetchedOrder.items.some(item => item.product.farmerId === currentUser.id)))) {
          setOrder(fetchedOrder);
        } else {
          setOrder(null); // Or throw error for unauthorized
          navigate(ROUTES.ORDER_HISTORY); // Redirect if not authorized
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, currentUser, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!order) return <Alert type="error" message="Order not found or you do not have permission to view this order." />;
  
  const canUpdateStatus = currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.FARMER && order.items.some(item => item.product.farmerId === currentUser.id));

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!canUpdateStatus || !currentUser) return;
    try {
      setLoading(true);
      const updatedOrder = await mockUpdateOrderStatus(order.id, newStatus, currentUser.role);
      setOrder(updatedOrder);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Details</h1>
      <p className="text-primary font-semibold mb-6">Order #{order.id.substring(0, 8)}</p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-lg mb-1">Customer Details:</h3>
          <p><strong>Name:</strong> {order.userName}</p>
          <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Order Information:</h3>
          <p><strong>Date Placed:</strong> {new Date(order.orderDate).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === OrderStatus.PROCESSING ? 'bg-blue-100 text-blue-800' :
                  order.status === OrderStatus.SHIPPED ? 'bg-indigo-100 text-indigo-800' :
                  order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'}`}>{order.status}</span>
          </p>
          {order.deliveryDate && <p><strong>Delivered On:</strong> {new Date(order.deliveryDate).toLocaleString()}</p>}
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-2">Items Ordered:</h3>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items.map(item => (
              <tr key={item.product.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.product.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.product.farmerName}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{item.product.price.toFixed(2)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{(item.product.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-right mb-6">
        <p className="text-xl font-semibold text-gray-800">Order Total: ₹{order.totalAmount.toFixed(2)}</p>
      </div>
      
      {/* Status Update Section for Admin/Farmer */}
      {canUpdateStatus && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
        <div className="mt-6 p-4 border-t">
          <h3 className="text-lg font-semibold mb-3">Update Order Status:</h3>
          <div className="flex space-x-2">
            {Object.values(OrderStatus)
              .filter(status => {
                 // Farmers can only move to Processing or Shipped. Admin can do more.
                 if (currentUser?.role === UserRole.FARMER) {
                     return status === OrderStatus.PROCESSING || status === OrderStatus.SHIPPED;
                 }
                 return true; // Admin can set to any status
              })
              .filter(status => status !== order.status) // Don't show current status as an option
              .map(status => (
              <Button 
                key={status} 
                onClick={() => handleStatusUpdate(status)}
                variant={status === OrderStatus.CANCELLED ? "danger" : "secondary"}
                isLoading={loading}
              >
                Mark as {status}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button onClick={() => navigate(-1)} variant="outline">Back to Previous Page</Button>
      </div>
    </div>
  );
};


export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8">Oops! The page you're looking for doesn't exist or has been moved.</p>
      <Link to={ROUTES.HOME}>
        <Button size="lg">Go to Homepage</Button>
      </Link>
    </div>
  );
};

// Farmer Section
// Fix: Export FarmerDashboardPage
export const FarmerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ products: 0, sales: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || currentUser.role !== UserRole.FARMER) return;
      setLoading(true);
      try {
        // Check farmer approval status
        const requests = await mockFetchFarmerRequests({page:1, limit: 1000}); // get all for now
        const farmerReq = requests.requests.find(req => req.farmerId === currentUser.id);
        
        const initialFarmer = (JSON.parse(localStorage.getItem('kissanBazzarUsers') || '[]') as User[]).find(u => u.email === 'farmer@kissan.com');
        const isInitialSeededFarmer = initialFarmer && initialFarmer.id === currentUser.id;

        if (isInitialSeededFarmer || (farmerReq && farmerReq.status === 'Approved')) {
          setIsApproved(true);
          const { products: farmerProducts } = await mockFetchProducts({ farmerId: currentUser.id, limit: 1000 }); // Get all products by farmer
          const { orders: farmerOrders } = await mockFetchOrders({ farmerId: currentUser.id, limit: 1000 }); // Get all orders for farmer
          
          setStats({
            products: farmerProducts.length,
            sales: farmerOrders.filter(o => o.status === OrderStatus.DELIVERED).reduce((sum, o) => sum + o.totalAmount, 0),
            pendingOrders: farmerOrders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.PROCESSING).length
          });
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error("Error fetching farmer dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [currentUser]);

  if (loading) return <LoadingSpinner />;
  if (!currentUser || currentUser.role !== UserRole.FARMER) return <NavigateToLogin />;


  if (!isApproved) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">Account Pending Approval</h1>
        <p className="text-gray-700 mb-4">
          Your farmer account is currently pending review by our admin team. 
          You will be notified once your account is approved.
        </p>
        <p className="text-gray-600">
          After approval, you will be able to list your products and manage your sales.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Farmer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Total Products Listed" value={stats.products} icon={<ShoppingCartIcon className="w-8 h-8" />} linkTo={ROUTES.FARMER_PRODUCTS} />
        <DashboardCard title="Total Sales (Delivered)" value={`₹${stats.sales.toFixed(2)}`} icon={<UserIcon className="w-8 h-8" />} linkTo={ROUTES.FARMER_ORDERS} />
        <DashboardCard title="Pending Orders" value={stats.pendingOrders} icon={<UserIcon className="w-8 h-8" />} linkTo={ROUTES.FARMER_ORDERS} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to={ROUTES.FARMER_ADD_PRODUCT}><Button className="w-full" variant="primary">Add New Product</Button></Link>
            <Link to={ROUTES.FARMER_PRODUCTS}><Button className="w-full" variant="outline">Manage My Products</Button></Link>
            <Link to={ROUTES.FARMER_ORDERS}><Button className="w-full" variant="outline">View Received Orders</Button></Link>
          </div>
        </div>
        {/* Could add recent orders or product performance charts here */}
         <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tips for Selling</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Use clear, high-quality images of your produce.</li>
                <li>Write detailed and accurate descriptions.</li>
                <li>Price your items competitively.</li>
                <li>Keep your stock quantity updated.</li>
                <li>Respond to orders promptly.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

// Fix: Export FarmerProductsPage
export const FarmerProductsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 6; // Products per page

  const fetchFarmerProducts = useCallback(async (page:number) => {
    if (!currentUser || currentUser.role !== UserRole.FARMER) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setLoading(true);
    try {
      const {products: fetchedProducts, total} = await mockFetchProducts({ farmerId: currentUser.id, page, limit });
      setProducts(fetchedProducts);
      setTotalPages(Math.ceil(total/limit));
    } catch (error) {
      console.error("Error fetching farmer products:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchFarmerProducts(currentPage);
  }, [currentUser, currentPage, fetchFarmerProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingSpinner />;
  if (!currentUser || currentUser.role !== UserRole.FARMER) return <NavigateToLogin />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
        <Link to={ROUTES.FARMER_ADD_PRODUCT}>
          <Button variant="primary"><PlusIcon className="w-5 h-5 mr-2" /> Add New Product</Button>
        </Link>
      </div>
      {products.length === 0 ? (
         <EmptyState 
          title="No Products Listed Yet" 
          message="You haven't added any products. Start by adding your fresh produce to reach customers!"
          actionText="Add Your First Product"
          onActionClick={() => navigate(ROUTES.FARMER_ADD_PRODUCT)}
          icon={<ShoppingCartIcon className="w-16 h-16 text-primary" />}
        />
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} userRole={currentUser.role} />
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

// Fix: Export AddEditProductPage
export const AddEditProductPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id: productId } = useParams<{ id?: string }>(); // For editing
  const isEditing = !!productId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState(PRODUCT_UNITS[0]);
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState(''); // Placeholder for image upload
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(isEditing); // For fetching product data

  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.FARMER) {
      navigate(ROUTES.LOGIN);
    }
    if (isEditing && productId) {
      const fetchProductData = async () => {
        try {
          const product = await mockFetchProductById(productId);
          if (product && product.farmerId === currentUser?.id) {
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price);
            setQuantity(product.quantity);
            setUnit(product.unit);
            setCategory(product.category);
            setImageUrl(product.imageUrl);
            setIsAvailable(product.isAvailable);
          } else {
            setError("Product not found or you don't have permission to edit it.");
            navigate(ROUTES.FARMER_PRODUCTS);
          }
        } catch (err) {
          setError("Failed to load product data.");
        } finally {
          setFormLoading(false);
        }
      };
      fetchProductData();
    }
  }, [currentUser, navigate, isEditing, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    setIsLoading(true);

    if (price === '' || quantity === '') {
        setError("Price and Quantity cannot be empty.");
        setIsLoading(false);
        return;
    }

    const productData = {
      name,
      description,
      price: Number(price),
      quantity: Number(quantity),
      unit,
      category,
      imageUrl: imageUrl || `https://picsum.photos/seed/${name.replace(/\s+/g, '-').toLowerCase()}/400/300`, // default if empty
      farmerId: currentUser.id,
      isAvailable,
    };

    try {
      if (isEditing && productId) {
        await mockUpdateProduct(productId, productData, currentUser.id);
      } else {
        await mockAddProduct(productData, currentUser);
      }
      navigate(ROUTES.FARMER_PRODUCTS);
    } catch (err) {
      setError((err as Error).message || `Failed to ${isEditing ? 'update' : 'add'} product.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (formLoading) return <LoadingSpinner message="Loading product details..."/>;
  if (!currentUser || currentUser.role !== UserRole.FARMER) return <NavigateToLogin />;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Product Name" value={name} onChange={e => setName(e.target.value)} required />
        <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Price (₹)" type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || '')} required min="0" step="0.01" />
          <Input label="Available Quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || '')} required min="0" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Unit" value={unit} onChange={e => setUnit(e.target.value)} options={PRODUCT_UNITS.map(u => ({value: u, label: u}))} required />
          <Select label="Category" value={category} onChange={e => setCategory(e.target.value)} options={PRODUCT_CATEGORIES.map(c => ({value: c, label: c}))} required />
        </div>
        <Input label="Image URL (Optional)" placeholder="e.g., https://example.com/image.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        <p className="text-xs text-gray-500">If no URL is provided, a placeholder image will be used.</p>
        
        <div className="flex items-center">
          <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2" />
          <label htmlFor="isAvailable" className="text-sm text-gray-700">Is this product currently available for sale?</label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.FARMER_PRODUCTS)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Product')}
            </Button>
        </div>
      </form>
       {isEditing && productId && (
          <div className="mt-8 border-t pt-6">
            <Button 
                variant="danger" 
                onClick={async () => {
                    if(window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
                        setIsLoading(true);
                        try {
                            await mockDeleteProduct(productId, currentUser.id);
                            navigate(ROUTES.FARMER_PRODUCTS);
                        } catch (err) {
                            setError((err as Error).message || "Failed to delete product.");
                            setIsLoading(false);
                        }
                    }
                }}
                isLoading={isLoading}
                disabled={isLoading}
            >
                <TrashIcon className="w-5 h-5 mr-2"/> Delete Product
            </Button>
          </div>
        )}
    </div>
  );
};

// Fix: Export FarmerOrdersPage
export const FarmerOrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 5;

  const fetchFarmerReceivedOrders = useCallback(async (page: number) => {
    if (!currentUser || currentUser.role !== UserRole.FARMER) {
      navigate(ROUTES.LOGIN);
      return;
    }
    setLoading(true);
    try {
      // Fetch orders containing products from this farmer
      const {orders: fetchedOrders, total} = await mockFetchOrders({ farmerId: currentUser.id, page, limit });
      setOrders(fetchedOrders);
      setTotalPages(Math.ceil(total/limit));
    } catch (error) {
      console.error("Error fetching farmer orders:", error);
    } finally {
      setLoading(false);
    }
  },[currentUser, navigate]);


  useEffect(() => {
    fetchFarmerReceivedOrders(currentPage);
  }, [currentUser, currentPage, fetchFarmerReceivedOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingSpinner />;
  if (!currentUser || currentUser.role !== UserRole.FARMER) return <NavigateToLogin />;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Sales (Received Orders)</h1>
      {orders.length === 0 ? (
        <EmptyState 
          title="No Orders Received Yet" 
          message="You haven't received any orders for your products yet. Keep your products updated!"
          icon={<ShoppingCartIcon className="w-16 h-16 text-primary" />}
        />
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">Order #{order.id.substring(0, 8)}</h2>
                  <p className="text-sm text-gray-500">Customer: {order.userName}</p>
                  <p className="text-sm text-gray-500">Placed on: {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                 <p className="text-lg font-semibold mt-2 sm:mt-0">Total Value for Farmer: ₹{
                    order.items
                        .filter(item => item.product.farmerId === currentUser.id)
                        .reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
                        .toFixed(2)
                  }</p>
              </div>
               <p className="text-sm mb-1"><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === OrderStatus.PROCESSING ? 'bg-blue-100 text-blue-800' :
                  order.status === OrderStatus.SHIPPED ? 'bg-indigo-100 text-indigo-800' :
                  order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'}`}>{order.status}</span>
              </p>
              <p className="text-sm mb-3"><strong>Your Items in this Order:</strong></p>
              <ul className="list-disc list-inside text-sm mb-3 ml-4">
                {order.items.filter(item => item.product.farmerId === currentUser.id).map(item => (
                  <li key={item.product.id}>{item.product.name} (x{item.quantity})</li>
                ))}
              </ul>
              <Link to={`${ROUTES.ORDER_HISTORY}/${order.id}`}>
                <Button variant="outline" size="sm">View Order & Update Status</Button>
              </Link>
            </div>
          ))}
           <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};


// Admin Section
// Fix: Export AdminDashboardPage
export const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) return;
      setLoading(true);
      try {
        const {total: totalUsers} = await mockFetchAllUsers({});
        const {total: totalProducts} = await mockFetchProducts({});
        const {total: totalOrders} = await mockFetchOrders({});
        const {total: totalPendingRequests} = await mockFetchFarmerRequests({ status: 'Pending' });
        setStats({ users: totalUsers, products: totalProducts, orders: totalOrders, pendingRequests: totalPendingRequests });
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [currentUser]);

  if (loading) return <LoadingSpinner />;
  if (!currentUser || currentUser.role !== UserRole.ADMIN) return <NavigateToLogin />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Users" value={stats.users} icon={<UserIcon className="w-8 h-8"/>} linkTo={ROUTES.ADMIN_USERS} />
        <DashboardCard title="Total Products" value={stats.products} icon={<ShoppingCartIcon className="w-8 h-8"/>} linkTo={ROUTES.ADMIN_PRODUCTS} />
        <DashboardCard title="Total Orders" value={stats.orders} icon={<UserIcon className="w-8 h-8"/>} linkTo={ROUTES.ADMIN_ORDERS} />
        <DashboardCard title="Pending Farmer Requests" value={stats.pendingRequests} icon={<UserIcon className="w-8 h-8"/>} linkTo={ROUTES.ADMIN_FARMER_REQUESTS} className={stats.pendingRequests > 0 ? "bg-yellow-50" : ""} />
      </div>
      {/* Add more sections like recent activity, charts, etc. */}
       <div className="mt-12 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Management Areas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to={ROUTES.ADMIN_USERS} className="block p-4 bg-primary-light text-primary-dark rounded-lg hover:bg-green-200 transition-colors">
                    <h3 className="font-semibold">User Management</h3>
                    <p className="text-sm">View and manage all users.</p>
                </Link>
                <Link to={ROUTES.ADMIN_PRODUCTS} className="block p-4 bg-primary-light text-primary-dark rounded-lg hover:bg-green-200 transition-colors">
                    <h3 className="font-semibold">Product Catalog</h3>
                    <p className="text-sm">Oversee all listed products.</p>
                </Link>
                <Link to={ROUTES.ADMIN_ORDERS} className="block p-4 bg-primary-light text-primary-dark rounded-lg hover:bg-green-200 transition-colors">
                    <h3 className="font-semibold">Order Management</h3>
                    <p className="text-sm">Track and manage all orders.</p>
                </Link>
                <Link to={ROUTES.ADMIN_FARMER_REQUESTS} className="block p-4 bg-secondary-light text-secondary-dark rounded-lg hover:bg-amber-200 transition-colors">
                    <h3 className="font-semibold">Farmer Approvals</h3>
                    <p className="text-sm">Review and approve farmer registrations.</p>
                </Link>
            </div>
        </div>
    </div>
  );
};

// Fix: Export AdminUsersPage
export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  const fetchUsersList = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const { users: fetchedUsers, total } = await mockFetchAllUsers({ page, limit });
      setUsers(fetchedUsers);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUsersList(currentPage);
  }, [currentPage, fetchUsersList]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
      {users.length === 0 ? (
        <EmptyState title="No Users Found" message="There are no users in the system yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                        user.role === UserRole.FARMER ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                     }`}>
                        {user.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button size="sm" variant="ghost">View Details</Button> {/* Placeholder */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

// Fix: Export AdminProductsPage
export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const limit = 8;

  const fetchAllProducts = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const { products: fetchedProducts, total } = await mockFetchProducts({ page, limit });
      setProducts(fetchedProducts);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProducts(currentPage);
  }, [currentPage, fetchAllProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleProductUpdate = async (updatedFields: Partial<Product>) => {
    if (!selectedProduct) return;
    try {
        setLoading(true); // Or a modal specific loading
        await mockAdminUpdateProduct(selectedProduct.id, updatedFields);
        closeEditModal();
        fetchAllProducts(currentPage); // Refresh list
    } catch (err) {
        alert("Failed to update product: " + (err as Error).message);
    } finally {
        setLoading(false);
    }
  };
  
  const handleProductDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action is permanent.")) {
        try {
            setLoading(true);
            await mockAdminDeleteProduct(productId);
            fetchAllProducts(currentPage); // Refresh list
        } catch (err) {
            alert("Failed to delete product: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }
  };


  if (loading && !isModalOpen) return <LoadingSpinner />; // Don't show full page spinner if modal is open & loading
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Catalog Management</h1>
      {products.length === 0 && !loading ? (
        <EmptyState title="No Products Found" message="There are no products listed in the system." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.farmerName}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{product.price.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.quantity} {product.unit}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isAvailable && product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     }`}>
                        {product.isAvailable && product.quantity > 0 ? 'Available' : 'Unavailable'}
                     </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(product)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleProductDelete(product.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
      {selectedProduct && (
        <ProductEditModal 
            isOpen={isModalOpen} 
            onClose={closeEditModal} 
            product={selectedProduct} 
            onSave={handleProductUpdate}
        />
      )}
    </div>
  );
};

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (updatedFields: Partial<Product>) => Promise<void>;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product, onSave }) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState<number | ''>(product.price);
  const [quantity, setQuantity] = useState<number | ''>(product.quantity);
  const [isAvailable, setIsAvailable] = useState(product.isAvailable);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => { // Reset form when product changes (e.g. opening modal for different product)
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setQuantity(product.quantity);
    setIsAvailable(product.isAvailable);
  }, [product]);

  const handleSave = async () => {
    setModalLoading(true);
    await onSave({ name, description, price: Number(price), quantity: Number(quantity), isAvailable });
    setModalLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Product: ${product.name}`}>
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
        <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input label="Price" type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || '')} />
        <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || '')} />
        <div className="flex items-center">
          <input type="checkbox" id="modalIsAvailable" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2" />
          <label htmlFor="modalIsAvailable" className="text-sm text-gray-700">Is Available</label>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={modalLoading}>Cancel</Button>
        <Button onClick={handleSave} isLoading={modalLoading} disabled={modalLoading}>Save Changes</Button>
      </div>
    </Modal>
  );
};

// Fix: Export AdminOrdersPage
export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  const fetchAllSiteOrders = useCallback(async (page:number) => {
    setLoading(true);
    try {
      const {orders: fetchedOrders, total} = await mockFetchOrders({page, limit});
      setOrders(fetchedOrders);
      setTotalPages(Math.ceil(total/limit));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSiteOrders(currentPage);
  }, [currentPage, fetchAllSiteOrders]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Site Orders</h1>
      {orders.length === 0 ? (
        <EmptyState title="No Orders Found" message="There are no orders in the system yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-primary hover:underline">
                    <Link to={`${ROUTES.ORDER_HISTORY}/${order.id}`}>{order.id.substring(0,8)}</Link>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{order.userName}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === OrderStatus.PROCESSING ? 'bg-blue-100 text-blue-800' :
                        order.status === OrderStatus.SHIPPED ? 'bg-indigo-100 text-indigo-800' :
                        order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <Link to={`${ROUTES.ORDER_HISTORY}/${order.id}`}>
                        <Button size="sm" variant="ghost">View/Update</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

// Fix: Export AdminFarmerRequestsPage
export const AdminFarmerRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<FarmerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchRequests = useCallback(async (page: number) => {
    setLoading(true);
    setMessage(null);
    try {
      const { requests: fetchedRequests, total } = await mockFetchFarmerRequests({ page, limit });
      setRequests(fetchedRequests);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error("Failed to fetch farmer requests:", error);
      setMessage({type: 'error', text: 'Failed to load requests.'});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, fetchRequests]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'Approved' | 'Rejected') => {
    setLoading(true); // Consider a more granular loading state
    try {
      await mockUpdateFarmerRequestStatus(requestId, status);
      setMessage({type: 'success', text: `Request ${status.toLowerCase()} successfully.`});
      fetchRequests(currentPage); // Refresh the list
    } catch (error) {
      console.error("Failed to update request status:", error);
      setMessage({type: 'error', text: `Failed to ${status.toLowerCase()} request.`});
      setLoading(false);
    }
  };

  if (loading && requests.length === 0) return <LoadingSpinner />;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Farmer Registration Requests</h1>
      {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}
      {requests.length === 0 && !loading ? (
        <EmptyState title="No Pending Requests" message="There are currently no new farmer registration requests." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.farmerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.farmerEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                     }`}>
                        {req.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {req.status === 'Pending' && (
                      <>
                        <Button size="sm" variant="primary" onClick={() => handleUpdateRequestStatus(req.id, 'Approved')} isLoading={loading}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')} isLoading={loading}>Reject</Button>
                      </>
                    )}
                     {req.status !== 'Pending' && (
                        <span className="text-xs text-gray-400">Actioned</span>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};


// Customer Dashboard (can be expanded, for now simple placeholder)
export const CustomerDashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    if (!currentUser) return <NavigateToLogin />;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {currentUser.name}!</h1>
            <p className="text-gray-700 mb-4">This is your customer dashboard. Here you can manage your profile, view past orders, and track current shipments.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard 
                    title="My Orders" 
                    value="View History" 
                    icon={<ShoppingCartIcon className="w-8 h-8"/>} 
                    linkTo={ROUTES.ORDER_HISTORY} 
                />
                <DashboardCard 
                    title="Browse Products" 
                    value="Shop Now" 
                    icon={<UserIcon className="w-8 h-8"/>}  // Placeholder icon
                    linkTo={ROUTES.PRODUCTS}
                />
                {/* Add more cards like Profile, Addresses, etc. */}
            </div>
        </div>
    );
};


// Utility component for redirecting if not logged in
const NavigateToLogin: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(ROUTES.LOGIN);
  }, [navigate]);
  return <LoadingSpinner message="Redirecting to login..." />;
};