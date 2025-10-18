import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { courierData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'pickups' | 'deliveries'>('pickups');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">הדוור הבא</h1>
            <p className="text-gray-600">ברוכים הבאים, {courierData?.fullName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            התנתקות
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">סה"כ איסופים היום</p>
            <p className="text-3xl font-bold text-blue-600">{courierData?.stats.todayPickups || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">סה"כ מסירות היום</p>
            <p className="text-3xl font-bold text-green-600">{courierData?.stats.todayDeliveries || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">סה"כ איסופים</p>
            <p className="text-3xl font-bold text-purple-600">{courierData?.stats.totalPickups || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">סה"כ מסירות</p>
            <p className="text-3xl font-bold text-orange-600">{courierData?.stats.totalDeliveries || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pickups')}
              className={`flex-1 py-4 px-6 font-bold text-center ${
                activeTab === 'pickups'
                  ? 'border-b-4 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              איסופים
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`flex-1 py-4 px-6 font-bold text-center ${
                activeTab === 'deliveries'
                  ? 'border-b-4 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              מסירות
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pickups' && (
              <div>
                <h2 className="text-xl font-bold mb-4">איסופים</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">אין איסופים זמינים כרגע</p>
                </div>
              </div>
            )}

            {activeTab === 'deliveries' && (
              <div>
                <h2 className="text-xl font-bold mb-4">מסירות</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">אין מסירות זמינות כרגע</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

