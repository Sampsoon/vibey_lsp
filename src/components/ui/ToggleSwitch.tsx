import { typography } from '../../config/theme';

interface ToggleSwitchProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly [T, T];
  labels: readonly [string, string];
}

const containerStyle = {
  display: 'flex' as const,
  backgroundColor: 'var(--card-bg-inactive)',
  border: '1.5px solid var(--border-color)',
  borderRadius: '8px',
  padding: '3px',
  position: 'relative' as const,
  boxShadow: 'var(--shadow-sm)',
  width: '100%',
};

const sliderStyle = (isFirstSelected: boolean) => ({
  position: 'absolute' as const,
  width: 'calc(50% - 3px)',
  height: 'calc(100% - 6px)',
  backgroundColor: 'transparent',
  borderRadius: '6px',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: isFirstSelected ? 'translateX(0)' : 'translateX(100%)',
  top: '3px',
  left: '3px',
  boxShadow: 'var(--shadow-md)',
});

const buttonStyle = (isSelected: boolean) => ({
  ...typography.smallLabel,
  padding: '8px 24px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: isSelected ? 'var(--primary-color)' : 'var(--text-secondary)',
  position: 'relative' as const,
  zIndex: 1,
  fontWeight: 500,
  flex: 1,
});

export function ToggleSwitch<T extends string>({ value, onChange, options, labels }: ToggleSwitchProps<T>) {
  return (
    <div style={containerStyle}>
      <div style={sliderStyle(value === options[0])} />
      {options.map((option, index) => (
        <button
          key={option}
          onClick={() => {
            onChange(option);
          }}
          style={buttonStyle(value === option)}
        >
          {labels[index]}
        </button>
      ))}
    </div>
  );
}
