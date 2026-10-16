import { money, percent } from '../format';
import type { Order, Product } from '../types';

export default function Confirmation({ order, products, onAgain }: { order: Order; products: Product[]; onAgain: () => void }) {
  return (
    <section className="card">
      <span className="badge">Order placed</span>
      <h2 style={{ marginTop: 10 }}>Order #{order.orderID}</h2>
      <p className="sub">For {order.customerName}</p>
      <table>
        <thead><tr><th>Product</th><th className="num">Quantity</th></tr></thead>
        <tbody>
          {order.orderDetails.map((d) => (
            <tr key={d.orderDetailID}>
              <td>{products.find((p) => p.productID === d.productID)?.productName ?? `Product ${d.productID}`}</td>
              <td className="num">{d.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="totals">
        <span>Subtotal</span><span className="num">{money(order.salesValueExcludingVAT)}</span>
        <span>Discount</span><span className="num">{percent(order.discount)}</span>
        <span className="grand">Total</span><span className="grand num">{money(order.salesValueIncludingVAT)}</span>
      </div>
      <div className="actions"><button className="primary" onClick={onAgain}>Place another order</button></div>
    </section>
  );
}
