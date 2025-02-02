export interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  discount?: number;
  stock?: number;
  description: string;
}
