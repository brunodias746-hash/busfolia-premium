import { useEffect, useState } from 'react';

interface PixTimerProps {
  createdAt: Date;
  expirationMinutes: number;
  onExpired?: () => void;
}

export function PixTimer({ createdAt, expirationMinutes, onExpired }: PixTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(expirationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const createdTime = new Date(createdAt);
      const expirationTime = new Date(createdTime.getTime() + expirationMinutes * 60 * 1000);
      const secondsLeft = Math.max(0, Math.floor((expirationTime.getTime() - now.getTime()) / 1000));

      setTimeLeft(secondsLeft);

      if (secondsLeft === 0 && !isExpired) {
        setIsExpired(true);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, expirationMinutes, isExpired, onExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / (expirationMinutes * 60)) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold">Tempo restante:</p>
        <p className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-400' : 'text-green-400'}`}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 60 ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isExpired && (
        <p className="text-xs text-red-400 mt-2">Código PIX expirado. Por favor, gere um novo código.</p>
      )}
    </div>
  );
}
