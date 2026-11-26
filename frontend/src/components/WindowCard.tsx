import type { ReactNode } from 'react';
import WindowControls from './desktop/WindowControls';

type TitleBgColor = 'lime' | 'blue' | 'coral' | 'yellow' | 'navy';

type WindowCardProps = {
  title: string;
  children: ReactNode;
  imageSlot?: ReactNode;
  className?: string;
  bodyClassName?: string;
  titleBg?: TitleBgColor;
  framed?: boolean;
};

const WindowCard = ({
  title,
  children,
  imageSlot,
  className = '',
  bodyClassName = '',
  titleBg = 'blue',
  framed = false,
}: WindowCardProps) => {
  const bar = (
    <div className={`win-bar win-bar--${titleBg}`}>
      <p className="win-title">{title}</p>
      <WindowControls />
    </div>
  );

  if (framed) {
    return (
      <div className={`win-stack ${className}`}>
        <section className="win win--framed">
          {bar}
          <div className="win-frame">
            <div className={`win-panel win-body ${bodyClassName}`}>{children}</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className={`win ${className}`}>
      {bar}
      {imageSlot && <div className="win-media">{imageSlot}</div>}
      <div className={`win-body ${bodyClassName}`}>{children}</div>
    </section>
  );
};

export default WindowCard;
