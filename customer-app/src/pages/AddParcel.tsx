import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type UploadMethod = 'whatsapp' | 'app_image' | 'app_text' | 'manual';

export const AddParcel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [method, setMethod] = useState<UploadMethod>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    recipientName: '',
    trackingNumber: '',
    courierCompany: '',
    pickupLocationName: '',
    pickupLocationAddress: '',
    pickupLocationHours: '',
    lastPickupDate: '',
    trackingLink: '',
  });

  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'recipientName',
      'trackingNumber',
      'courierCompany',
      'pickupLocationName',
      'pickupLocationAddress',
      'pickupLocationHours',
      'lastPickupDate',
      'trackingLink'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`שדה "${field}" חובה`);
        return false;
      }
    }
    return true;
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // In a real app, save to Firestore
      console.log('Saving parcel:', formData);
      setSuccess('החבילה נוספה בהצלחה!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהוספת חבילה');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!imageFile) {
      setError('בחר תמונה');
      return;
    }

    setLoading(true);
    try {
      // In a real app, send to AI for extraction
      console.log('Processing image:', imageFile);
      setSuccess('התמונה עובדה בהצלחה! הפרטים חולצו.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בעיבוד התמונה');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!textInput.trim()) {
      setError('הזן טקסט');
      return;
    }

    setLoading(true);
    try {
      // In a real app, send to AI for extraction
      console.log('Processing text:', textInput);
      setSuccess('הטקסט עובד בהצלחה! הפרטים חולצו.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בעיבוד הטקסט');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">לא מחובר</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-bold mb-2"
          >
            ← חזור לדשבורד
          </button>
          <h1 className="text-2xl font-bold text-gray-900">הוסף חבילה לאיסוף</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Method Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">בחר דרך להוספת חבילה</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setMethod('whatsapp')}
              className={`p-4 rounded-lg border-2 transition ${
                method === 'whatsapp'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="text-2xl mb-2">📱</p>
              <p className="font-bold text-gray-900">WhatsApp</p>
              <p className="text-sm text-gray-600 mt-1">שלח הודעה לבוט</p>
            </button>

            <button
              onClick={() => setMethod('app_image')}
              className={`p-4 rounded-lg border-2 transition ${
                method === 'app_image'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="text-2xl mb-2">📸</p>
              <p className="font-bold text-gray-900">צילום מסך</p>
              <p className="text-sm text-gray-600 mt-1">העלה תמונה</p>
            </button>

            <button
              onClick={() => setMethod('manual')}
              className={`p-4 rounded-lg border-2 transition ${
                method === 'manual'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <p className="text-2xl mb-2">✏️</p>
              <p className="font-bold text-gray-900">הזנה ידנית</p>
              <p className="text-sm text-gray-600 mt-1">מלא את הפרטים</p>
            </button>
          </div>
        </div>

        {/* WhatsApp Method */}
        {method === 'whatsapp' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">שלח הודעה ל-WhatsApp</h2>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <p className="text-sm text-green-700">
                שלח הודעה לבוט WhatsApp שלנו עם פרטי החבילה. הבוט יחלץ את הפרטים אוטומטית.
              </p>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition">
              פתח WhatsApp
            </button>
          </div>
        )}

        {/* Image Upload Method */}
        {method === 'app_image' && (
          <form onSubmit={handleImageSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">העלה צילום מסך</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">בחר תמונה</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {imagePreview && (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !imageFile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'בעיבוד...' : 'שלח תמונה'}
            </button>
          </form>
        )}

        {/* Text Input Method */}
        {method === 'app_text' && (
          <form onSubmit={handleTextSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">הדבק טקסט</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">הדבק את הטקסט של ההודעה</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="הדבק את הטקסט כאן..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !textInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'בעיבוד...' : 'שלח טקסט'}
            </button>
          </form>
        )}

        {/* Manual Entry Method */}
        {method === 'manual' && (
          <form onSubmit={handleManualSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">הזנה ידנית</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם המקבל *</label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="שם המקבל"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מספר מעקב *</label>
                <input
                  type="text"
                  name="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={handleChange}
                  placeholder="מספר מעקב"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">חברת הפצה *</label>
                <select
                  name="courierCompany"
                  value={formData.courierCompany}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">בחר חברה</option>
                  <option value="דואר ישראל">דואר ישראל</option>
                  <option value="צ'יטה">צ'יטה</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם מקום האיסוף *</label>
                <input
                  type="text"
                  name="pickupLocationName"
                  value={formData.pickupLocationName}
                  onChange={handleChange}
                  placeholder="שם מקום האיסוף"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">כתובת מקום האיסוף *</label>
                <input
                  type="text"
                  name="pickupLocationAddress"
                  value={formData.pickupLocationAddress}
                  onChange={handleChange}
                  placeholder="כתובת מקום האיסוף"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שעות פעילות *</label>
                <input
                  type="text"
                  name="pickupLocationHours"
                  value={formData.pickupLocationHours}
                  onChange={handleChange}
                  placeholder="08:00-18:00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך אחרון לאיסוף *</label>
                <input
                  type="date"
                  name="lastPickupDate"
                  value={formData.lastPickupDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">קישור מעקב *</label>
                <input
                  type="url"
                  name="trackingLink"
                  value={formData.trackingLink}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'בעיבוד...' : 'הוסף חבילה'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddParcel;

