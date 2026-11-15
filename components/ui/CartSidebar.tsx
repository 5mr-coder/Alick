"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useCart, type CartItem } from '@/context/CartContext';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { OriginButton } from './origin-button';

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, switchItemToRetail, cartTotal } = useCart();
  const [retailPromptFor, setRetailPromptFor] = useState<CartItem | null>(null);

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card text-card-foreground shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-border">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Your Cart
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.salesMode}`} className="flex gap-4 p-3 rounded-lg border border-border bg-background shadow-sm relative group">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md border border-border" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 pr-6">{item.name}</h3>
                    <p className="text-gold-500 font-semibold mt-1">₦{item.price.toLocaleString()}</p>
                    <p className="text-[0.65rem] text-muted-foreground mt-1">
                      {item.salesMode === 'retail' ? 'Retail · minimum 10' : 'Personal · maximum 9'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.salesMode, item.quantity - 1)}
                      disabled={item.salesMode === 'retail' && item.quantity <= 10}
                      className="p-1 rounded-md bg-muted hover:bg-ash-700 transition-colors"
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => {
                        if (item.salesMode === 'consumer' && item.quantity >= 9) {
                          setRetailPromptFor(item);
                        } else {
                          updateQuantity(item.id, item.salesMode, item.quantity + 1);
                        }
                      }}
                      disabled={item.salesMode === 'retail' ? item.quantity >= item.stock : item.quantity >= item.stock && item.quantity < 9}
                      className={`p-1 rounded-md transition-colors ${item.salesMode === 'retail' ? item.quantity >= item.stock ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-muted hover:bg-ash-700' : item.quantity >= item.stock && item.quantity < 9 ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-muted hover:bg-ash-700'}`}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {(item.quantity >= item.stock || (item.salesMode === 'consumer' && item.quantity >= 9) || (item.salesMode === 'retail' && item.quantity <= 10)) && (
                      <span className="text-[0.65rem] text-yellow-500 font-semibold ml-1">
                        {item.salesMode === 'retail' && item.quantity <= 10 ? 'Retail minimum' : item.quantity >= item.stock ? 'Max stock' : 'Consumer limit'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id, item.salesMode)}
                  className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground font-medium">Subtotal</span>
              <span className="text-2xl font-bold">₦{cartTotal.toLocaleString()}</span>
            </div>
            <Link href="/checkout" style={{ display: 'block', width: '100%', textDecoration: 'none' }} onClick={() => setIsCartOpen(false)}>
              <OriginButton className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Proceed to Checkout
              </OriginButton>
            </Link>
          </div>
        )}
      </div>
      {retailPromptFor && (
        <div role="presentation" onClick={() => setRetailPromptFor(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.72)', display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div role="dialog" aria-modal="true" aria-labelledby="cart-retail-title" onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: '440px', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-gold)', background: 'var(--ash-900)', color: 'white' }}>
            <h2 id="cart-retail-title" style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Need more than 9?</h2>
            <p style={{ color: 'var(--ash-300)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {retailPromptFor.stock < 10
                ? `Retail orders start at 10 units. There are ${retailPromptFor.stock} listed in stock, so contact us to confirm bulk availability.`
                : 'Switch to retail mode to order this product in quantities starting at 10.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { switchItemToRetail(retailPromptFor.id); setRetailPromptFor(null); }}
                style={{ flex: 1, padding: '0.8rem 1rem', border: 0, borderRadius: '8px', background: 'var(--gold-400)', color: '#111', fontWeight: 700, cursor: 'pointer' }}
              >
                Switch to retail mode
              </button>
              <button type="button" onClick={() => setRetailPromptFor(null)} style={{ padding: '0.8rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                Keep shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
