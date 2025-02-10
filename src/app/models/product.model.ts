export interface Product {
  id: number;
  name: string;
  price: number;
  Images: [{
    thumb_img: string;
    primary_img: string;
    secondary_img: string;
    tertiary_img: string;
  }];
  discount: number;
  stock: number;
  description: string;
}
