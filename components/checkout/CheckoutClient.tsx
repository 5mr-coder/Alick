'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, ShieldAlert, Truck } from 'lucide-react';
import Link from 'next/link';
import type { PublicSiteSettings, ShippingZone } from '@/types';
import { formatNaira } from '@/lib/utils';

const SHIPPING_ZONE_OPTIONS: Array<{
  id: ShippingZone;
  label: string;
  description: string;
}> = [
  {
    id: 'ikeja_pickup',
    label: 'Ikeja Store Pickup',
    description: 'Pick up in person at 5 Obafemi Awolowo Way, Ikeja',
  },
  {
    id: 'lagos_delivery',
    label: 'Lagos Delivery',
    description: 'Doorstep courier delivery within Lagos State',
  },
  {
    id: 'interstate_delivery',
    label: 'Interstate Delivery',
    description: 'Tracked waybill / courier delivery outside Lagos',
  },
];

export default function CheckoutClient({
  settings,
}: {
  settings: PublicSiteSettings;
}) {
  const { items, cartTotal, isLoaded, salesMode } = useCart();
  const [loading, setLoading] = useState(false);
  const [whatsappFallback, setWhatsappFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shippingZone, setShippingZone] =
    useState<ShippingZone>('lagos_delivery');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: 'Lagos',
    landmark: '',
    notes: '',
  });

  if (!isLoaded) {
    return <div style={{ minHeight: '100vh', background: 'var(--ash-950)' }} />;
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '8rem 0',
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShoppingBag
          size={48}
          style={{ color: 'var(--ash-500)', marginBottom: '1rem' }}
        />
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: 'var(--heading)',
          }}
        >
          Your cart is empty
        </h2>
        <p style={{ color: 'var(--ash-400)', marginBottom: '2rem' }}>
          Add some products to your cart to proceed to checkout.
        </p>
        <Link
          href="/products"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--gold-400)',
            color: 'var(--on-gold)',
            fontWeight: 600,
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shippingFee = Number(settings.shipping_rates[shippingZone] ?? 0);
  const grandTotal = cartTotal + shippingFee;
  const distinctModes = Array.from(new Set(items.map((i) => i.salesMode)));
  const hasMixedModes = distinctModes.length > 1;
  const effectiveMode = distinctModes[0] ?? salesMode ?? 'consumer';
  const whatsappDigits =
    settings.whatsapp_number.replace(/\D/g, '') || '2348030841357';

  const buildWhatsAppUrl = () => {
    const zoneLabel =
      SHIPPING_ZONE_OPTIONS.find((z) => z.id === shippingZone)?.label ??
      shippingZone;
    const lines = [
      '*New Order Inquiry*',
      '',
      `*Name:* ${formData.name || 'Not provided'}`,
      `*Email:* ${formData.email || 'Not provided'}`,
      `*Phone:* ${formData.phone || 'Not provided'}`,
      `*Order Mode:* ${effectiveMode === 'retail' ? 'Retail' : 'Personal'}`,
      `*Delivery:* ${zoneLabel} (${formatNaira(shippingFee)})`,
      shippingZone !== 'ikeja_pickup' && formData.street
        ? `*Address:* ${[formData.street, formData.city, formData.state]
            .filter(Boolean)
            .join(', ')}`
        : '',
      '',
      '*Items:*',
      ...items.map(
        (i) => `- ${i.quantity}x ${i.name} (${formatNaira(i.price)})`
      ),
      '',
      `*Subtotal:* ${formatNaira(cartTotal)}`,
      `*Total:* ${formatNaira(grandTotal)}`,
      formData.notes ? `*Notes:* ${formData.notes}` : '',
    ].filter(Boolean);

    return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
  };

  const sendOrderOnWhatsApp = () => {
    window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (hasMixedModes) {
      setErrorMsg(
        'Your cart mixes Personal (1-9) and Retail (10+) items. Please adjust quantities in your cart so all items match one order mode.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
          })),
          salesMode: effectiveMode,
          shippingZone,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          address: {
            street:
              shippingZone === 'ikeja_pickup'
                ? formData.street.trim() ||
                  'Ikeja Store Pickup — 5 Obafemi Awolowo Way'
                : formData.street,
            city: formData.city,
            state: formData.state,
            landmark: formData.landmark,
          },
          notes: formData.notes,
        }),
      });

      const data = (await res.json()) as {
        mode?: string;
        authorization_url?: string;
        error?: string;
      };

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to place order. Please try again.');
        return;
      }

      if (data.mode === 'whatsapp_only') {
        setWhatsappFallback(true);
        sendOrderOnWhatsApp();
        return;
      }

      if (data.authorization_url) {
        window.location.assign(data.authorization_url);
        return;
      }

      setErrorMsg('Unexpected payment response. Please try again.');
    } catch {
      setErrorMsg('Network error while starting checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'var(--ash-900)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--heading)',
    outline: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '3rem 0',
        background: 'var(--ash-950)',
      }}
    >
      <div className="container" style={{ maxWidth: '1000px' }}>
        <Link
          href="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--ash-400)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '2rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Shopping
        </Link>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--heading)',
            marginBottom: '2rem',
            fontFamily: 'var(--font-display)',
          }}
        >
          Checkout
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="checkout-grid"
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '2rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--heading)',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              Customer & Delivery Details
            </h2>

            <form
              id="checkout-form"
              onSubmit={placeOrder}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--ash-300)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Full Name *
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--ash-300)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    maxLength={150}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--ash-300)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    minLength={7}
                    maxLength={30}
                    placeholder="+234 803..."
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--ash-300)',
                    marginBottom: '0.65rem',
                  }}
                >
                  <Truck size={15} color="var(--gold-400)" /> Delivery Zone *
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  {SHIPPING_ZONE_OPTIONS.map((zone) => {
                    const fee = Number(settings.shipping_rates[zone.id] ?? 0);
                    const selected = shippingZone === zone.id;
                    return (
                      <label
                        key={zone.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          border: `1px solid ${
                            selected ? 'var(--gold-400)' : 'var(--border)'
                          }`,
                          background: selected
                            ? 'rgba(245, 200, 66, 0.08)'
                            : 'var(--ash-900)',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.65rem',
                          }}
                        >
                          <input
                            type="radio"
                            name="shipping_zone"
                            value={zone.id}
                            checked={selected}
                            onChange={() => setShippingZone(zone.id)}
                            style={{
                              accentColor: 'var(--gold-400)',
                              marginTop: '0.2rem',
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: 'var(--heading)',
                              }}
                            >
                              {zone.label}
                            </div>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--ash-400)',
                              }}
                            >
                              {zone.description}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: 'var(--gold-400)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fee === 0 ? 'Free' : formatNaira(fee)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {shippingZone !== 'ikeja_pickup' && (
                <>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--ash-300)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Street Address *
                    </label>
                    <input
                      required
                      minLength={3}
                      maxLength={250}
                      type="text"
                      placeholder="House number and street name"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--ash-300)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        City / Area
                      </label>
                      <input
                        maxLength={100}
                        type="text"
                        placeholder="e.g. Lekki, Ikeja"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--ash-300)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        State
                      </label>
                      <input
                        maxLength={100}
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--ash-300)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Nearest Landmark (Optional)
                    </label>
                    <input
                      maxLength={150}
                      type="text"
                      value={formData.landmark}
                      onChange={(e) =>
                        setFormData({ ...formData, landmark: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--ash-300)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Order Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </form>
          </div>

          <div>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--heading)',
                  marginBottom: '1rem',
                }}
              >
                Order Summary
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem',
                }}
              >
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.salesMode}`}
                    style={{ display: 'flex', gap: '1rem' }}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'var(--ash-800)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--heading)',
                          lineHeight: 1.3,
                          marginBottom: '0.25rem',
                        }}
                      >
                        {item.name}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--ash-400)' }}>
                        Qty: {item.quantity} ({item.salesMode})
                      </p>
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'var(--gold-400)',
                        fontSize: '0.9rem',
                      }}
                    >
                      {formatNaira(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderTop: '1px dashed var(--border)',
                  paddingTop: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ color: 'var(--ash-300)' }}>Subtotal</span>
                  <span style={{ color: 'var(--heading)' }}>
                    {formatNaira(cartTotal)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ color: 'var(--ash-300)' }}>Shipping</span>
                  <span style={{ color: 'var(--heading)', fontSize: '0.9rem' }}>
                    {shippingFee === 0 ? 'Free' : formatNaira(shippingFee)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--heading)',
                      fontWeight: 600,
                      fontSize: '1.125rem',
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      color: 'var(--gold-400)',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                    }}
                  >
                    {formatNaira(grandTotal)}
                  </span>
                </div>
              </div>

              {(errorMsg || hasMixedModes) && (
                <div
                  style={{
                    background: 'rgba(248, 113, 113, 0.12)',
                    border: '1px solid var(--danger)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    color: 'var(--danger)',
                    fontSize: '0.825rem',
                    lineHeight: 1.5,
                  }}
                >
                  {errorMsg ||
                    'Your cart mixes Personal (1-9) and Retail (10+) items. Adjust quantities in your cart so all items use the same order mode.'}
                </div>
              )}

              {whatsappFallback && (
                <div
                  style={{
                    background: 'rgba(245, 200, 66, 0.1)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <ShieldAlert
                    size={18}
                    color="var(--gold-400)"
                    style={{ marginTop: '0.1rem', flexShrink: 0 }}
                  />
                  <p
                    style={{
                      color: 'var(--ash-200)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong
                      style={{
                        color: 'var(--gold-400)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      WhatsApp Checkout Active
                    </strong>
                    Online card checkout is currently disabled. Click the WhatsApp
                    button below to send your order directly to our Ikeja sales
                    team.
                  </p>
                </div>
              )}

              <button
                form="checkout-form"
                type="submit"
                disabled={loading || hasMixedModes}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'var(--gold-400)',
                  color: 'var(--on-gold)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading || hasMixedModes ? 'not-allowed' : 'pointer',
                  opacity: loading || hasMixedModes ? 0.7 : 1,
                  transition: 'opacity 200ms ease',
                  marginBottom: '1rem',
                }}
              >
                {loading ? 'Processing...' : 'Pay Securely with Paystack'}
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  margin: '1rem 0',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    background: 'var(--border)',
                  }}
                />
                <span
                  style={{
                    color: 'var(--ash-500)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  OR
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    background: 'var(--border)',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={sendOrderOnWhatsApp}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: '#25D366',
                  color: '#062d16',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 200ms ease',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Order via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `,
        }}
      />
    </div>
  );
}
