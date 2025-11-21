import { smallLabelTextStyle } from './styles';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  rows?: number;
}

const textAreaStyle = {
  ...smallLabelTextStyle,
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  backgroundColor: 'var(--input-bg)',
  color: 'var(--text-primary)',
  outline: 'none',
  boxShadow: 'inset 0 1px 1px rgba(var(--shadow-base), 0.04)',
  resize: 'vertical' as const,
  fontFamily: 'monospace',
};

export function TextArea({ value, onChange, placeholder, style, rows = 4 }: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary-color)';
        e.currentTarget.style.boxShadow = '0 0 0 2px var(--slider-bg-start)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(var(--shadow-base), 0.04)';
      }}
      placeholder={placeholder}
      style={{ ...textAreaStyle, ...style }}
      rows={rows}
    />
  );
}
