import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { adminData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'employees' | 'couriers' | 'parcels' | 'payments'>('overview');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Mock data for charts
  const parcelsData = [
    { name: 'ינואר', parcels: 120, delivered: 95 },
    { name: 'פברואר', parcels: 150, delivered: 130 },
    { name: 'מרץ', parcels: 180, delivered: 160 },
    { name: 'אפריל', parcels: 200, delivered: 185 },
    { name: 'מאי', parcels: 220, delivered: 210 },
  ];

  const statusData = [
    { name: 'נמסרה', value: 450, color: '#10B981' },
    { name: 'בדרך', value: 120, color: '#3B82F6' },
    { name: 'ממתינה', value: 80, color: '#F59E0B' },
    { name: 'בבירור', value: 30, color: '#EF4444' },
  ];

  const revenueData = [
    { name: 'ינואר', revenue: 15000 },
    { name: 'פברואר', revenue: 18000 },
    { name: 'מרץ', revenue: 22000 },
    { name: 'אפריל', revenue: 25000 },
    { name: 'מאי', revenue: 28000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">הדוור הבא</h1>
            <p className="text-gray-600">ברוכים הבאים, {adminData?.fullName}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">לקוחות פעילים</p>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">חבילות פעילות</p>
            <p className="text-3xl font-bold text-green-600">680</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">איסופים היום</p>
            <p className="text-3xl font-bold text-purple-600">45</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">מסירות היום</p>
            <p className="text-3xl font-bold text-orange-600">38</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">הכנסות חודש</p>
            <p className="text-3xl font-bold text-indigo-600">₪28,000</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'overview', label: 'סקירה כללית' },
              { id: 'companies', label: 'חברות' },
              { id: 'employees', label: 'עובדים' },
              { id: 'couriers', label: 'שליחים' },
              { id: 'parcels', label: 'חבילות' },
              { id: 'payments', label: 'תשלומים' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-bold whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-4 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">מגמת חבילות</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={parcelsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="parcels" stroke="#3B82F6" name="סה"כ חבילות" />
                      <Line type="monotone" dataKey="delivered" stroke="#10B981" name="נמסרו" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">סטטוס חבילות</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4">הכנסות חודשיות</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#3B82F6" name="הכנסות" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'companies' && (
              <div>
                <h2 className="text-xl font-bold mb-4">ניהול חברות</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">תכונה זו תהיה זמינה בקרוב</p>
                </div>
              </div>
            )}

            {activeTab === 'employees' && (
              <div>
                <h2 className="text-xl font-bold mb-4">ניהול עובדים</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">תכונה זו תהיה זמינה בקרוב</p>
                </div>
              </div>
            )}

            {activeTab === 'couriers' && (
              <div>
                <h2 className="text-xl font-bold mb-4">ניהול שליחים</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">תכונה זו תהיה זמינה בקרוב</p>
                </div>
              </div>
            )}

            {activeTab === 'parcels' && (
              <div>
                <h2 className="text-xl font-bold mb-4">ניהול חבילות</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">תכונה זו תהיה זמינה בקרוב</p>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h2 className="text-xl font-bold mb-4">ניהול תשלומים</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">תכונה זו תהיה זמינה בקרוב</p>
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

