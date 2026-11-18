'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ContactMessageRow, ReviewRow } from '@/lib/db/mappers';
import {
  deleteContactMessageAction,
  deleteReviewAction,
  setContactResolvedAction,
  setReviewApprovalAction,
} from '@/lib/actions/reviews';

export default function ReviewsMessagesManager({
  reviews,
  messages,
}: {
  reviews: ReviewRow[];
  messages: ContactMessageRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'reviews' | 'messages'>('reviews');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const runAction = async (
    id: string,
    fn: () => Promise<{ ok: boolean; error?: string }>
  ) => {
    setBusyId(id);
    setFeedback(null);
    const res = await fn();
    setBusyId(null);
    if (!res.ok) {
      setFeedback(res.error || 'Action failed.');
      return;
    }
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div className="section-label">Moderation & Inbox</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Reviews & Contact Messages
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setTab('reviews')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            border: `1px solid ${
              tab === 'reviews' ? 'var(--gold-400)' : 'var(--border)'
            }`,
            background:
              tab === 'reviews' ? 'rgba(245,200,66,0.14)' : 'var(--surface)',
            color: tab === 'reviews' ? 'var(--gold-400)' : 'var(--ash-300)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reviews ({reviews.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('messages')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            border: `1px solid ${
              tab === 'messages' ? 'var(--gold-400)' : 'var(--border)'
            }`,
            background:
              tab === 'messages' ? 'rgba(245,200,66,0.14)' : 'var(--surface)',
            color: tab === 'messages' ? 'var(--gold-400)' : 'var(--ash-300)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Contact Messages ({messages.length})
        </button>
      </div>

      {feedback && (
        <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>
          {feedback}
        </div>
      )}

      {tab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--ash-400)' }}>No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${
                    r.is_approved ? 'var(--border)' : 'var(--border-gold)'
                  }`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <strong style={{ color: 'var(--heading)' }}>
                      {r.author_name}
                    </strong>
                    <span style={{ color: 'var(--gold-400)', fontSize: '0.85rem' }}>
                      {'★'.repeat(r.rating)}
                    </span>
                    <span className="badge badge-gold">
                      {r.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ash-300)', lineHeight: 1.6 }}>
                    {r.comment}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ash-500)', marginTop: '0.35rem' }}>
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() =>
                      runAction(r.id, () =>
                        setReviewApprovalAction(r.id, !r.is_approved)
                      )
                    }
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: r.is_approved
                        ? 'var(--ash-800)'
                        : 'var(--gold-400)',
                      color: r.is_approved ? 'var(--heading)' : 'var(--on-gold)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {r.is_approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => {
                      if (!confirm('Delete this review?')) return;
                      runAction(r.id, () => deleteReviewAction(r.id));
                    }}
                    style={{
                      padding: '0.45rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(248,113,113,0.4)',
                      background: 'transparent',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'messages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 ? (
            <p style={{ color: 'var(--ash-400)' }}>No contact messages yet.</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${
                    m.is_resolved ? 'var(--border)' : 'var(--border-gold)'
                  }`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--heading)' }}>
                      {m.subject}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--ash-400)' }}>
                      From {m.name} ({m.email})
                      {m.phone ? ` · ${m.phone}` : ''}
                      {m.service_slug ? ` · Service: ${m.service_slug}` : ''}
                    </div>
                  </div>
                  <span className="badge badge-gold">
                    {m.is_resolved ? 'Resolved' : 'Open'}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--ash-200)',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.message}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--ash-500)' }}>
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      disabled={busyId === m.id}
                      onClick={() =>
                        runAction(m.id, () =>
                          setContactResolvedAction(m.id, !m.is_resolved)
                        )
                      }
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: m.is_resolved
                          ? 'var(--ash-800)'
                          : 'var(--gold-400)',
                        color: m.is_resolved
                          ? 'var(--heading)'
                          : 'var(--on-gold)',
                        fontWeight: 600,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      {m.is_resolved ? 'Reopen' : 'Mark Resolved'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === m.id}
                      onClick={() => {
                        if (!confirm('Delete this message?')) return;
                        runAction(m.id, () => deleteContactMessageAction(m.id));
                      }}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(248,113,113,0.4)',
                        background: 'transparent',
                        color: 'var(--danger)',
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
