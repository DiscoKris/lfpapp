'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OzShowsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('https://lythgoefamily.com/current-productions');
  }, [router]);

  return null;
}
