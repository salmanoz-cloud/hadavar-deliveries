import { db } from '../firebase-config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  QueryConstraint,
} from 'firebase/firestore';

// ============================================================================
// USER OPERATIONS
// ============================================================================

export interface UserData {
  uid: string;
  userType: 'main' | 'sub';
  mainUserId?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  companyId: string;
  companyName: string;
  companyAddress?: string;
  floor?: string;
  notes?: string;
  subscriptionPlan: '10' | '15' | '20';
  subscriptionStatus: 'active' | 'inactive' | 'pending';
  maxParcels: number;
  currentMonthParcels: number;
  paymentMethod: 'credit' | 'bit' | 'google_pay' | 'apple_pay';
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  createdAt: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  whatsappNumber?: string;
  profileImageUrl?: string;
  isActive: boolean;
}

export const createUser = async (userData: UserData): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: Timestamp.fromDate(userData.createdAt),
      lastPaymentDate: userData.lastPaymentDate ? Timestamp.fromDate(userData.lastPaymentDate) : null,
      nextPaymentDate: userData.nextPaymentDate ? Timestamp.fromDate(userData.nextPaymentDate) : null,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastPaymentDate: data.lastPaymentDate?.toDate(),
      nextPaymentDate: data.nextPaymentDate?.toDate(),
    } as UserData;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUser = async (uid: string, updates: Partial<UserData>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const updateData: any = { ...updates };
    
    if (updates.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updates.createdAt);
    }
    if (updates.lastPaymentDate) {
      updateData.lastPaymentDate = Timestamp.fromDate(updates.lastPaymentDate);
    }
    if (updates.nextPaymentDate) {
      updateData.nextPaymentDate = Timestamp.fromDate(updates.nextPaymentDate);
    }
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getSubUsers = async (mainUserId: string): Promise<UserData[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('mainUserId', '==', mainUserId),
      where('userType', '==', 'sub')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastPaymentDate: data.lastPaymentDate?.toDate(),
        nextPaymentDate: data.nextPaymentDate?.toDate(),
      } as UserData;
    });
  } catch (error) {
    console.error('Error getting sub users:', error);
    throw error;
  }
};

// ============================================================================
// PARCEL OPERATIONS
// ============================================================================

