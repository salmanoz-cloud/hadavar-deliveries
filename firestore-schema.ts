// Firestore Schema and TypeScript Interfaces for "הדוור הבא"
// Defines all collections and document structures

// ============================================================================
// 1. USERS Collection - משתמשים
// ============================================================================
export interface User {
  uid: string; // Firebase Auth UID
  userType: 'main' | 'sub'; // סוג משתמש: ראשי או משני
  mainUserId?: string | null; // אם משתמש משני - UID של המשתמש הראשי
  fullName: string;
  phone: string;
  email?: string | null; // רק למשתמש ראשי
  companyId: string; // מזהה החברה
  subscriptionPlan: '10' | '15' | '20'; // מסלול מנוי
  subscriptionStatus: 'active' | 'inactive' | 'pending';
  maxParcels: number; // מספר חבילות מקסימלי לפי מסלול
  currentMonthParcels: number; // מונה חבילות חודש נוכחי
  paymentMethod: 'credit' | 'bit' | 'google_pay' | 'apple_pay';
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  createdAt: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  whatsappNumber?: string; // מספר WhatsApp לבוט
  profileImageUrl?: string;
  isActive: boolean;
}

// ============================================================================
// 2. COMPANIES Collection - חברות
// ============================================================================
export interface Company {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    zipCode?: string;
    floor?: string;
    notes?: string; // הערות לשליח
  };
  deliveryDays: string[]; // ימי שירות: ["sunday", "tuesday", "thursday"]
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  activeEmployees: number;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 3. PARCELS Collection - חבילות
// ============================================================================
export interface Parcel {
  id: string;
  userId: string; // UID של בעל החבילה (ראשי או משני)
  mainUserId: string; // UID של המשתמש הראשי (לצורך תשלום)
  companyId: string;
  
  // פרטי המשלוח (מחולצים מהודעה)
  recipientName: string;
  trackingNumber: string;
  courierCompany: string; // דואר ישראל, Boxit, HFD וכו'
  
  // נקודת איסוף
  pickupLocation: {
    name: string;
    address: string;
    hours: string;
    lastPickupDate: Date;
  };
  
  trackingLink: string;
  
  // סטטוס
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'delivered' | 'investigation';
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string; // UID של מי שעדכן
    notes?: string;
  }>;
  
  // הקצאה לשליח
  assignedCourierId?: string | null;
  
  // מסירה
  deliveryProof?: {
    imageUrl: string;
    timestamp: Date;
    signature?: string;
    recipientName?: string;
  } | null;
  
  // מטא-דאטה
  uploadMethod: 'whatsapp' | 'app_image' | 'app_text' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 4. COURIERS Collection - שליחים
// ============================================================================
export interface Courier {
  id: string;
  fullName: string;
  phone: string;
  username: string; // שם משתמש לכניסה
  passwordHash: string; // מוצפן
  assignedAreas: string[]; // אזורי פעילות
  isActive: boolean;
  stats: {
    totalPickups: number;
    totalDeliveries: number;
    todayPickups: number;
    todayDeliveries: number;
    averageDeliveryTime?: number; // בדקות
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 5. PAYMENTS Collection - תשלומים
// ============================================================================
export interface Payment {
  id: string;
  userId: string; // משתמש ראשי
  amount: number;
  plan: '10' | '15' | '20';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit' | 'bit' | 'google_pay' | 'apple_pay';
  
  // פרטי משולם
  meshulamTransactionId?: string;
  meshulamResponse?: Record<string, any>;
  
  billingDate: Date;
  paidAt?: Date;
  createdAt: Date;
  failureReason?: string;
  retryCount?: number;
}

// ============================================================================
// 6. TICKETS Collection - קריאות שירות
// ============================================================================
export interface Ticket {
  id: string;
  userId: string; // משתמש ראשי בלבד
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string | null; // admin UID
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
  messages: Array<{
    from: string; // UID
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  resolvedAt?: Date;
}

// ============================================================================
// 7. WHATSAPP_MESSAGES Collection - הודעות WhatsApp
// ============================================================================
export interface WhatsAppMessage {
  id: string;
  from: string; // מספר טלפון
  userId?: string | null; // UID אם זוהה
  messageBody: string;
  mediaUrl?: string | null;
  
  // תוצאות AI
  parsedData?: {
    recipientName: string;
    trackingNumber: string;
    courierCompany: string;
    pickupLocation: {
      name: string;
      address: string;
      hours: string;
    };
    trackingLink: string;
    confidence: number; // רמת ביטחון של ה-AI
  } | null;
  
  parcelId?: string | null; // אם נוצרה חבילה
  processingStatus: 'pending' | 'processed' | 'failed';
  errorMessage?: string | null;
  receivedAt: Date;
  processedAt?: Date;
}

// ============================================================================
// 8. ADMIN_USERS Collection - מנהלי מערכת
// ============================================================================
export interface AdminUser {
  uid: string;
  fullName: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support';
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// ============================================================================
// 9. SYSTEM_SETTINGS Collection - הגדרות מערכת
// ============================================================================
export interface SystemSettings {
  id: 'main'; // תמיד יהיה רק document אחד
  systemName: string;
  systemLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  
  // הגדרות תשלומים
  meshulam: {
    apiKey: string;
    merchantId: string;
    plans: {
      '10': number; // מחיר
      '15': number;
      '20': number;
    };
    billingDay: number; // יום בחודש לחיוב
  };
  
  // הגדרות WhatsApp
  whatsapp: {
    apiKey: string;
    botNumber: string;
    provider: 'twilio' | 'wati' | '360dialog';
  };
  
  // הגדרות AI
  ai: {
    provider: 'openai' | 'google';
    apiKey: string;
    model: string;
  };
  
  // הגדרות FCM
  fcm: {
    serverKey: string;
  };
  
  updatedAt: Date;
}

// ============================================================================
// Collection Names (for reference)
// ============================================================================
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
  PARCELS: 'parcels',
  COURIERS: 'couriers',
  PAYMENTS: 'payments',
  TICKETS: 'tickets',
  WHATSAPP_MESSAGES: 'whatsapp_messages',
  ADMIN_USERS: 'admin_users',
  SYSTEM_SETTINGS: 'system_settings',
} as const;

