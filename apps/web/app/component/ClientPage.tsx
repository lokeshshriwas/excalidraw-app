'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession } from '../utility/auth';

export default function ClientPage() {
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
    return <div>Main page</div>;
  }

  return null;
}