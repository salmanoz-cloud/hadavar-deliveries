import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyId: '',
    subscriptionPlan: '10' as '10' | '15' | '20',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!formData.fullName || !formData.phone || !formData.email || !formData.password) {
        throw new Error('יש למלא את כל השדות');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('הסיסמאות אינן תואמות');
      }

      if (formData.password.length < 6) {
        throw new Error('הסיסמה חייבת להיות לפחות 6 תווים');
      }

      // Register
      await register(formData.email, formData.password, {
        fullName: formData.fullName,
        phone: formData.phone,
        companyId: formData.companyId,
        subscriptionPlan: formData.subscriptionPlan,
        whatsappNumber: formData.phone,
      });

      // Navigate to verification page
      navigate('/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'הרשמה נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">הדוור הבא</h1>
        <p className="text-center text-gray-600 mb-6">הרשמה חדשה</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="שם מלא"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="050-1234567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">דוא"ל</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="סיסמה"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימות סיסמה</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="אימות סיסמה"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מסלול מנוי</label>
            <select
              name="subscriptionPlan"
              value={formData.subscriptionPlan}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10 חבילות לחודש - 70₪</option>
              <option value="15">15 חבילות לחודש - 100₪</option>
              <option value="20">20 חבילות לחודש - 130₪</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'בהעלאה...' : 'הרשמה'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          כבר יש לך חשבון?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            כנס כאן
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;

