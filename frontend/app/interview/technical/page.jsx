'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TechnicalRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/interview/setup?round=Technical%20Fundamentals');
  }, [router]);
  return null;
}

