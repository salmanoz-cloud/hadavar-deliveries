import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
// Import Parcel type
interface Parcel {
  id: string;
  userId: string;
  mainUserId: string;
  companyId: string;
  recipientName: string;
  trackingNumber: string;
  courierCompany: string;
  pickupLocation: {
    name: string;
    address: string;
    hours: string;
    lastPickupDate: Date;
  };
  trackingLink: string;
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'delivered' | 'investigation';
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string;
    notes?: string;
  }>;
  assignedCourierId?: string | null;
  deliveryProof?: {
    imageUrl: string;
    timestamp: Date;
    signature?: string;
    recipientName?: string;
  } | null;
  uploadMethod: 'whatsapp' | 'app_image' | 'app_text' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

export const Dashboard: React.FC = () => {
  const { userData, user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    pickedUp: 0,
    inTransit: 0,
    delivered: 0,
  });

  useEffect(() => {
    const fetchParcels = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'parcels'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const parcelsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Parcel[];

        setParcels(parcelsList);

        // Calculate stats
        const newStats = {
          total: parcelsList.length,
          pending: parcelsList.filter(p => p.status === 'pending_pickup').length,
          pickedUp: parcelsList.filter(p => p.status === 'picked_up').length,
          inTransit: parcelsList.filter(p => p.status === 'in_transit').length,
          delivered: parcelsList.filter(p => p.status === 'delivered').length,
        };

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching parcels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending_pickup: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'בהמתנה לאיסוף' },
      picked_up: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'נאסף' },
      in_transit: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'בדרך' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'נמסר' },
      investigation: { bg: 'bg-red-100', text: 'text-red-800', label: 'בבירור' },
    };

    const statusInfo = statusMap[status] || statusMap.pending_pickup;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">שלום, {userData?.fullName}</h1>
        <p className="text-gray-600">מסלול מנוי: {userData?.subscriptionPlan} חבילות בחודש</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">סה"כ חבילות</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">בהמתנה</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">נאספו</div>
          <div className="text-3xl font-bold text-blue-600">{stats.pickedUp}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">בדרך</div>
          <div className="text-3xl font-bold text-purple-600">{stats.inTransit}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">נמסרו</div>
          <div className="text-3xl font-bold text-green-600">{stats.delivered}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
          + הוסף חבילה חדשה
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
          💳 ניהול תשלומים
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
          👥 ניהול משפחה
        </button>
      </div>

      {/* Parcels List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">החבילות שלי</h2>
        </div>

        {parcels.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            אין חבילות עדיין. <a href="/add-parcel" className="text-blue-600 hover:underline">הוסף חבילה</a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">מספר מעקב</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">ספק משלוחים</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">סטטוס</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">תאריך יצירה</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map(parcel => (
                  <tr key={parcel.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{parcel.trackingNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{parcel.courierCompany}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(parcel.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(parcel.createdAt).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a href={`/parcel/${parcel.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                        פרטים
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

