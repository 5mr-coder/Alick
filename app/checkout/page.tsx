'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { ShoppingBag, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart, isLoaded } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  if (!isLoaded) {
    return <div style={{ minHeight: '100vh', background: 'var(--ash-950)' }} />;
  }

  if (items.length === 0 && !success) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={48} style={{ color: 'var(--ash-500)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'white' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--ash-400)', marginBottom: '2rem' }}>Add some products to your cart to proceed to checkout.</p>
        <Link href="/products" style={{
          display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--gold-400)',
          color: 'black', fontWeight: 600, borderRadius: '8px', textDecoration: 'none'
        }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      clearCart();
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendOrderOnWhatsApp = () => {
    const message = `*New Order Inquiry*%0A%0A*Name:* ${formData.name || 'Not provided'}%0A*Total:* ₦${cartTotal.toLocaleString()}%0A%0A*Items:*%0A${items.map(i => `- ${i.quantity}x ${i.name} (₦${i.price.toLocaleString()})`).join('%0A')}`;
    window.open(`https://wa.me/2348030841357?text=${message}`, '_blank');
  };

  if (success) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
          Order Received!
        </h1>
        <p style={{ color: 'var(--ash-300)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Thank you for your order. We have received it and will contact you shortly via WhatsApp or phone to confirm delivery.
        </p>
        <Link href="/" style={{
          display: 'inline-block', padding: '0.875rem 2rem', background: 'var(--ash-800)', border: '1px solid var(--border)',
          color: 'white', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', transition: 'background 200ms ease'
        }}>
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 0', background: 'var(--ash-950)' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ash-400)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Shopping
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '2rem', fontFamily: 'var(--font-display)' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }} className="checkout-grid">

          <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              Shipping Details
            </h2>

            <form id="checkout-form" onSubmit={placeOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ash-300)', marginBottom: '0.5rem' }}>Full Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--ash-900)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ash-300)', marginBottom: '0.5rem' }}>Email Address *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--ash-900)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ash-300)', marginBottom: '0.5rem' }}>Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--ash-900)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ash-300)', marginBottom: '0.5rem' }}>Delivery Address *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--ash-900)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ash-300)', marginBottom: '0.5rem' }}>Order Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--ash-900)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </form>
          </div>


          <div>
            <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Order Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--ash-800)', border: '1px solid var(--border)' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', lineHeight: 1.3, marginBottom: '0.25rem' }}>{item.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--ash-400)' }}>Qty: {item.quantity}</p>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--gold-400)', fontSize: '0.9rem' }}>
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--ash-300)' }}>Subtotal</span>
                  <span style={{ color: 'white' }}>₦{cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--ash-300)' }}>Shipping</span>
                  <span style={{ color: 'var(--ash-400)', fontSize: '0.875rem' }}>Calculated later</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '1.125rem' }}>Total</span>
                  <span style={{ color: 'var(--gold-400)', fontWeight: 700, fontSize: '1.25rem' }}>₦{cartTotal.toLocaleString()}</span>
                </div>
              </div>


              <div style={{ background: 'rgba(245, 200, 66, 0.1)', border: '1px solid var(--border-gold)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ShieldAlert size={18} color="var(--gold-400)" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                <p style={{ color: 'var(--ash-200)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--gold-400)', display: 'block', marginBottom: '0.25rem' }}>Payment Gateway Unavailable</strong>
                  Paystack integration is currently down. Please submit your order and we will confirm it via WhatsApp/Phone for payment on delivery or bank transfer.
                </p>
              </div>

              <button
                form="checkout-form"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.875rem', background: 'var(--gold-400)', color: 'black',
                  fontWeight: 600, fontSize: '1rem', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'opacity 200ms ease', marginBottom: '1rem'
                }}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                <span style={{ color: 'var(--ash-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              </div>

              <button
                type="button"
                onClick={sendOrderOnWhatsApp}
                style={{
                  width: '100%', padding: '0.875rem', background: '#25D366', color: 'white',
                  fontWeight: 600, fontSize: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 200ms ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
