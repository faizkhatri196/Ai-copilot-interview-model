'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HRRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/interview/setup?round=HR%20Interview');
  }, [router]);
  return null;
}

