import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserParcels, getParcelByTrackingNumber, ParcelData } from '../services/firestore';
import { useNavigate } from 'wouter';

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'parcels' | 'family' | 'payment' | 'track'>('overview');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedParcel, setTrackedParcel] = useState<ParcelData | null>(null);
  const [trackingError, setTrackingError] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    pickedUp: 0,
    inTransit: 0,
    delivered: 0,
  });

  // Load parcels when user changes
  useEffect(() => {
    if (user && !authLoading) {
      loadParcels();
    }
  }, [user, authLoading]);

  const loadParcels = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const userParcels = await getUserParcels(user.uid);
      setParcels(userParcels);

      // Calculate statistics
      const newStats = {
        total: userParcels.length,
        pending: userParcels.filter(p => p.status === 'pending_pickup').length,
        pickedUp: userParcels.filter(p => p.status === 'picked_up').length,
        inTransit: userParcels.filter(p => p.status === 'in_transit').length,
        delivered: userParcels.filter(p => p.status === 'delivered').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error loading parcels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackParcel = async () => {
    try {
      setTrackingError('');
      setTrackedParcel(null);

      if (!trackingNumber.trim()) {
        setTrackingError('אנא הזן מספר מעקב';
        return;
      }

      const parcel = await getParcelByTrackingNumber(trackingNumber.trim());
      if (!parcel) {
        setTrackingError('חבילה לא נמצאה');
        return;
      }

      setTrackedParcel(parcel);
    } catch (error) {
      console.error('Error tracking parcel:', error);
      setTrackingError('שגיאה בחיפוש החבילה');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_pickup':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'investigation':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_pickup':
        return 'ממתין לאיסוף';
      case 'picked_up':
        return 'נאסף';
      case 'in_transit':
        return 'בדרך';
      case 'delivered':
        return 'נמסר';
      case 'investigation':
        return 'בחקירה';
      default:
        return status;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>טוען...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">אנא התחבר כדי להמשיך</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            חזור לכניסה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">דשבורד</h1>
          <p className="text-gray-600 mt-2">ברוכים הבאים, {user.fullName}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            סקירה כללית
          </button>
          <button
            onClick={() => setActiveTab('parcels')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'parcels'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            חבילות ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'track'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            עקוב אחרי חבילה
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'family'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            משפחה
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'payment'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            תשלום
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">סקירה כללית</h2>

              {/* Subscription Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">מסלול המנוי שלך</h3>
                <p className="text-blue-800">
                  מסלול {user.subscriptionPlan} - {user.maxParcels} חבילות בחודש
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  השתמשת ב-{user.currentMonthParcels} מתוך {user.maxParcels} חבילות בחודש זה
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">סה"כ חבילות</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">ממתינות לאיסוף</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">נאספו</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.pickedUp}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">בדרך</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.inTransit}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">נמסרו</p>
                  <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">פעולות מהירות</h3>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => navigate('/add-parcel')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    + הוסף חבילה
                  </button>
                  <button
                    onClick={() => navigate('/payment')}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    עדכן תשלום
                  </button>
                  <button
                    onClick={() => navigate('/support')}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                  >
                    קריאת שירות
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Parcels Tab */}
          {activeTab === 'parcels' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">החבילות שלי</h2>
                <button
                  onClick={() => navigate('/add-parcel')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  + הוסף חבילה
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : parcels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>אין לך חבילות עדיין</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-right">מספר מעקב</th>
                        <th className="px-4 py-2 text-right">שם המקבל</th>
                        <th className="px-4 py-2 text-right">מקום איסוף</th>
                        <th className="px-4 py-2 text-right">סטטוס</th>
                        <th className="px-4 py-2 text-right">תאריך</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parcels.map((parcel) => (
                        <tr key={parcel.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{parcel.trackingNumber}</td>
                          <td className="px-4 py-2">{parcel.recipientName}</td>
                          <td className="px-4 py-2">{parcel.pickupLocation.name}</td>
                          <td className="px-4 py-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(parcel.status)}`}>
                              {getStatusLabel(parcel.status)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {new Date(parcel.createdAt).toLocaleDateString('he-IL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Track Parcel Tab */}
          {activeTab === 'track' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">עקוב אחרי חבילה</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  הזן מספר מעקב
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="מספר מעקב"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleTrackParcel}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                  >
                    חפש
                  </button>
                </div>
                {trackingError && (
                  <p className="text-red-500 text-sm mt-2">{trackingError}</p>
                )}
              </div>

              {trackedParcel && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">פרטי החבילה</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-600 text-sm">שם המקבל</p>
                      <p className="font-semibold">{trackedParcel.recipientName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">מספר מעקב</p>
                      <p className="font-semibold">{trackedParcel.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">חברת הפצה</p>
                      <p className="font-semibold">{trackedParcel.courierCompany}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">סטטוס</p>
                      <p className={`font-semibold ${getStatusColor(trackedParcel.status)} inline-block px-3 py-1 rounded`}>
                        {getStatusLabel(trackedParcel.status)}
                      </p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">היסטוריית סטטוס</h4>
                    <div className="space-y-3">
                      {trackedParcel.statusHistory.map((history, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            {index < trackedParcel.statusHistory.length - 1 && (
                              <div className="w-0.5 h-12 bg-gray-300"></div>
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-semibold">{getStatusLabel(history.status)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(history.timestamp).toLocaleString('he-IL')}
                            </p>
                            {history.notes && (
                              <p className="text-sm text-gray-700 mt-1">{history.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {trackedParcel.trackingLink && (
                    <div className="mt-6">
                      <a
                        href={trackedParcel.trackingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        צפה בעדכונים בחברת ההפצה →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Family Tab */}
          {activeTab === 'family' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">משפחה</h2>
              <p className="text-gray-600">תכונה זו תהיה זמינה בקרוב</p>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">תשלום</h2>
              <p className="text-gray-600">עבור לעמוד התשלומים לניהול תשלומים</p>
              <button
                onClick={() => navigate('/payment')}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                עבור לעמוד התשלומים
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

