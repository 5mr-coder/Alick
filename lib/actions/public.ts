'use server';

import { z } from 'zod';
import { createAnonClient } from '@/lib/supabase/server';
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit';

export type PublicActionResult = {
  ok: boolean;
  error?: string;
};

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(150, 'Email must be at most 150 characters'),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number must be at most 30 characters')
    .optional()
    .default(''),
  subject: z
    .string()
    .trim()
    .min(2, 'Subject must be at least 2 characters')
    .max(150, 'Subject must be at most 150 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(3000, 'Message must be at most 3000 characters'),
  service_slug: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default(''),
  website: z.string().optional().default(''),
});

export async function submitContactMessage(
  input: z.input<typeof contactSchema>
): Promise<PublicActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Please check your form details.',
    };
  }

  // Honeypot check: bots fill hidden fields; return silent success
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return { ok: true };
  }

  const ip = await getClientIp();
  const allowed = await enforceRateLimit(`contact:ip:${ip}`, 5, 600);
  if (!allowed) {
    return {
      ok: false,
      error: 'Too many messages sent. Please wait a few minutes and try again.',
    };
  }

  const supabase = createAnonClient();
  // Never call .select() after public insert: anon has no SELECT grant on contact_messages.
  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
    service_slug: parsed.data.service_slug || null,
  });

  if (error) {
    console.error('[submitContactMessage] Insert failed:', error.message);
    return {
      ok: false,
      error: 'Could not send your message. Please try again or reach us on WhatsApp.',
    };
  }

  return { ok: true };
}

const reviewSchema = z.object({
  product_id: z.string().uuid('Invalid product').nullable().optional(),
  author_name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  comment: z
    .string()
    .trim()
    .min(5, 'Review must be at least 5 characters')
    .max(1000, 'Review must be at most 1000 characters'),
  website: z.string().optional().default(''),
});

export async function submitReview(
  input: z.input<typeof reviewSchema>
): Promise<PublicActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || 'Please check your review.',
    };
  }

  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return { ok: true };
  }

  const ip = await getClientIp();
  const allowed = await enforceRateLimit(`review:ip:${ip}`, 5, 600);
  if (!allowed) {
    return {
      ok: false,
      error: 'Too many review submissions. Please try again later.',
    };
  }

  const supabase = createAnonClient();
  // Never call .select() after public insert: unapproved reviews are not readable by anon.
  const { error } = await supabase.from('reviews').insert({
    product_id: parsed.data.product_id ?? null,
    author_name: parsed.data.author_name,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  if (error) {
    console.error('[submitReview] Insert failed:', error.message);
    return {
      ok: false,
      error: 'Could not submit your review. Please try again.',
    };
  }

  return { ok: true };
}
