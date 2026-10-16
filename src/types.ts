export interface User { userID: number; username: string; role: string }
export interface Product {
  productID: number;
  productName: string;
  categoryName: string;
  unitPrice: number | null;
}
export interface OrderLine { productID: number; quantity: number }
export interface OrderDetail extends OrderLine { orderDetailID: number; orderID: number }
export interface Order {
  orderID: number;
  userID: string;
  orderDate: string;
  customerName: string;
  salesValueExcludingVAT: number;
  discount: number;
  salesValueIncludingVAT: number;
  orderDetails: OrderDetail[];
}
export interface NewOrder {
  userID: string;
  orderDate: string;
  customerName: string;
  orderDetails: OrderLine[];
}
