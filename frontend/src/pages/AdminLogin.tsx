import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '../components/PixelButton';
import { api } from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post<{ token: string }>('/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('mcg_admin_token', res.data.token);
      localStorage.setItem('mcg_admin_email', email);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border-2 border-black overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-primary text-white border-b-2 border-black">
        <h1 className="font-heading text-xs md:text-sm">Admin Login</h1>
        <span className="text-[10px] bg-white text-primary px-2 py-0.5 border border-black">
          Secure
        </span>
      </div>
      <form className="space-y-4 p-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-16"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-600 underline"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <PixelButton
          type="submit"
          label={loading ? 'Logging in...' : 'Login'}
          className="w-full justify-center"
          disabled={loading}
        />
      </form>
    </div>
  );
};

export default AdminLogin;

