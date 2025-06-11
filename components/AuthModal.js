import { useState } from 'react';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  username: Yup.string().when('$mode', (mode, schema) =>
    mode === 'signup' ? schema.min(3, 'Username must be at least 3 characters').required('Username is required') : schema
  ),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function AuthModal({ mode, onClose, onSubmit, switchMode }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schema.validate(formData, { abortEarly: false, context: { mode } });
      const isLogin = mode === 'login';
      const data = isLogin ? { email: formData.email, password: formData.password } : formData;
      onSubmit(data, isLogin);
    } catch (err) {
      if (err.name === 'ValidationError') {
        const formattedErrors = err.inner.reduce((acc, curr) => ({
          ...acc,
          [curr.path]: curr.message,
        }), {});
        setErrors(formattedErrors);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 animate-modalEnter">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <span className="mr-2">{mode === 'login' ? '🔑' : '✨'}</span>
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="mb-5">
              <label className="block text-white mb-2 font-medium" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 shadow-sm"
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && <p className="text-red-400 text-sm mt-2">{errors.username}</p>}
            </div>
          )}
          <div className="mb-5">
            <label className="block text-white mb-2 font-medium" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 shadow-sm"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2 font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 shadow-sm"
                placeholder="Enter your password"
              />
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-600 cursor-pointer hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {/* Switch Mode */}
        <p className="text-center text-gray-200 mt-6">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-blue-300 cursor-pointer hover:text-blue-400 transition-all duration-300 hover:underline ml-2"
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

AuthModal.defaultProps = {
  mode: 'login',
  onClose: () => {},
  onSubmit: () => {},
  switchMode: () => {},
};