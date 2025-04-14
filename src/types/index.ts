// Plant type definition
export interface Plant {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  thumbnail_url?: string;
  description?: string;
  category?: string;
}

// Cart type definition
export interface Cart {
  [key: string]: number;
}

// Order type definition
export interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  order_date: string;
}

// Order item type definition
export interface OrderItem {
  id: string;
  order_id: string;
  plant_id: string;
  quantity: number;
  price_at_time: number;
  plants?: Plant;
}

// Order with items type definition
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

// Customer information type definition
export interface CustomerInfo {
  name: string;
  email: string;
  address: string;
}

// Order tracking information type definition
export interface OrderTracking {
  trackingId: string;
  orderId: string;
  customerName: string;
}

// Plant data for adding a new plant
export interface PlantData {
  name: string;
  price: string;
  stock_quantity: string;
  image_url: string;
  thumbnail_url?: string;
  description?: string;
  category?: string;
  imageFile?: File | null;
}
