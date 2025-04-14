import { supabase } from '../supabase/config';

// Plant data from Urvann.com
const plantData = [
  {
    name: "Money Plant Golden",
    price: 249,
    stock_quantity: 25,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/money-plant-golden-31767953842324.jpg?v=1675240844"
  },
  {
    name: "Jade Plant Mini",
    price: 249,
    stock_quantity: 30,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/jade-plant-mini-31768212275348.jpg?v=1675240844"
  },
  {
    name: "Lucky Bamboo Plant",
    price: 299,
    stock_quantity: 40,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/lucky-bamboo-plant-31768254275732.jpg?v=1675240844"
  },
  {
    name: "Areca Palm Plant",
    price: 599,
    stock_quantity: 15,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/areca-palm-plant-31767656087700.jpg?v=1675240844"
  },
  {
    name: "Snake Plant",
    price: 499,
    stock_quantity: 20,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/snake-plant-31768446124180.jpg?v=1675240844"
  },
  {
    name: "Peace Lily Plant",
    price: 399,
    stock_quantity: 18,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/peace-lily-plant-31768341995668.jpg?v=1675240844"
  },
  {
    name: "ZZ Plant",
    price: 599,
    stock_quantity: 12,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/zz-plant-31768509636756.jpg?v=1675240844"
  },
  {
    name: "Aloe Vera Plant",
    price: 249,
    stock_quantity: 35,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/aloe-vera-plant-31767639539860.jpg?v=1675240844"
  },
  {
    name: "Spider Plant",
    price: 299,
    stock_quantity: 28,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/spider-plant-31768454775956.jpg?v=1675240844"
  },
  {
    name: "Rubber Plant",
    price: 499,
    stock_quantity: 15,
    image_url: "https://cdn.shopify.com/s/files/1/0579/7924/0580/products/rubber-plant-31768405123220.jpg?v=1675240844"
  }
];

/**
 * Seeds the Supabase database with plant data from Urvann.com
 */
export const seedPlantsDatabase = async (): Promise<void> => {
  try {
    console.log('Starting to seed plants database...');
    
    // Insert plants into the database
    const { data, error } = await supabase
      .from('plants')
      .insert(plantData)
      .select();
    
    if (error) {
      console.error('Error seeding plants database:', error);
      throw error;
    }
    
    console.log(`Successfully added ${data?.length} plants to the database`);
    console.log('Plant data:', data);
    
    return;
  } catch (error) {
    console.error('Error in seedPlantsDatabase:', error);
    throw error;
  }
};

/**
 * Clears all plants from the database
 */
export const clearPlantsDatabase = async (): Promise<void> => {
  try {
    console.log('Clearing plants database...');
    
    const { error } = await supabase
      .from('plants')
      .delete()
      .neq('id', '0'); // Delete all records
    
    if (error) {
      console.error('Error clearing plants database:', error);
      throw error;
    }
    
    console.log('Successfully cleared plants database');
    
    return;
  } catch (error) {
    console.error('Error in clearPlantsDatabase:', error);
    throw error;
  }
};
