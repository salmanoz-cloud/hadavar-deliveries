// Firebase Cloud Functions for "הדוור הבא" (Next Mail Employees)
// These functions handle backend logic, webhooks, and scheduled tasks

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ============================================================================
// 1. WhatsApp Message Processing Function
// ============================================================================
export const processWhatsAppMessage = functions.https.onRequest(async (req, res) => {
  try {
    const { from, body, mediaUrl } = req.body;

    // Save message to Firestore
    const messageRef = await db.collection('whatsapp_messages').add({
      from,
      messageBody: body,
      mediaUrl: mediaUrl || null,
      userId: null,
      parsedData: null,
      parcelId: null,
      processingStatus: 'pending',
      receivedAt: admin.firestore.Timestamp.now(),
    });

    // Find user by phone number
    const userSnapshot = await db
      .collection('users')
      .where('whatsappNumber', '==', from)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      // User not found
      await messageRef.update({
        processingStatus: 'failed',
        errorMessage: 'User not registered',
      });
      
      // Send WhatsApp message to user
      await sendWhatsAppMessage(from, 'נראה שאינך רשום למערכת. הירשם דרך האפליקציה: [קישור]');
      
      return res.json({ success: false, message: 'User not found' });
    }

    const user = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    // Update message with user ID
    await messageRef.update({ userId });

    // Call AI to parse message
    const parsedData = await parseMessageWithAI(body);

    if (parsedData && parsedData.confidence > 0.8) {
      // High confidence - create parcel automatically
      const parcelRef = await db.collection('parcels').add({
        userId,
        mainUserId: user.mainUserId || userId,
        companyId: user.companyId,
        recipientName: parsedData.recipientName,
        trackingNumber: parsedData.trackingNumber,
        courierCompany: parsedData.courierCompany,
        pickupLocation: parsedData.pickupLocation,
        trackingLink: parsedData.trackingLink,
        status: 'pending_pickup',
        statusHistory: [
          {
            status: 'pending_pickup',
            timestamp: admin.firestore.Timestamp.now(),
            updatedBy: 'system',
            notes: 'Created from WhatsApp',
          },
        ],
        uploadMethod: 'whatsapp',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      // Update message
      await messageRef.update({
        parcelId: parcelRef.id,
        parsedData,
        processingStatus: 'processed',
        processedAt: admin.firestore.Timestamp.now(),
      });

      // Send confirmation to user
      await sendWhatsAppMessage(
        from,
        `✅ החבילה שלך נוספה בהצלחה!\nמספר מעקב: ${parsedData.trackingNumber}\nנקודת איסוף: ${parsedData.pickupLocation.name}`
      );

      // Send push notification
      await sendPushNotification(userId, 'חבילה חדשה', `חבילה מ-${parsedData.courierCompany} נוספה`);

      // Update parcel count
      await db.collection('users').doc(userId).update({
        currentMonthParcels: admin.firestore.FieldValue.increment(1),
      });
    } else if (parsedData && parsedData.confidence > 0.5) {
      // Medium confidence - ask for confirmation
      await sendWhatsAppMessage(
        from,
        `לא בטוח לגמרי בפרטים. האם זה נכון?\nמספר מעקב: ${parsedData.trackingNumber}\nנקודת איסוף: ${parsedData.pickupLocation.name}`
      );

      await messageRef.update({
        parsedData,
        processingStatus: 'pending',
      });
    } else {
      // Low confidence - ask for manual entry
      await sendWhatsAppMessage(
        from,
        'לא הצלחנו לזהות את פרטי המשלוח. אנא העלה את ההודעה דרך האפליקציה או הזן ידנית.'
      );

      await messageRef.update({
        processingStatus: 'failed',
        errorMessage: 'Could not parse message with sufficient confidence',
      });
    }

    res.json({ success: true, messageId: messageRef.id });
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 2. Monthly Billing Function (Scheduled)
// ============================================================================
export const monthlyBilling = functions.pubsub
  .schedule('0 0 7 * *') // 7th of every month at 00:00
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    try {
      // Get all active users
      const usersSnapshot = await db
        .collection('users')
        .where('subscriptionStatus', '==', 'active')
        .get();

      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();
        const userId = userDoc.id;

        // Get plan price
        const settingsDoc = await db.collection('system_settings').doc('main').get();
        const settings = settingsDoc.data();
        const planPrice = settings.meshulam.plans[user.subscriptionPlan];

        // Create payment record
        const paymentRef = await db.collection('payments').add({
          userId: user.mainUserId || userId,
          amount: planPrice,
          plan: user.subscriptionPlan,
          status: 'pending',
          paymentMethod: user.paymentMethod,
          billingDate: admin.firestore.Timestamp.now(),
          createdAt: admin.firestore.Timestamp.now(),
        });

        // Call Meshulam API to charge
        try {
          const response = await chargeMeshulam(user, planPrice);

          if (response.success) {
            // Payment successful
            await paymentRef.update({
              status: 'completed',
              paidAt: admin.firestore.Timestamp.now(),
              meshulamTransactionId: response.transactionId,
              meshulamResponse: response,
            });

            // Update user
            await db.collection('users').doc(userId).update({
              lastPaymentDate: admin.firestore.Timestamp.now(),
              nextPaymentDate: admin.firestore.Timestamp.fromDate(
                new Date(new Date().setMonth(new Date().getMonth() + 1))
              ),
              currentMonthParcels: 0,
            });

            // Send email receipt
            await sendEmailReceipt(user.email, planPrice, response.transactionId);
          } else {
            // Payment failed
            await paymentRef.update({
              status: 'failed',
              failureReason: response.error,
              retryCount: 0,
            });

            // Send notification to user
            await sendPushNotification(
              userId,
              'בעיה בתשלום',
              'התשלום החודשי נכשל. אנא עדכן את פרטי התשלום שלך.'
            );
          }
        } catch (error) {
          console.error(`Error charging user ${userId}:`, error);
          await paymentRef.update({
            status: 'failed',
            failureReason: error.message,
          });
        }
      }

      console.log('Monthly billing completed');
      return null;
    } catch (error) {
      console.error('Error in monthly billing:', error);
      throw error;
    }
  });

// ============================================================================
// 3. Update Parcel Status Function
// ============================================================================
export const updateParcelStatus = functions.firestore
  .document('parcels/{parcelId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // If status changed
      if (before.status !== after.status) {
        const userId = after.userId;
        const mainUserId = after.mainUserId;

        // Send push notification to user
        let message = '';
        switch (after.status) {
          case 'picked_up':
            message = `✅ החבילה שלך נאספה על ידי השליח שלנו 🚚`;
            break;
          case 'in_transit':
            message = `📦 החבילה שלך בדרך אליך! תגיע היום ⏰`;
            break;
          case 'delivered':
            message = `✅ החבילה נמסרה בהצלחה!`;
            break;
          case 'investigation':
            message = `⚠️ החבילה שלך בבירור. נחזור אליך בקרוב.`;
            break;
        }

        if (message) {
          await sendPushNotification(userId, 'עדכון חבילה', message);
          
          // Also notify main user if different
          if (mainUserId !== userId) {
            await sendPushNotification(mainUserId, 'עדכון חבילה', message);
          }
        }

        // Send WhatsApp message
        const user = await db.collection('users').doc(userId).get();
        if (user.data().whatsappNumber) {
          await sendWhatsAppMessage(user.data().whatsappNumber, message);
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating parcel status:', error);
      throw error;
    }
  });

// ============================================================================
// 4. Assign Courier to Parcel Function
// ============================================================================
export const assignCourierToParcel = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { parcelIds, courierId } = data;

    // Check if user is admin
    const adminDoc = await db.collection('admin_users').doc(context.auth.uid).get();
    if (!adminDoc.exists || !['admin', 'super_admin'].includes(adminDoc.data().role)) {
      throw new functions.https.HttpsError('permission-denied', 'User is not an admin');
    }

    // Update all parcels
    const batch = db.batch();
    for (const parcelId of parcelIds) {
      const parcelRef = db.collection('parcels').doc(parcelId);
      const parcelDoc = await parcelRef.get();
      const parcelData = parcelDoc.data();

      // Remove from previous courier if assigned
      if (parcelData.assignedCourierId) {
        // Notify previous courier
        const previousCourier = await db.collection('couriers').doc(parcelData.assignedCourierId).get();
        if (previousCourier.exists) {
          await sendPushNotification(
            parcelData.assignedCourierId,
            'חבילה הוסרה',
            `חבילה ${parcelData.trackingNumber} הוסרה מהקצאתך`
          );
        }
      }

      // Assign to new courier
      batch.update(parcelRef, {
        assignedCourierId: courierId,
        updatedAt: admin.firestore.Timestamp.now(),
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          status: 'assigned',
          timestamp: admin.firestore.Timestamp.now(),
          updatedBy: context.auth.uid,
          notes: `Assigned to courier ${courierId}`,
        }),
      });
    }

    await batch.commit();

    // Notify new courier
    await sendPushNotification(
      courierId,
      'חבילות חדשות',
      `${parcelIds.length} חבילות הוקצו לך`
    );

    return { success: true, message: 'Parcels assigned successfully' };
  } catch (error) {
    console.error('Error assigning courier:', error);
    throw error;
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

async function parseMessageWithAI(message: string) {
  try {
    // Call AI API (OpenAI or Google Gemini)
    const response = await axios.post(
      `https://api.openai.com/v1/chat/completions`,
      {
        model: process.env.AI_MODEL || 'gpt-4-mini',
        messages: [
          {
            role: 'system',
            content: `You are a parcel information extraction AI. Extract the following from Hebrew delivery notifications:
- recipientName: Name of recipient
- trackingNumber: Tracking number
- courierCompany: Delivery company name
- pickupLocation.name: Pickup location name
- pickupLocation.address: Pickup address
- pickupLocation.hours: Operating hours
- trackingLink: Tracking link
- confidence: Confidence level (0-1)

Return JSON only.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing message with AI:', error);
    return null;
  }
}

async function chargeMeshulam(user: any, amount: number) {
  try {
    // Call Meshulam API
    const response = await axios.post(
      'https://secure.meshulam.co.il/api/v1/charge',
      {
        merchantId: process.env.MESHULAM_MERCHANT_ID,
        amount,
        userId: user.uid,
        // Add more fields as needed
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MESHULAM_API_KEY}`,
        },
      }
    );

    return {
      success: true,
      transactionId: response.data.transactionId,
      ...response.data,
    };
  } catch (error) {
    console.error('Error charging Meshulam:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  try {
    // Send via WhatsApp API (Twilio, WATI, or 360dialog)
    // Implementation depends on chosen provider
    console.log(`Sending WhatsApp to ${to}: ${message}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

async function sendPushNotification(userId: string, title: string, body: string) {
  try {
    // Get user tokens
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;

    // Send notification via FCM
    // Implementation depends on how you store FCM tokens
    console.log(`Sending push notification to ${userId}: ${title}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

async function sendEmailReceipt(email: string, amount: number, transactionId: string) {
  try {
    // Send email receipt
    console.log(`Sending email receipt to ${email} for amount ${amount}`);
  } catch (error) {
    console.error('Error sending email receipt:', error);
  }
}

