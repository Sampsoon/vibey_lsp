import { typography } from '../config/theme';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'password';
  placeholder?: string;
  disabled?: boolean;
  linkText?: string;
  linkHref?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const labelStyle = (disabled?: boolean) => ({
  ...typography.smallLabel,
  display: 'block',
  marginBottom: '6px',
  color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
});

const inputStyle = (disabled?: boolean) => ({
  ...typography.smallLabel,
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  backgroundColor: disabled ? 'transparent' : 'var(--input-bg)',
  color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
  outline: 'none',
});

export function FormField({
  label,
  type = 'text',
  placeholder,
  disabled,
  linkText,
  linkHref,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={labelStyle(disabled)}>
        {label}
        {linkText && linkHref && (
          <>
            {' '}
            <a
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--link-color)', textDecoration: 'none' }}
            >
              ({linkText})
            </a>
          </>
        )}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={inputStyle(disabled)}
      />
    </div>
  );
}
