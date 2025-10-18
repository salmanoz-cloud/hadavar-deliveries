import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface Parcel {
  id: string;
  userId: string;
  mainUserId: string;
  recipientName: string;
  trackingNumber: string;
  courierCompany: string;
  pickupLocation: {
    name: string;
    address: string;
    hours: string;
    lastPickupDate: string;
  };
  trackingLink: string;
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'delivered' | 'investigation';
  uploadMethod: 'whatsapp' | 'app_image' | 'app_text' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'parcels' | 'family' | 'payment' | 'track'>('overview');
  const [showAddParcel, setShowAddParcel] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    pickedUp: 0,
    inTransit: 0,
    delivered: 0,
  });

  useEffect(() => {
    if (user) {
      loadParcels();
    }
  }, [user]);

  const loadParcels = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from Firestore
      // For now, using mock data
      const mockParcels: Parcel[] = [
        {
          id: '1',
          userId: user?.uid || '',
          mainUserId: user?.uid || '',
          recipientName: 'דוד כהן',
          trackingNumber: '123456789',
          courierCompany: 'דואר ישראל',
          pickupLocation: {
            name: 'דואר ישראל - רחובות',
            address: 'רחוב הרצל 10, רחובות',
            hours: '08:00-18:00',
            lastPickupDate: '2025-10-25'
          },
          trackingLink: 'https://example.com/track/123456789',
          status: 'pending_pickup',
          uploadMethod: 'whatsapp',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: user?.uid || '',
          mainUserId: user?.uid || '',
          recipientName: 'רחל לוי',
          trackingNumber: '987654321',
          courierCompany: 'צ\'יטה',
          pickupLocation: {
            name: 'צ\'יטה - נס ציונה',
            address: 'רחוב בן גוריון 5, נס ציונה',
            hours: '09:00-17:00',
            lastPickupDate: '2025-10-20'
          },
          trackingLink: 'https://example.com/track/987654321',
          status: 'picked_up',
          uploadMethod: 'app_text',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setParcels(mockParcels);
      
      // Calculate stats
      setStats({
        total: mockParcels.length,
        pending: mockParcels.filter(p => p.status === 'pending_pickup').length,
        pickedUp: mockParcels.filter(p => p.status === 'picked_up').length,
        inTransit: mockParcels.filter(p => p.status === 'in_transit').length,
        delivered: mockParcels.filter(p => p.status === 'delivered').length,
      });
    } catch (error) {
      console.error('Failed to load parcels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending_pickup: { label: 'ממתינה לאיסוף', color: 'bg-yellow-100 text-yellow-800' },
      picked_up: { label: 'נאספה', color: 'bg-blue-100 text-blue-800' },
      in_transit: { label: 'בתהליך מסירה', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'נמסרה', color: 'bg-green-100 text-green-800' },
      investigation: { label: 'בבירור', color: 'bg-red-100 text-red-800' }
    };
    const info = statusMap[status] || { label: 'לא ידוע', color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>{info.label}</span>;
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">הדוור הבא</h1>
            <p className="text-gray-600 text-sm">דשבורד משתמש</p>
          </div>
          <div className="text-right">
            <p className="text-gray-900 font-medium">{user.email}</p>
            <button className="text-red-600 hover:text-red-700 text-sm font-bold mt-1">
              התנתק
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">סה"כ חבילות</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">ממתינות לאיסוף</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">נאספו</p>
            <p className="text-3xl font-bold text-blue-600">{stats.pickedUp}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">בתהליך מסירה</p>
            <p className="text-3xl font-bold text-purple-600">{stats.inTransit}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">נמסרו</p>
            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 font-medium transition whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              סקירה כללית
            </button>
            <button
              onClick={() => setActiveTab('parcels')}
              className={`py-4 px-6 font-medium transition whitespace-nowrap ${
                activeTab === 'parcels'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              חבילות
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`py-4 px-6 font-medium transition whitespace-nowrap ${
                activeTab === 'track'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              עקוב אחרי חבילה
            </button>
            <button
              onClick={() => setActiveTab('family')}
              className={`py-4 px-6 font-medium transition whitespace-nowrap ${
                activeTab === 'family'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              משפחה
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-4 px-6 font-medium transition whitespace-nowrap ${
                activeTab === 'payment'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              תשלום
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold mb-4">סקירה כללית</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-gray-900 mb-2">סטטוס השירות</h3>
                    <p className="text-green-600 font-bold text-lg">✓ פעיל</p>
                    <p className="text-gray-600 text-sm mt-2">השירות שלך פעיל וממתין לחבילות</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 className="font-bold text-gray-900 mb-2">מסלול המנוי</h3>
                    <p className="text-green-600 font-bold text-lg">10 חבילות לחודש</p>
                    <p className="text-gray-600 text-sm mt-2">שימוש: 2 מתוך 10</p>
                  </div>
                </div>
              </div>
            )}

            {/* Parcels Tab */}
            {activeTab === 'parcels' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">החבילות שלי</h2>
                  <button
                    onClick={() => setShowAddParcel(!showAddParcel)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    + הוסף חבילה
                  </button>
                </div>

                {showAddParcel && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-3 font-bold">בחר דרך להוספת חבילה:</p>
                    <div className="flex gap-2 flex-wrap">
                      <button className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition text-sm font-medium">
                        📱 WhatsApp
                      </button>
                      <button className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition text-sm font-medium">
                        📸 צילום מסך
                      </button>
                      <button className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition text-sm font-medium">
                        ✏️ הזנה ידנית
                      </button>
                    </div>
                  </div>
                )}

                {loading ? (
                  <p className="text-gray-600">טוען...</p>
                ) : parcels.length === 0 ? (
                  <p className="text-gray-600">אין חבילות עדיין</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-right py-3 px-4 font-bold text-gray-900">מספר מעקב</th>
                          <th className="text-right py-3 px-4 font-bold text-gray-900">שם</th>
                          <th className="text-right py-3 px-4 font-bold text-gray-900">מקום איסוף</th>
                          <th className="text-right py-3 px-4 font-bold text-gray-900">סטטוס</th>
                          <th className="text-right py-3 px-4 font-bold text-gray-900">תאריך אחרון</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parcels.map(parcel => (
                          <tr key={parcel.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{parcel.trackingNumber}</td>
                            <td className="py-3 px-4">{parcel.recipientName}</td>
                            <td className="py-3 px-4">{parcel.pickupLocation.name}</td>
                            <td className="py-3 px-4">{getStatusBadge(parcel.status)}</td>
                            <td className="py-3 px-4">{parcel.pickupLocation.lastPickupDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Track Tab */}
            {activeTab === 'track' && (
              <div>
                <h2 className="text-xl font-bold mb-4">עקוב אחרי חבילה</h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-700">הזן מספר מעקב כדי לעקוב אחרי החבילה שלך</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="הזן מספר מעקב"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
                    חפש
                  </button>
                </div>

                {trackingNumber && (
                  <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">מסלול החבילה</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                          <div className="w-1 h-12 bg-green-600"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">ממתין בנקודת האיסוף</p>
                          <p className="text-gray-600 text-sm">דואר ישראל - רחובות</p>
                          <p className="text-gray-600 text-sm">רחוב הרצל 10, רחובות</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                          <div className="w-1 h-12 bg-gray-300"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">ממתין להפצה</p>
                          <p className="text-gray-600 text-sm">במחסני הדוור הבא</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">מופץ היום</p>
                          <p className="text-gray-600 text-sm">לחברתך</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Family Tab */}
            {activeTab === 'family' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">משתמשים משניים</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                    + הוסף משתמש
                  </button>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">אתה יכול להוסיף בני משפחה כמשתמשים משניים. הם יוכלו לראות רק את החבילות שלהם.</p>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div>
                <h2 className="text-xl font-bold mb-4">תשלום</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-bold">✓ התשלום שלך פעיל</p>
                    <p className="text-sm text-green-700 mt-1">תשלום חודשי ב-7 לחודש</p>
                    <p className="text-sm text-green-700 mt-2">סכום: 70₪</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 font-bold">פרטי התשלום</p>
                    <p className="text-sm text-gray-600 mt-1">שיטה: הוראת קבע</p>
                    <p className="text-sm text-gray-600 mt-1">מצב: פעיל</p>
                  </div>
                </div>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
                  עדכן פרטי תשלום
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

