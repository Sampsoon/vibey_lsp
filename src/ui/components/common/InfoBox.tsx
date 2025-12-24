import type { ReactNode } from 'react';
import { smallHeadingStyle, smallTextStyle } from './styles';

interface InfoBoxProps {
  title: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export function InfoBox({ title, children, style }: InfoBoxProps) {
  return (
    <section
      style={{
        border: '1px solid var(--infobox-header-border)',
        borderRadius: '12px',
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          background: 'var(--infobox-header-bg)',
          borderBottom: '1px solid var(--infobox-header-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '3px',
            height: '14px',
            borderRadius: '2px',
            backgroundColor: 'var(--infobox-accent)',
          }}
        />
        <span style={smallHeadingStyle}>{title}</span>
      </div>
      <div
        style={{
          padding: '14px 14px 14px 27px',
          ...smallTextStyle,
        }}
      >
        {children}
      </div>
    </section>
  );
}
