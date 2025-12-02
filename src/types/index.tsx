export interface Room {
  id: number;
  name: string;
  price: number;
  status: 'available' | 'occupied' | 'cleaning';
  image: string;
  facilities: string[];
  description?: string;
  rating?: number;
  location?: string;
}