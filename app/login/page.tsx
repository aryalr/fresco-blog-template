"use client";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.replace('/admin'); // Redirect ke admin setelah berhasil login
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto' }}>
      <h1>Login to Admin Panel</h1>
      <form onSubmit={handleSubmit}>
        {/* ... (form input untuk email dan password) ... */}
         <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
         <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
