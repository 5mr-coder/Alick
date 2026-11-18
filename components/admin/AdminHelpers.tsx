'use client';

import { useRef, useState } from 'react';
import { Check, Link2, Upload, X } from 'lucide-react';
import { formatNaira, nairaToKobo, slugify } from '@/lib/utils';

export function formatNairaPreview(nairaText: string): string | null {
  const trimmed = nairaText.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) return null;
  return formatNaira(nairaToKobo(num));
}

export const adminInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  borderRadius: '8px',
  background: 'var(--ash-900)',
  border: '1px solid var(--border)',
  color: 'var(--heading)',
  fontSize: '0.875rem',
};

export const adminLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--ash-300)',
  marginBottom: '0.3rem',
};

export const adminHelperStyle: React.CSSProperties = {
  fontSize: '0.73rem',
  color: 'var(--ash-400)',
  marginTop: '0.28rem',
  lineHeight: 1.4,
};

export function StatusToggle({
  checked,
  onChange,
  label,
  onText = 'Live',
  offText = 'Hidden',
  helper,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  onText?: string;
  offText?: string;
  helper?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '10px',
          background: 'var(--ash-900)',
          border: `1px solid ${checked ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--heading)' }}>
            {label}
          </span>
          <span
            style={{
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: checked ? 'rgba(34,197,94,0.16)' : 'rgba(148,163,184,0.16)',
              color: checked ? '#4ade80' : 'var(--ash-400)',
              border: `1px solid ${checked ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`,
            }}
          >
            {checked ? onText : offText}
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '999px',
            border: 'none',
            padding: '2px',
            background: checked ? '#22c55e' : 'var(--ash-700)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: checked ? 'flex-end' : 'flex-start',
            transition: 'background 0.15s ease',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: checked ? '#15803d' : '#64748b',
            }}
          >
            {checked ? <Check size={11} /> : <X size={11} />}
          </span>
        </button>
      </div>
      {helper && <div style={adminHelperStyle}>{helper}</div>}
    </div>
  );
}

export function NairaPriceField({
  label,
  value,
  onChange,
  required,
  min = 0,
  helper,
  placeholder = 'e.g. 680000',
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  min?: number;
  helper?: string;
  placeholder?: string;
}) {
  const preview = formatNairaPreview(value);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '0.5rem',
          marginBottom: '0.3rem',
        }}
      >
        <label style={{ ...adminLabelStyle, marginBottom: 0 }}>
          {label}
          {required ? ' *' : ''}
        </label>
        {preview && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--gold-400)',
            }}
          >
            {preview}
          </span>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: '0.8rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ash-400)',
            fontSize: '0.875rem',
            fontWeight: 600,
            pointerEvents: 'none',
          }}
        >
          ₦
        </span>
        <input
          type="number"
          step="1"
          min={min}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...adminInputStyle, paddingLeft: '1.85rem' }}
        />
      </div>
      {helper && <div style={adminHelperStyle}>{helper}</div>}
    </div>
  );
}

export function SlugFieldToggle({
  slug,
  onChange,
  prefix = '/',
}: {
  slug: string;
  onChange: (nextSlug: string) => void;
  prefix?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: '0.4rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.73rem',
            color: 'var(--ash-400)',
            wordBreak: 'break-all',
          }}
        >
          <Link2 size={12} />
          <span>
            Web link: <strong style={{ color: 'var(--ash-200)' }}>{prefix}{slug || 'auto-generated'}</strong>
          </span>
        </span>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          style={{
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--gold-400)',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {open ? 'Done' : 'Customize URL link'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: '0.45rem' }}>
          <input
            value={slug}
            onChange={(e) => onChange(slugify(e.target.value))}
            placeholder="auto-generated-from-title"
            style={{ ...adminInputStyle, fontSize: '0.8rem', padding: '0.45rem 0.7rem' }}
          />
          <div style={adminHelperStyle}>
            Auto-generated from the name. Only letters, numbers, and hyphens are needed.
          </div>
        </div>
      )}
    </div>
  );
}

export function ImageUploadDropzone({
  uploading,
  onFileSelected,
  label = 'Upload image',
}: {
  uploading: boolean;
  onFileSelected: (file: File) => void | Promise<void>;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      void onFileSelected(file);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => {
        if (!uploading) inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      style={{
        border: `1.5px dashed ${dragging ? 'var(--gold-400)' : 'var(--border)'}`,
        borderRadius: '10px',
        padding: '0.9rem 1rem',
        background: dragging ? 'rgba(245,200,66,0.08)' : 'var(--ash-900)',
        cursor: uploading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'rgba(245,200,66,0.12)',
            color: 'var(--gold-400)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Upload size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--heading)' }}>
            {uploading ? 'Uploading photo...' : label}
          </div>
          <div style={{ fontSize: '0.73rem', color: 'var(--ash-400)' }}>
            Drag & drop here or click to choose (JPG, PNG, or WebP up to 5MB)
          </div>
        </div>
      </div>

      <span
        style={{
          padding: '0.35rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--gold-400)',
          fontSize: '0.78rem',
          fontWeight: 600,
        }}
      >
        {uploading ? 'Please wait...' : 'Choose File'}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
    </div>
  );
}
