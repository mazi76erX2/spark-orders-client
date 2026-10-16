import { useCallback, useEffect, useReducer, useState } from 'react';
import { createOrder, errorText, getProducts } from '../api';
import { money } from '../format';
import { linesReducer, parseQuantity } from '../orderLines';
import type { Order, Product, User } from '../types';

function QtyInput({ value, label, onCommit }: { value: number; label: string; onCommit: (q: number | null) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => {
    const quantity = parseQuantity(text);
    if (quantity === null) setText(String(value));
    onCommit(quantity);
  };
  return (
    <input
      type="number" min={1} step={1} value={text} aria-label={label}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  );
}

export default function OrderForm({ user, onPlaced }: { user: User; onPlaced: (o: Order, p: Product[]) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [loadError, setLoadError] = useState('');
  const [lines, dispatch] = useReducer(linesReducer, []);
  const [customer, setCustomer] = useState('');
  const [productId, setProductId] = useState(0);
  const [quantityInput, setQuantityInput] = useState('1');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await getProducts();
      setProducts(list);
      setProductId(list.find((p) => p.unitPrice != null)?.productID ?? 0);
      setStatus('ready');
    } catch (e) {
      setLoadError(errorText(e));
      setStatus('failed');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const findProduct = (id: number) => products.find((product) => product.productID === id);
  const quantityError = 'Quantity must be a whole number of 1 or more. Use Remove to delete a line.';

  function addLine() {
    const quantity = parseQuantity(quantityInput);
    if (quantity === null) return setError('Quantity must be a whole number of 1 or more.');
    setError('');
    dispatch({ type: 'add', productID: productId, quantity });
    setQuantityInput('1');
  }

  async function place() {
    setError('');
    if (!customer.trim()) return setError("Enter the customer's name.");
    if (!lines.length) return setError('Add at least one product to the order.');
    setBusy(true);
    try {
      const order = await createOrder({
        userID: String(user.userID),
        orderDate: new Date().toISOString(),
        customerName: customer.trim(),
        orderDetails: lines,
      });
      onPlaced(order, products);
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  }

  if (status === 'loading') return <section className="card"><p className="sub">Loading products...</p></section>;
  if (status === 'failed') {
    return (
      <section className="card">
        <div className="alert" role="alert">{loadError}</div>
        <div className="actions"><button className="primary" onClick={() => void load()}>Try again</button></div>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>New order</h2>
      <p className="sub">Add one or more products. Totals and any discount are worked out when you place the order.</p>
      <label htmlFor="cust">Customer name</label>
      <input id="cust" autoComplete="off" value={customer} onChange={(e) => setCustomer(e.target.value)} />
      <div className="row">
        <div className="grow">
          <label htmlFor="prod">Product</label>
          <select id="prod" value={productId} onChange={(e) => setProductId(Number(e.target.value))}>
            {products.map((p) => (
              <option key={p.productID} value={p.productID} disabled={p.unitPrice == null}>
                {p.productName} ({p.categoryName}) - {p.unitPrice == null ? 'no price' : money(p.unitPrice)}
              </option>
            ))}
          </select>
        </div>
        <div className="qty">
          <label htmlFor="qty">Quantity</label>
          <input id="qty" type="number" min={1} step={1} value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} />
        </div>
        <button className="primary" type="button" onClick={addLine}>Add line</button>
      </div>

      {lines.length === 0 ? (
        <p className="empty">No products added yet.</p>
      ) : (
        <table>
          <thead><tr><th>Product</th><th className="num">Unit price</th><th>Quantity</th><th /></tr></thead>
          <tbody>
            {lines.map((l) => {
              const product = findProduct(l.productID)!;
              return (
                <tr key={l.productID}>
                  <td>{product.productName}</td>
                  <td className="num">{product.unitPrice == null ? 'n/a' : money(product.unitPrice)}</td>
                  <td>
                    <QtyInput
                      value={l.quantity} label={`Quantity for ${product.productName}`}
                      onCommit={(q) => {
                        if (q === null) return setError(quantityError);
                        setError('');
                        dispatch({ type: 'setQuantity', productID: l.productID, quantity: q });
                      }}
                    />
                  </td>
                  <td className="num">
                    <button className="link" type="button" onClick={() => { setError(''); dispatch({ type: 'remove', productID: l.productID }); }}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="alert" role="alert">{error}</div>
      <div className="actions">
        <span className="hint">{lines.length ? `${lines.length} ${lines.length === 1 ? 'line' : 'lines'}` : ''}</span>
        <button className="primary" type="button" onClick={() => void place()} disabled={busy}>
          {busy ? 'Placing order...' : 'Place order'}
        </button>
      </div>
    </section>
  );
}
