import { z } from 'zod';

// Plant schema
export const PlantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Plant name is required"),
  price: z.number().positive("Price must be positive"),
  stock_quantity: z.number().int().nonnegative("Stock quantity must be non-negative"),
  image_url: z.string().url("Invalid image URL"),
  thumbnail_url: z.string().url("Invalid thumbnail URL").nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
});

// Plant input schema (for adding a new plant)
export const PlantInputSchema = z.object({
  name: z.string().min(1, "Plant name is required"),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number"
  }),
  stock_quantity: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "Stock quantity must be a non-negative integer"
  }),
  image_url: z.string().url("Invalid image URL").or(z.string().length(0)),
  thumbnail_url: z.string().url("Invalid thumbnail URL").nullable().optional().or(z.string().length(0)),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  imageFile: z.instanceof(File).optional().nullable(),
});

// Customer info schema
export const CustomerInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required and must be at least 5 characters"),
});

// Order item schema
export const OrderItemSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  plant_id: z.string(),
  quantity: z.number().int().positive("Quantity must be positive"),
  price_at_time: z.number().positive("Price must be positive"),
  plants: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    stock_quantity: z.number(),
    image_url: z.string(),
    thumbnail_url: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
  }).nullable().optional(),
});

// Order schema
export const OrderSchema = z.object({
  id: z.string(),
  tracking_id: z.string(),
  customer_name: z.string(),
  customer_email: z.string().email("Invalid email address"),
  customer_address: z.string(),
  order_date: z.string().or(z.date()),
  status: z.enum(["pending", "processing", "shipped", "delivered"]),
  total_amount: z.number().positive("Total amount must be positive"),
  order_items: z.array(OrderItemSchema),
});

// Cart schema
export const CartSchema = z.record(z.string(), z.number());

// Types derived from Zod schemas
export type Plant = z.infer<typeof PlantSchema>;
export type PlantInput = z.infer<typeof PlantInputSchema>;
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Cart = z.infer<typeof CartSchema>;

// Validation functions
export const validatePlant = (data: unknown): { success: boolean; data?: Plant; error?: z.ZodError } => {
  try {
    const result = PlantSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

export const validatePlantInput = (data: unknown): { success: boolean; data?: PlantInput; error?: z.ZodError } => {
  try {
    const result = PlantInputSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

export const validateCustomerInfo = (data: unknown): { success: boolean; data?: CustomerInfo; error?: z.ZodError } => {
  try {
    const result = CustomerInfoSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

export const validateOrder = (data: unknown): { success: boolean; data?: Order; error?: z.ZodError } => {
  try {
    const result = OrderSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

// Helper function to format Zod errors into a user-friendly message
export const formatZodError = (error: z.ZodError): string => {
  return error.errors.map(err => {
    const field = err.path.join('.');
    return `${field ? field + ': ' : ''}${err.message}`;
  }).join(', ');
};
