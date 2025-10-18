import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [step, setStep] = useState<'basic' | 'company' | 'verification'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyAddress: '',
    floor: '',
    notes: '',
    subscriptionPlan: '10' as '10' | '15' | '20',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateBasicInfo = () => {
    if (!formData.fullName || !formData.phone || !formData.email || !formData.password) {
      setError('כל השדות חובה');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      return false;
    }
    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להיות לפחות 6 תווים');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('אימייל לא תקין');
      return false;
    }
    return true;
  };

  const validateCompanyInfo = () => {
    if (!formData.companyName || !formData.companyAddress) {
      setError('שם חברה וכתובת חובה');
      return false;
    }
    return true;
  };

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateBasicInfo()) return;

    setLoading(true);
    try {
      // Register user
      await register(formData.email, formData.password, {
        fullName: formData.fullName,
        phone: formData.phone,
        userType: 'main',
        whatsappNumber: formData.phone,
      });

      setSuccess('רישום בסיסי הצליח. אנא אמת את כתובת המייל שלך.');
      setStep('company');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה ברישום');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateCompanyInfo()) return;

    setLoading(true);
    try {
      // Save company info (in a real app, this would update the user document)
      setSuccess('פרטי החברה נשמרו בהצלחה');
      setStep('verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      setSuccess('אימות הושלם בהצלחה!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה באימות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">הדוור הבא</h1>
        <p className="text-center text-gray-600 mb-6">הרשמה חדשה</p>

        {/* Progress indicator */}
        <div className="flex justify-between mb-6">
          <div className={`flex-1 h-2 rounded-full mx-1 ${step === 'basic' || step === 'company' || step === 'verification' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex-1 h-2 rounded-full mx-1 ${step === 'company' || step === 'verification' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex-1 h-2 rounded-full mx-1 ${step === 'verification' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {step === 'basic' && (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'בעיבוד...' : 'המשך'}
            </button>

            <p className="text-center text-gray-600 text-sm">
              יש לך חשבון? <a href="/login" className="text-blue-600 hover:text-blue-700 font-bold">כנס כאן</a>
            </p>
          </form>
        )}

        {/* Step 2: Company Information */}
        {step === 'company' && (
          <form onSubmit={handleCompanyInfoSubmit} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mb-4">
              ✓ אימייל אימות נשלח לכתובתך. אנא אמת את כתובת המייל שלך.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם החברה</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="שם החברה"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כתובת החברה</label>
              <input
                type="text"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="כתובת החברה"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קומה (אופציונלי)</label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="קומה"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הערות לשליח (אופציונלי)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="הערות נוספות"
                rows={3}
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
              {loading ? 'בעיבוד...' : 'המשך לאימות'}
            </button>
          </form>
        )}

        {/* Step 3: Verification */}
        {step === 'verification' && (
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700 mb-4">
              ✓ פרטי החברה נשמרו בהצלחה
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mb-4">
              אנא אמת את כתובת המייל שלך על ידי לחיצה על הקישור שנשלח אליך.
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">פרטי הרישום:</p>
              <p className="text-sm text-gray-600">שם: {formData.fullName}</p>
              <p className="text-sm text-gray-600">אימייל: {formData.email}</p>
              <p className="text-sm text-gray-600">חברה: {formData.companyName}</p>
              <p className="text-sm text-gray-600">מסלול: {formData.subscriptionPlan} חבילות</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'בעיבוד...' : 'סיום הרישום'}
            </button>

            <p className="text-center text-gray-600 text-sm">
              לא קיבלת אימייל? <button type="button" className="text-blue-600 hover:text-blue-700 font-bold">שלח שוב</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;

