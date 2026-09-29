'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudio } from '@/components/StudioProvider';

export default function AiRedirectPage() {
  const router = useRouter();
  const { openAiModal } = useStudio();

  useEffect(() => {
    // Replace URL without reloading, and open the modal
    router.replace('/');
    openAiModal();
  }, [router, openAiModal]);

  return <div className="min-h-screen bg-[#08080a]" />;
}
