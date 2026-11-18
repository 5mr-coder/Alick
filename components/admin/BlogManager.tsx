'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { BlogPostRow } from '@/lib/db/mappers';
import { deleteBlogPostAction, saveBlogPostAction } from '@/lib/actions/blog';
import { uploadAdminMedia } from '@/lib/storage/upload';
import { slugify } from '@/lib/utils';
import {
  adminHelperStyle,
  adminInputStyle,
  adminLabelStyle,
  ImageUploadDropzone,
  SlugFieldToggle,
  StatusToggle,
} from '@/components/admin/AdminHelpers';

const emptyPost = {
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: 'Alick System Services',
  category: 'Buying Guide',
  tagsText: '',
  isFeatured: false,
  published: true,
  publishedAt: '',
};

export default function BlogManager({
  initialPosts,
}: {
  initialPosts: BlogPostRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyPost);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const handleUploadCover = async (file: File) => {
    setUploading(true);
    setFeedback(null);
    try {
      const publicUrl = await uploadAdminMedia(file, 'blog-media');
      setForm((prev) => ({ ...prev, coverImage: publicUrl }));
      setFeedback({ ok: true, text: 'Cover photo uploaded successfully.' });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Cover photo upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const res = await saveBlogPostAction({
      id: form.id || undefined,
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      coverImage: form.coverImage.trim() || null,
      author: form.author.trim() || 'Alick System Services',
      category: form.category.trim() || null,
      tags: form.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isFeatured: form.isFeatured,
      published: form.published,
      publishedAt: form.publishedAt || null,
    });

    setSaving(false);
    if (!res.ok) {
      setFeedback({ ok: false, text: res.error || 'Could not save article.' });
      return;
    }
    setFeedback({
      ok: true,
      text: form.published ? 'Article published to blog.' : 'Article saved as draft.',
    });
    setForm(emptyPost);
    setEditorMode('write');
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete article "${title}"?`)) return;
    const res = await deleteBlogPostAction(id);
    if (!res.ok) {
      setFeedback({ ok: false, text: res.error || 'Delete failed.' });
      return;
    }
    if (form.id === id) setForm(emptyPost);
    setFeedback({ ok: true, text: `"${title}" deleted.` });
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div className="section-label">Editorial</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Blog Articles ({initialPosts.length})
        </h1>
        <p style={{ color: 'var(--ash-400)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Publish buying guides, tech tips, and announcements for your customers.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: `1px solid ${
              feedback.ok ? 'var(--border-gold)' : 'rgba(248,113,113,0.45)'
            }`,
            background: 'var(--surface)',
            color: feedback.ok ? 'var(--gold-400)' : 'var(--danger)',
            fontSize: '0.875rem',
          }}
        >
          {feedback.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
            {form.id ? `Editing: ${form.title}` : 'Write New Article'}
          </h2>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyPost)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--ash-300)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              + Write New Article
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={adminLabelStyle}>Article Headline *</label>
            <input
              required
              value={form.title}
              placeholder="e.g. How to Choose a Business Laptop in Lagos"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.id ? prev.slug : slugify(e.target.value),
                }))
              }
              style={adminInputStyle}
            />
            <SlugFieldToggle
              slug={form.slug}
              onChange={(slug) => setForm({ ...form, slug })}
              prefix="/blog/"
            />
          </div>

          <div>
            <label style={adminLabelStyle}>Article Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Buying Guide, Tech Tips, or News"
              style={adminInputStyle}
            />
          </div>

          <div>
            <label style={adminLabelStyle}>Author Name</label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              style={adminInputStyle}
            />
          </div>

          <div>
            <label style={adminLabelStyle}>Keywords / Tags</label>
            <input
              value={form.tagsText}
              placeholder="e.g. hp, laptops, lagos"
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              style={adminInputStyle}
            />
            <div style={adminHelperStyle}>Separate multiple tags with commas.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <label style={{ ...adminLabelStyle, marginBottom: 0 }}>
            Cover Photo (Optional)
          </label>
          <ImageUploadDropzone
            uploading={uploading}
            onFileSelected={handleUploadCover}
            label="Upload article cover photo"
          />
          <input
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            placeholder="Or paste an image URL (https://...)"
            style={adminInputStyle}
          />
          {form.coverImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={form.coverImage}
                alt="Cover preview"
                style={{
                  width: '96px',
                  height: '58px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, coverImage: '' })}
                style={{
                  padding: '0.3rem 0.7rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(248,113,113,0.35)',
                  background: 'transparent',
                  color: 'var(--danger)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                Remove Cover Photo
              </button>
            </div>
          )}
        </div>

        <div>
          <label style={adminLabelStyle}>Short Summary (Excerpt)</label>
          <textarea
            rows={2}
            value={form.excerpt}
            placeholder="One or two sentences shown on the blog card before a visitor clicks..."
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            style={adminInputStyle}
          />
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.45rem',
            }}
          >
            <label style={{ ...adminLabelStyle, marginBottom: 0 }}>
              Article Body *
            </label>
            <div
              style={{
                display: 'inline-flex',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--ash-900)',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                style={{
                  padding: '0.32rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  background:
                    editorMode === 'write' ? 'var(--gold-400)' : 'transparent',
                  color:
                    editorMode === 'write' ? 'var(--on-gold)' : 'var(--ash-300)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                style={{
                  padding: '0.32rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  background:
                    editorMode === 'preview' ? 'var(--gold-400)' : 'transparent',
                  color:
                    editorMode === 'preview'
                      ? 'var(--on-gold)'
                      : 'var(--ash-300)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Preview
              </button>
            </div>
          </div>

          {editorMode === 'preview' ? (
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--ash-900)',
                minHeight: '220px',
                color: 'var(--ash-200)',
                lineHeight: 1.7,
              }}
            >
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {form.content || '*Nothing written yet. Switch to Write to begin typing.*'}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              required
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="## Section Heading&#10;&#10;Write your article normally. Use **bold text** for emphasis and - for bullet lists."
              style={adminInputStyle}
            />
          )}
          <div style={adminHelperStyle}>
            Formatting tip: Use <code>## Heading</code> for section titles,{' '}
            <code>**bold**</code> for emphasis, and <code>- item</code> for bullet lists.
            Switch to <strong>Preview</strong> anytime to check how readers will see it.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatusToggle
            label="Publishing Status"
            checked={form.published}
            onChange={(val) => setForm({ ...form, published: val })}
            onText="Publish Now"
            offText="Save as Draft"
            helper="Choose 'Save as Draft' if you want to finish writing before visitors see this article."
          />
          <StatusToggle
            label="Feature on Home Page"
            checked={form.isFeatured}
            onChange={(val) => setForm({ ...form, isFeatured: val })}
            onText="Featured"
            offText="Standard"
            helper="Highlight this article in the Home Page journal section."
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--gold-400)',
              color: 'var(--on-gold)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {saving
              ? 'Saving...'
              : form.id
                ? 'Save Article Changes'
                : form.published
                  ? 'Publish Article'
                  : 'Save Draft'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(emptyPost)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--heading)',
                cursor: 'pointer',
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {initialPosts.map((post) => (
          <div
            key={post.id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span
                style={{
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: post.published
                    ? 'rgba(34,197,94,0.16)'
                    : 'rgba(148,163,184,0.16)',
                  color: post.published ? '#4ade80' : 'var(--ash-300)',
                }}
              >
                {post.published ? 'Live on Blog' : 'Draft'}
              </span>
              {post.is_featured && (
                <span className="badge badge-sale">Featured</span>
              )}
            </div>
            <strong style={{ color: 'var(--heading)' }}>{post.title}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
              /blog/{post.slug} · {post.category || 'Uncategorized'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt ?? '',
                    content: post.content,
                    coverImage: post.cover_image ?? '',
                    author: post.author,
                    category: post.category ?? '',
                    tagsText: (post.tags ?? []).join(', '),
                    isFeatured: post.is_featured,
                    published: post.published,
                    publishedAt: post.published_at ?? '',
                  });
                  setEditorMode('write');
                }}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--gold-400)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.id, post.title)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(248,113,113,0.35)',
                  background: 'transparent',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
