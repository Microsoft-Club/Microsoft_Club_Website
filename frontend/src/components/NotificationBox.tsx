type NotificationBoxProps = {
  title: string;
  message: string;
  icon?: 'info' | 'warning';
};

const NotificationBox = ({
  title,
  message,
  icon = 'info',
}: NotificationBoxProps) => {
  const symbol = icon === 'warning' ? '⚠️' : 'ℹ️';

  return (
    <div className="retro-window bg-white max-w-md">
      <div className="retro-window-header">
        <span className="retro-window-title">{title}</span>
        <div className="retro-window-controls">
          <span className="retro-dot" />
          <span className="retro-dot" />
          <span className="retro-dot" />
        </div>
      </div>
      <div className="flex items-start gap-3 p-4">
        <span className="text-2xl leading-none mt-1">{symbol}</span>
        <div>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationBox;

