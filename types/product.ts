export interface ProductMetadata {
  color?: string;
  size?: string;
  category?: string;
  variant_name?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number | null;
  currency?: string | null;
  images?: string[];
  description?: string;
  metadata?: ProductMetadata;
  originalPrice?: number | null;
  dealPrice?: number | null;
  dealExpiresAt?: number | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Filters {
  searchTerm?: string;
  priceRange?: [number, number];
  colors?: string[];
  sizes?: string[];
  categories?: string[];
  sortBy?: 'priceLowHigh' | 'priceHighLow' | 'newest' | 'oldest' | 'relevance';
}