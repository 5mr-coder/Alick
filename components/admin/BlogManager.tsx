'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import type { BlogPostRow } from '@/lib/db/mappers';
import { deleteBlogPostAction, saveBlogPostAction } from '@/lib/actions/blog';
import { uploadAdminMedia } from '@/lib/storage/upload';
import { slugify } from '@/lib/utils';

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
  const [showPreview, setShowPreview] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    try {
      const publicUrl = await uploadAdminMedia(file, 'blog-media');
      setForm((prev) => ({ ...prev, coverImage: publicUrl }));
      setFeedback('Cover image uploaded to blog-media.');
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Cover image upload failed.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
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
      excerpt: form.excerpt || null,
      content: form.content,
      coverImage: form.coverImage || null,
      author: form.author || 'Alick System Services',
      category: form.category || null,
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
      setFeedback(res.error || 'Could not save post.');
      return;
    }
    setFeedback('Blog post saved.');
    setForm(emptyPost);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await deleteBlogPostAction(id);
    if (!res.ok) {
      setFeedback(res.error || 'Delete failed.');
      return;
    }
    if (form.id === id) setForm(emptyPost);
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    background: 'var(--ash-900)',
    border: '1px solid var(--border)',
    color: 'var(--heading)',
    fontSize: '0.875rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div className="section-label">Editorial</div>
        <h1 className="section-heading" style={{ fontSize: '2rem' }}>
          Blog Posts ({initialPosts.length})
        </h1>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-gold)',
            background: 'var(--surface)',
            color: 'var(--gold-400)',
            fontSize: '0.875rem',
          }}
        >
          {feedback}
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
          gap: '1rem',
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
            {form.id ? `Editing: ${form.title}` : 'Write New Post (Markdown)'}
          </h2>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--ash-900)',
              color: 'var(--gold-400)',
              fontSize: '0.825rem',
              cursor: 'pointer',
            }}
          >
            {showPreview ? 'Edit Markdown' : 'Preview Markdown'}
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.id ? prev.slug : slugify(e.target.value),
                }))
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Slug *
            </label>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Category
            </label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Buying Guide / Tech Tips / News"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Author
            </label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Tags (comma separated)
            </label>
            <input
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
              Cover Image (Upload to blog-media or URL)
            </label>
            <input
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              placeholder="https://..."
              style={inputStyle}
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUploadCover}
              disabled={uploading}
              style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
            Excerpt
          </label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--ash-400)', marginBottom: '0.3rem' }}>
            Content (Markdown) *
          </label>
          {showPreview ? (
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--ash-900)',
                minHeight: '200px',
                color: 'var(--ash-200)',
                lineHeight: 1.7,
              }}
            >
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {form.content || '*Nothing to preview yet.*'}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              required
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="## Heading&#10;&#10;Write your article in Markdown..."
              style={{ ...inputStyle, fontFamily: 'monospace' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            Published
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) =>
                setForm({ ...form, isFeatured: e.target.checked })
              }
            />
            Featured on Home Page
          </label>
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
            {saving ? 'Saving...' : form.id ? 'Update Post' : 'Publish Post'}
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
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span className="badge badge-gold">
                {post.published ? 'Published' : 'Draft'}
              </span>
              {post.is_featured && (
                <span className="badge badge-sale">Featured</span>
              )}
            </div>
            <strong style={{ color: 'var(--heading)' }}>{post.title}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--ash-400)' }}>
              /{post.slug} · {post.category || 'Uncategorized'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() =>
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
                  })
                }
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--gold-400)',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.id, post.title)}
                style={{
                  padding: '0.35rem 0.75rem',
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
