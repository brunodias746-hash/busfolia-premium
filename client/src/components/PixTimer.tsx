import { useEffect, useState } from 'react';

interface PixTimerProps {
  createdAt: Date;
  expirationMinutes: number;
  onExpired?: () => void;
}

export function PixTimer({ createdAt, expirationMinutes, onExpired }: PixTimerProps) {
  // PIX fixo não expira - componente desativado
  return null;
}
