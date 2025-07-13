'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BASE_URL } from '@repo/backend-common/config';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Example: Call your login API
    const response = await fetch(`${"http://localhost:3002/v1"}/auth/signin`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    if (data.token) {
    localStorage.setItem("token", data.token)
    router.push('/');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}