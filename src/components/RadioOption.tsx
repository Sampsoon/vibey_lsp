import { ReactNode } from 'react';
import { typography } from '../config/theme';

interface RadioOptionProps {
  id: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  children?: ReactNode;
}

const containerStyle = (selected: boolean) => ({
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  padding: '12px',
  marginBottom: '10px',
  backgroundColor: selected ? 'var(--card-bg-active)' : 'var(--card-bg-inactive)',
  opacity: selected ? 1 : 0.5,
  cursor: 'pointer',
});

const headerStyle = (selected: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: selected ? '12px' : '0',
});

const labelStyle = (selected: boolean) => ({
  ...typography.body,
  cursor: 'pointer',
  color: selected ? 'var(--text-primary)' : 'var(--text-disabled)',
});

export function RadioOption({ id, label, selected, onSelect, children }: RadioOptionProps) {
  return (
    <div style={containerStyle(selected)} onClick={onSelect}>
      <div style={headerStyle(selected)}>
        <input
          type="radio"
          id={id}
          checked={selected}
          onChange={onSelect}
          style={{
            width: '16px',
            height: '16px',
            marginRight: '10px',
            cursor: 'pointer',
            accentColor: 'var(--primary-color)',
          }}
        />
        <label htmlFor={id} style={labelStyle(selected)}>
          {label}
        </label>
      </div>
      {selected && children && (
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
