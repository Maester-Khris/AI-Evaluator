import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../hooks/useAuthModal';
import { Input } from '../../../common/ui/input';
import { Button } from '../../../common/ui/button';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); // The IDENTITY hook
  const { closeModal, openModal } = useAuthModal(); // The UI hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Call your Node.js backend via the Auth Context
      await login({ email, password });
      // 2. If successful, close the door
      closeModal();
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <Input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Connecting...' : 'Login'}
      </Button>
      
      <p className="text-center text-sm text-zinc-500 mt-4">
        Don't have an account?{' '}
        <button 
          type="button"
          onClick={() => openModal('signup')} 
          className="text-blue-400 hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  );
};