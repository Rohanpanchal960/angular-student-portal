/**
 * ====================================================================================
 * [EXPERIMENT 4] - Create an interface and use it to define a product structure
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * TypeScript `interface` ek contract define karta hai jo compile-time par object ke structure
 * (properties aur unke data types) ko strictly enforce karta hai.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * Hum `Product` interface banate hain jisme `id`, `name`, `price`, aur `category` define hain.
 * Example object: { id: 1, name: 'Mouse', price: 299, category: 'Electronics' }
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * College Store / Study Material section me course books, lab kits aur electronics
 * items ko strongly-typed tarike se display aur purchase karne ke liye use hota hai.
 */

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  inStock?: boolean;
  releaseDate?: string;
  rating?: number;
  imageUrl?: string;
}

// Default product catalog for the College Study Store
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Optical Wireless Mouse',
    price: 299,
    category: 'Electronics',
    description: 'Ergonomic 2.4GHz USB wireless optical mouse for lab programming.',
    inStock: true,
    releaseDate: '2025-01-15',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    name: 'Angular 18 Complete Guide Book',
    price: 1200,
    category: 'Books',
    description: 'Master Angular Standalone components, RxJS, signals & unit testing.',
    inStock: true,
    releaseDate: '2025-05-01',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    name: 'Mechanical Gaming Keyboard',
    price: 2499,
    category: 'Electronics',
    description: 'RGB Backlit tactile blue-switch keyboard for high-speed coding.',
    inStock: true,
    releaseDate: '2024-11-20',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    name: 'Data Structures & Algorithms in TS',
    price: 850,
    category: 'Books',
    description: 'Comprehensive guide to algorithms, trees, graphs, and Big-O notation.',
    inStock: true,
    releaseDate: '2025-02-10',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 5,
    name: 'Fast 64GB USB 3.2 Flash Drive',
    price: 499,
    category: 'Electronics',
    description: 'High-speed storage drive for practical lab project backups.',
    inStock: false,
    releaseDate: '2024-08-15',
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=300&auto=format&fit=crop&q=60'
  }
];
