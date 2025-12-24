import { ThemeMode } from '../../../storage';
import { SunIcon, MonitorIcon, MoonIcon } from './Icons';
import { baseSliderStyle } from './styles';

interface ThemeToggleProps {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

const BUTTON_SIZE = 40;
const PADDING = 5;
const GAP = 3;

const modes = [
  { mode: ThemeMode.LIGHT, icon: SunIcon, label: 'Light' },
  { mode: ThemeMode.SYSTEM, icon: MonitorIcon, label: 'System' },
  { mode: ThemeMode.DARK, icon: MoonIcon, label: 'Dark' },
];

export function ThemeToggle({ themeMode, onThemeChange }: ThemeToggleProps) {
  const selectedIndex = modes.findIndex((m) => m.mode === themeMode);
  const sliderOffset = PADDING + selectedIndex * (BUTTON_SIZE + GAP);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: GAP,
        padding: PADDING,
        backgroundColor: 'var(--card-bg)',
        borderRadius: (BUTTON_SIZE + PADDING * 2) / 2,
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          ...baseSliderStyle,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          left: 0,
          top: PADDING,
          transform: `translateX(${sliderOffset.toString()}px)`,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: BUTTON_SIZE / 2,
        }}
      />

      {modes.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => {
            onThemeChange(mode);
          }}
          title={label}
          aria-label={`${label} theme`}
          aria-pressed={themeMode === mode}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            padding: 0,
            border: 'none',
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: 'transparent',
            color: themeMode === mode ? 'var(--primary-color)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
        >
          <Icon width={20} height={20} />
        </button>
      ))}
    </div>
  );
}
