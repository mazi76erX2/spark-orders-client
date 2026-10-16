import { useState } from 'react';
import Confirmation from './components/Confirmation';
import LoginForm from './components/LoginForm';
import OrderForm from './components/OrderForm';
import type { Order, Product, User } from './types';

const SESSION_KEY = 'spark_user';

function loadUser(): User | null {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null');
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(loadUser);
  const [placed, setPlaced] = useState<{ order: Order; products: Product[] } | null>(null);

  const signIn = (u: User) => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch {}
    setUser(u);
  };
  const signOut = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setUser(null);
    setPlaced(null);
  };

  return (
    <>
      <header className="top">
        <h1>SPARK Orders</h1>
        {user && (
          <div className="who">
            <span>Signed in as <strong>{user.username}</strong></span>
            <button className="ghost" onClick={signOut}>Sign out</button>
          </div>
        )}
      </header>
      <main>
        {!user ? (
          <LoginForm onSignedIn={signIn} />
        ) : placed ? (
          <Confirmation order={placed.order} products={placed.products} onAgain={() => setPlaced(null)} />
        ) : (
          <OrderForm user={user} onPlaced={(order, products) => setPlaced({ order, products })} />
        )}
      </main>
    </>
  );
}
