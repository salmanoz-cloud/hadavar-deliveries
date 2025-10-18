import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'parcel' | 'payment' | 'account' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    author: 'customer' | 'support';
    message: string;
    timestamp: Date;
  }>;
}

export const Support: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      title: 'חבילה לא הגיעה',
      description: 'החבילה שלי עם מספר מעקב 123456789 לא הגיעה בתאריך הצפוי',
      category: 'parcel',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date('2025-10-15'),
      updatedAt: new Date('2025-10-18'),
      messages: [
        {
          id: '1',
          author: 'customer',
          message: 'החבילה שלי עם מספר מעקב 123456789 לא הגיעה בתאריך הצפוי',
          timestamp: new Date('2025-10-15')
        },
        {
          id: '2',
          author: 'support',
          message: 'תודה על פנייתך. אנו בודקים את המצב של החבילה שלך',
          timestamp: new Date('2025-10-16')
        }
      ]
    },
    {
      id: '2',
      title: 'בעיה בתשלום',
      description: 'התשלום שלי לא עבר בהצלחה',
      category: 'payment',
      status: 'resolved',
      priority: 'high',
      createdAt: new Date('2025-10-10'),
      updatedAt: new Date('2025-10-12'),
      messages: []
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    description: '',
    category: 'other' as const,
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) {
      setError('יש למלא את כל השדות');
      return;
    }

    setLoading(true);
    try {
      // In a real app, save to Firestore
      const ticket: Ticket = {
        id: String(tickets.length + 1),
        title: newTicketForm.title,
        description: newTicketForm.description,
        category: newTicketForm.category,
        status: 'open',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: '1',
            author: 'customer',
            message: newTicketForm.description,
            timestamp: new Date()
          }
        ]
      };

      setTickets([ticket, ...tickets]);
      setSuccess('קריאה נוצרה בהצלחה!');
      setNewTicketForm({ title: '', description: '', category: 'other' });
      setActiveTab('list');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בעיבוד');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newMessage.trim() || !selectedTicket) return;

    setLoading(true);
    try {
      // In a real app, save to Firestore
      const updatedTickets = tickets.map(ticket => {
        if (ticket.id === selectedTicket.id) {
          return {
            ...ticket,
            messages: [
              ...ticket.messages,
              {
                id: String(ticket.messages.length + 1),
                author: 'customer' as const,
                message: newMessage,
                timestamp: new Date()
              }
            ],
            updatedAt: new Date()
          };
        }
        return ticket;
      });

      setTickets(updatedTickets);
      setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id) || null);
      setNewMessage('');
      setSuccess('הודעה נשלחה בהצלחה!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשליחת הודעה');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      open: { label: 'פתוחה', color: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'בטיפול', color: 'bg-yellow-100 text-yellow-800' },
      resolved: { label: 'פתורה', color: 'bg-green-100 text-green-800' },
      closed: { label: 'סגורה', color: 'bg-gray-100 text-gray-800' }
    };
    const info = statusMap[status] || { label: 'לא ידוע', color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${info.color}`}>{info.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; color: string }> = {
      low: { label: 'נמוכה', color: 'bg-green-100 text-green-800' },
      medium: { label: 'בינונית', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'גבוהה', color: 'bg-red-100 text-red-800' }
    };
    const info = priorityMap[priority] || { label: 'לא ידוע', color: 'bg-gray-100 text-gray-800' };
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-bold mb-2"
          >
            ← חזור לדשבורד
          </button>
          <h1 className="text-2xl font-bold text-gray-900">קריאות שירות</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b">
            <button
              onClick={() => {
                setActiveTab('list');
                setSelectedTicket(null);
              }}
              className={`flex-1 py-4 px-6 font-medium transition ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              קריאות שלי
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 px-6 font-medium transition ${
                activeTab === 'create'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              קריאה חדשה
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* List Tab */}
            {activeTab === 'list' && !selectedTicket && (
              <div>
                <h2 className="text-xl font-bold mb-4">קריאות שלי</h2>
                {tickets.length === 0 ? (
                  <p className="text-gray-600">אין קריאות עדיין</p>
                ) : (
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900">{ticket.title}</h3>
                          <div className="flex gap-2">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{ticket.messages.length} הודעות</span>
                          <span>{new Date(ticket.updatedAt).toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ticket Detail */}
            {activeTab === 'list' && selectedTicket && (
              <div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-blue-600 hover:text-blue-700 font-bold mb-4"
                >
                  ← חזור לרשימה
                </button>

                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h2>
                      <p className="text-gray-600 text-sm mt-1">{selectedTicket.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 border-t pt-4">
                    <p>נוצרה: {new Date(selectedTicket.createdAt).toLocaleDateString('he-IL')}</p>
                    <p>עודכנה: {new Date(selectedTicket.updatedAt).toLocaleDateString('he-IL')}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <h3 className="font-bold text-gray-900 mb-4">הודעות</h3>
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {selectedTicket.messages.map(message => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.author === 'customer'
                            ? 'bg-blue-50 border border-blue-200 mr-8'
                            : 'bg-gray-50 border border-gray-200 ml-8'
                        }`}
                      >
                        <p className="text-sm font-bold text-gray-900">
                          {message.author === 'customer' ? 'אתה' : 'תמיכה'}
                        </p>
                        <p className="text-gray-700 text-sm mt-1">{message.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleString('he-IL')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedTicket.status !== 'closed' && (
                    <form onSubmit={handleSendMessage} className="border-t pt-4">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="כתוב הודעה..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                      <button
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                      >
                        {loading ? 'שולח...' : 'שלח הודעה'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Create Tab */}
            {activeTab === 'create' && (
              <div>
                <h2 className="text-xl font-bold mb-4">קריאה חדשה</h2>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">נושא *</label>
                    <input
                      type="text"
                      value={newTicketForm.title}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                      placeholder="תאר את הבעיה בקצרה"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה *</label>
                    <select
                      value={newTicketForm.category}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="parcel">חבילה</option>
                      <option value="payment">תשלום</option>
                      <option value="account">חשבון</option>
                      <option value="other">אחר</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תיאור *</label>
                    <textarea
                      value={newTicketForm.description}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                      placeholder="תאר את הבעיה בפירוט"
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'יוצר...' : 'צור קריאה'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

