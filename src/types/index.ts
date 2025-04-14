// Re-export types from Zod schemas
export type {
  Plant,
  PlantInput,
  CustomerInfo,
  OrderItem,
  Order as OrderWithItems,
  Cart
} from '../schemas';

// Additional types not covered by Zod schemas

// Order tracking type for UI
export interface OrderTracking {
  trackingId: string;
  orderId: string;
  customerName: string;
}

// Plant data for form input (legacy - consider using PlantInput from schemas)
export interface PlantData {
  name: string;
  price: string;
  stock_quantity: string;
  image_url: string;
  thumbnail_url: string;
  description: string;
  category: string;
  imageFile: File | null;
}
