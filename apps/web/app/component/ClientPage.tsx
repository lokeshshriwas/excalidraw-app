'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession } from '../utility/auth';
import ChatPage from './ChatPage';

export default function ClientPage({ roomId }: { roomId: number }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession();
      setIsAuthenticated(!!session);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <ChatPage roomId={roomId}/>;
  }

  return null;
}
