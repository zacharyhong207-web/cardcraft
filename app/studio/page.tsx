'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/components/StudioProvider';

export default function StudioRedirectPage() {
  const router = useRouter();
  const { openStudio } = useStudio();

  useEffect(() => {
    router.replace('/');
    openStudio();
  }, [router, openStudio]);

  return <div className="min-h-screen bg-[#08080a]" />;
}