export interface ParcelData {
  id?: string;
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

export const createParcel = async (parcelData: ParcelData): Promise<string> => {
  try {
    const parcelRef = collection(db, 'parcels');
    const docRef = await addDoc(parcelRef, {
      ...parcelData,
      pickupLocation: {
        ...parcelData.pickupLocation,
        lastPickupDate: Timestamp.fromDate(parcelData.pickupLocation.lastPickupDate),
      },
      statusHistory: parcelData.statusHistory.map(sh => ({
        ...sh,
        timestamp: Timestamp.fromDate(sh.timestamp),
      })),
      deliveryProof: parcelData.deliveryProof ? {
        ...parcelData.deliveryProof,
        timestamp: Timestamp.fromDate(parcelData.deliveryProof.timestamp),
      } : null,
      createdAt: Timestamp.fromDate(parcelData.createdAt),
      updatedAt: Timestamp.fromDate(parcelData.updatedAt),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating parcel:', error);
    throw error;
  }
};

export const getParcel = async (parcelId: string): Promise<ParcelData | null> => {
  try {
    const parcelRef = doc(db, 'parcels', parcelId);
    const parcelSnap = await getDoc(parcelRef);
    
    if (!parcelSnap.exists()) {
      return null;
    }
    
    const data = parcelSnap.data();
    return {
      id: parcelSnap.id,
      ...data,
      pickupLocation: {
        ...data.pickupLocation,
        lastPickupDate: data.pickupLocation.lastPickupDate?.toDate() || new Date(),
      },
      statusHistory: data.statusHistory?.map((sh: any) => ({
        ...sh,
        timestamp: sh.timestamp?.toDate() || new Date(),
      })) || [],
      deliveryProof: data.deliveryProof ? {
        ...data.deliveryProof,
        timestamp: data.deliveryProof.timestamp?.toDate() || new Date(),
      } : null,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ParcelData;
  } catch (error) {
    console.error('Error getting parcel:', error);
    throw error;
  }
};

export const getUserParcels = async (userId: string): Promise<ParcelData[]> => {
  try {
    const q = query(
      collection(db, 'parcels'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        pickupLocation: {
          ...data.pickupLocation,
          lastPickupDate: data.pickupLocation.lastPickupDate?.toDate() || new Date(),
        },
        statusHistory: data.statusHistory?.map((sh: any) => ({
          ...sh,
          timestamp: sh.timestamp?.toDate() || new Date(),
        })) || [],
        deliveryProof: data.deliveryProof ? {
          ...data.deliveryProof,
          timestamp: data.deliveryProof.timestamp?.toDate() || new Date(),
        } : null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ParcelData;
    });
  } catch (error) {
    console.error('Error getting user parcels:', error);
    throw error;
  }
};

export const getParcelByTrackingNumber = async (trackingNumber: string): Promise<ParcelData | null> => {
  try {
    const q = query(
      collection(db, 'parcels'),
      where('trackingNumber', '==', trackingNumber),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      pickupLocation: {
        ...data.pickupLocation,
        lastPickupDate: data.pickupLocation.lastPickupDate?.toDate() || new Date(),
      },
      statusHistory: data.statusHistory?.map((sh: any) => ({
        ...sh,
        timestamp: sh.timestamp?.toDate() || new Date(),
      })) || [],
      deliveryProof: data.deliveryProof ? {
        ...data.deliveryProof,
        timestamp: data.deliveryProof.timestamp?.toDate() || new Date(),
      } : null,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ParcelData;
  } catch (error) {
    console.error('Error getting parcel by tracking number:', error);
    throw error;
  }
};

export const updateParcel = async (parcelId: string, updates: Partial<ParcelData>): Promise<void> => {
  try {
    const parcelRef = doc(db, 'parcels', parcelId);
    const updateData: any = { ...updates };
    
    if (updates.pickupLocation) {
      updateData.pickupLocation = {
        ...updates.pickupLocation,
        lastPickupDate: Timestamp.fromDate(updates.pickupLocation.lastPickupDate),
      };
    }
    
    if (updates.statusHistory) {
      updateData.statusHistory = updates.statusHistory.map(sh => ({
        ...sh,
        timestamp: Timestamp.fromDate(sh.timestamp),
      }));
    }
    
    if (updates.deliveryProof) {
      updateData.deliveryProof = {
        ...updates.deliveryProof,
        timestamp: Timestamp.fromDate(updates.deliveryProof.timestamp),
      };
    }
    
    if (updates.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updates.createdAt);
    }
    
    if (updates.updatedAt) {
      updateData.updatedAt = Timestamp.fromDate(updates.updatedAt);
    }
    
    await updateDoc(parcelRef, updateData);
  } catch (error) {
    console.error('Error updating parcel:', error);
    throw error;
  }
};

export const deleteParcel = async (parcelId: string): Promise<void> => {
  try {
    const parcelRef = doc(db, 'parcels', parcelId);
    await deleteDoc(parcelRef);
  } catch (error) {
    console.error('Error deleting parcel:', error);
    throw error;
  }
};

// ============================================================================
// PAYMENT OPERATIONS
// ============================================================================

export interface PaymentData {
  id?: string;
  userId: string;
  mainUserId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit' | 'bit' | 'google_pay' | 'apple_pay' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  billingDate?: Date;
  nextBillingDate?: Date;
}

export const createPayment = async (paymentData: PaymentData): Promise<string> => {
  try {
    const paymentRef = collection(db, 'payments');
    const docRef = await addDoc(paymentRef, {
      ...paymentData,
      createdAt: Timestamp.fromDate(paymentData.createdAt),
      updatedAt: Timestamp.fromDate(paymentData.updatedAt),
      billingDate: paymentData.billingDate ? Timestamp.fromDate(paymentData.billingDate) : null,
      nextBillingDate: paymentData.nextBillingDate ? Timestamp.fromDate(paymentData.nextBillingDate) : null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const getUserPayments = async (userId: string): Promise<PaymentData[]> => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        billingDate: data.billingDate?.toDate(),
        nextBillingDate: data.nextBillingDate?.toDate(),
      } as PaymentData;
    });
  } catch (error) {
    console.error('Error getting user payments:', error);
    throw error;
  }
};

// ============================================================================
// SUPPORT TICKET OPERATIONS
// ============================================================================

export interface TicketData {
  id?: string;
  userId: string;
  mainUserId: string;
  title: string;
  description: string;
  category: 'parcel' | 'payment' | 'account' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: Array<{
    id: string;
    author: 'customer' | 'support';
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export const createTicket = async (ticketData: TicketData): Promise<string> => {
  try {
    const ticketRef = collection(db, 'support_tickets');
    const docRef = await addDoc(ticketRef, {
      ...ticketData,
      messages: ticketData.messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
      })),
      createdAt: Timestamp.fromDate(ticketData.createdAt),
      updatedAt: Timestamp.fromDate(ticketData.updatedAt),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

export const getUserTickets = async (userId: string): Promise<TicketData[]> => {
  try {
    const q = query(
      collection(db, 'support_tickets'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        messages: data.messages?.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate() || new Date(),
        })) || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as TicketData;
    });
  } catch (error) {
    console.error('Error getting user tickets:', error);
    throw error;
  }
};

export const getTicket = async (ticketId: string): Promise<TicketData | null> => {
  try {
    const ticketRef = doc(db, 'support_tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);
    
    if (!ticketSnap.exists()) {
      return null;
    }
    
    const data = ticketSnap.data();
    return {
      id: ticketSnap.id,
      ...data,
      messages: data.messages?.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate() || new Date(),
      })) || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as TicketData;
  } catch (error) {
    console.error('Error getting ticket:', error);
    throw error;
  }
};

export const updateTicket = async (ticketId: string, updates: Partial<TicketData>): Promise<void> => {
  try {
    const ticketRef = doc(db, 'support_tickets', ticketId);
    const updateData: any = { ...updates };
    
    if (updates.messages) {
      updateData.messages = updates.messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp),
      }));
    }
    
    if (updates.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updates.createdAt);
    }
    
    if (updates.updatedAt) {
      updateData.updatedAt = Timestamp.fromDate(updates.updatedAt);
    }
    
    await updateDoc(ticketRef, updateData);
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};

