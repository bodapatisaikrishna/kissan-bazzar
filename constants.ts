
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_CONFIRMATION: '/order-confirmation/:orderId',
  ORDER_HISTORY: '/orders',
  ORDER_DETAIL: '/orders/:orderId',
  
  FARMER_DASHBOARD: '/farmer/dashboard',
  FARMER_PRODUCTS: '/farmer/products',
  FARMER_ADD_PRODUCT: '/farmer/products/add',
  FARMER_EDIT_PRODUCT: '/farmer/products/edit/:id',
  FARMER_ORDERS: '/farmer/orders',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_FARMER_REQUESTS: '/admin/farmer-requests',

  NOT_FOUND: '/404',
};

export const PRODUCT_CATEGORIES = ['Vegetable', 'Fruit', 'Grain', 'Dairy', 'Poultry', 'Other'];
export const PRODUCT_UNITS = ['kg', 'gram', 'litre', 'ml', 'dozen', 'piece', 'bunch'];

export const APP_NAME = "Kissan Bazzar";
