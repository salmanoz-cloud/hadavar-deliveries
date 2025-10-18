import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PaymentMethod {
  id: string;
  type: 'bit' | 'credit_card' | 'bank_transfer';
  name: string;
  lastFour?: string;
  isDefault: boolean;
}

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'methods' | 'history' | 'settings'>('overview');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'bit',
      name: 'Bit',
      isDefault: true,
    },
    {
      id: '2',
      type: 'credit_card',
      name: 'כרטיס אשראי',
      lastFour: '4242',
      isDefault: false,
    }
  ]);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'bit' | 'credit_card' | 'bank_transfer'>('bit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [creditCardForm, setCreditCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const [bankTransferForm, setBankTransferForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreditCardForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankTransferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankTransferForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // In a real app, validate and save to Firestore
      console.log('Adding payment method:', { paymentType, creditCardForm, bankTransferForm });
      setSuccess('שיטת תשלום נוספה בהצלחה!');
      setShowAddPayment(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהוספת שיטת תשלום');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    setSuccess('שיטת תשלום נמחקה בהצלחה!');
    setTimeout(() => setSuccess(null), 3000);
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
          <h1 className="text-2xl font-bold text-gray-900">ניהול תשלומים</h1>
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
              onClick={() => setActiveTab('methods')}
              className={`py-4 px-6 font-medium transition whitespace-nowrap ${
                activeTab === 'methods'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              שיטות תשלום
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 font-medium transition whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              היסטוריית תשלומים
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 font-medium transition whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              הגדרות
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold mb-4">סקירה כללית</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <p className="text-gray-600 text-sm">סטטוס</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">✓ פעיל</p>
                    <p className="text-gray-600 text-sm mt-2">התשלום שלך פעיל</p>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-gray-600 text-sm">סכום חודשי</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">70₪</p>
                    <p className="text-gray-600 text-sm mt-2">תשלום ב-7 לחודש</p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <p className="text-gray-600 text-sm">מסלול מנוי</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">10 חבילות</p>
                    <p className="text-gray-600 text-sm mt-2">שימוש: 2 מתוך 10</p>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700 font-bold">⚠️ הודעה חשובה</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    התשלום הבא שלך יהיה ב-7 בנובמבר 2025
                  </p>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'methods' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">שיטות תשלום</h2>
                  <button
                    onClick={() => setShowAddPayment(!showAddPayment)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    + הוסף שיטה
                  </button>
                </div>

                {showAddPayment && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">הוסף שיטת תשלום חדשה</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">סוג תשלום</label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="bit">Bit</option>
                        <option value="credit_card">כרטיס אשראי</option>
                        <option value="bank_transfer">העברה בנקאית</option>
                      </select>
                    </div>

                    <form onSubmit={handleAddPaymentMethod}>
                      {paymentType === 'credit_card' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">מספר כרטיס</label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={creditCardForm.cardNumber}
                              onChange={handleCreditCardChange}
                              placeholder="1234 5678 9012 3456"
                              maxLength="19"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">שם בעל הכרטיס</label>
                            <input
                              type="text"
                              name="cardHolder"
                              value={creditCardForm.cardHolder}
                              onChange={handleCreditCardChange}
                              placeholder="שם בעל הכרטיס"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">חודש</label>
                              <input
                                type="text"
                                name="expiryMonth"
                                value={creditCardForm.expiryMonth}
                                onChange={handleCreditCardChange}
                                placeholder="MM"
                                maxLength="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">שנה</label>
                              <input
                                type="text"
                                name="expiryYear"
                                value={creditCardForm.expiryYear}
                                onChange={handleCreditCardChange}
                                placeholder="YY"
                                maxLength="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                              <input
                                type="text"
                                name="cvv"
                                value={creditCardForm.cvv}
                                onChange={handleCreditCardChange}
                                placeholder="CVV"
                                maxLength="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentType === 'bank_transfer' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">שם הבנק</label>
                            <input
                              type="text"
                              name="bankName"
                              value={bankTransferForm.bankName}
                              onChange={handleBankTransferChange}
                              placeholder="שם הבנק"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">מספר חשבון</label>
                            <input
                              type="text"
                              name="accountNumber"
                              value={bankTransferForm.accountNumber}
                              onChange={handleBankTransferChange}
                              placeholder="מספר חשבון"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">שם בעל החשבון</label>
                            <input
                              type="text"
                              name="accountHolder"
                              value={bankTransferForm.accountHolder}
                              onChange={handleBankTransferChange}
                              placeholder="שם בעל החשבון"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}

                      {paymentType === 'bit' && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700">
                            Bit הוא שיטת תשלום מאובטחת וקלה. לא נדרשים פרטים נוספים.
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                      >
                        {loading ? 'בעיבוד...' : 'הוסף שיטה'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div key={method.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900">{method.name}</p>
                          {method.lastFour && (
                            <p className="text-sm text-gray-600">****{method.lastFour}</p>
                          )}
                          {method.isDefault && (
                            <p className="text-sm text-green-600 font-bold mt-1">✓ שיטה ברירת מחדל</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!method.isDefault && (
                            <button
                              onClick={() => handleSetDefault(method.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-bold"
                            >
                              הגדר כברירת מחדל
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-bold"
                          >
                            מחק
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-xl font-bold mb-4">היסטוריית תשלומים</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-right py-3 px-4 font-bold text-gray-900">תאריך</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">סכום</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">שיטה</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-900">סטטוס</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">7 באוקטובר 2025</td>
                        <td className="py-3 px-4">70₪</td>
                        <td className="py-3 px-4">Bit</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            בוצע
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">7 בספטמבר 2025</td>
                        <td className="py-3 px-4">70₪</td>
                        <td className="py-3 px-4">Bit</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            בוצע
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold mb-4">הגדרות תשלום</h2>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">יום תשלום</h3>
                    <p className="text-gray-600 text-sm mb-3">בחר את יום התשלום החודשי</p>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="7">7 בחודש</option>
                      <option value="15">15 בחודש</option>
                      <option value="25">25 בחודש</option>
                    </select>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-2">התראות</h3>
                    <div className="flex items-center">
                      <input type="checkbox" id="payment-reminder" defaultChecked className="w-4 h-4" />
                      <label htmlFor="payment-reminder" className="mr-2 text-gray-700">
                        קבל התראה לפני תשלום
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

