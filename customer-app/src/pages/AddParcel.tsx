import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type UploadMethod = 'whatsapp' | 'app_image' | 'app_text' | 'manual';

export const AddParcel: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [method, setMethod] = useState<UploadMethod>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    recipientName: '',
    trackingNumber: '',
    courierCompany: '',
    pickupLocationName: '',
    pickupLocationAddress: '',
    pickupLocationHours: '',
    trackingLink: '',
  });

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
      if (!user || !userData) {
        throw new Error('יש להתחבר תחילה');
      }

      // Check if user reached parcel limit
      if (userData.currentMonthParcels >= userData.maxParcels) {
        throw new Error(`הגעת למכסת החבילות החודשית שלך (${userData.maxParcels}). שדרג את המסלול שלך.`);
      }

      // Validation
      if (!formData.trackingNumber || !formData.courierCompany || !formData.pickupLocationName) {
        throw new Error('יש למלא את השדות החובה');
      }

      // Create parcel document
      const parcelRef = await addDoc(collection(db, 'parcels'), {
        userId: user.uid,
        mainUserId: userData.mainUserId || user.uid,
        companyId: userData.companyId,
        recipientName: formData.recipientName,
        trackingNumber: formData.trackingNumber,
        courierCompany: formData.courierCompany,
        pickupLocation: {
          name: formData.pickupLocationName,
          address: formData.pickupLocationAddress,
          hours: formData.pickupLocationHours,
          lastPickupDate: new Date(),
        },
        trackingLink: formData.trackingLink,
        status: 'pending_pickup',
        statusHistory: [
          {
            status: 'pending_pickup',
            timestamp: new Date(),
            updatedBy: 'system',
            notes: 'Created from app',
          },
        ],
        uploadMethod: method,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update user's parcel count
      await db.collection('users').doc(user.uid).update({
        currentMonthParcels: userData.currentMonthParcels + 1,
      });

      navigate(`/parcel/${parcelRef.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'הוספת החבילה נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">הוסף חבילה חדשה</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Method Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">בחר שיטת העלאה</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setMethod('whatsapp')}
              className={`p-4 rounded-lg border-2 transition duration-200 ${
                method === 'whatsapp'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium">WhatsApp</div>
              <div className="text-xs text-gray-600">העבר הודעה</div>
            </button>

            <button
              onClick={() => setMethod('app_image')}
              className={`p-4 rounded-lg border-2 transition duration-200 ${
                method === 'app_image'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📸</div>
              <div className="font-medium">צילום מסך</div>
              <div className="text-xs text-gray-600">העלה תמונה</div>
            </button>

            <button
              onClick={() => setMethod('app_text')}
              className={`p-4 rounded-lg border-2 transition duration-200 ${
                method === 'app_text'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">הדבק טקסט</div>
              <div className="text-xs text-gray-600">הדבק הודעה</div>
            </button>

            <button
              onClick={() => setMethod('manual')}
              className={`p-4 rounded-lg border-2 transition duration-200 ${
                method === 'manual'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">✍️</div>
              <div className="font-medium">הזנה ידנית</div>
              <div className="text-xs text-gray-600">מלא טופס</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם הנמען
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="שם הנמען"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר מעקב *
                </label>
                <input
                  type="text"
                  name="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="מספר מעקב"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ספק משלוחים *
                </label>
                <select
                  name="courierCompany"
                  value={formData.courierCompany}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">בחר ספק</option>
                  <option value="דואר ישראל">דואר ישראל</option>
                  <option value="Boxit">Boxit</option>
                  <option value="HFD">HFD</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  קישור מעקב
                </label>
                <input
                  type="url"
                  name="trackingLink"
                  value={formData.trackingLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם נקודת איסוף *
              </label>
              <input
                type="text"
                name="pickupLocationName"
                value={formData.pickupLocationName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="שם נקודת איסוף"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כתובת נקודת איסוף
              </label>
              <input
                type="text"
                name="pickupLocationAddress"
                value={formData.pickupLocationAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="כתובת"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שעות פעילות
              </label>
              <input
                type="text"
                name="pickupLocationHours"
                value={formData.pickupLocationHours}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="08:00-18:00"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'בהוספה...' : 'הוסף חבילה'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddParcel;

