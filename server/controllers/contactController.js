import { Contact } from '../models/Contact.js';
import { getDbStatus } from '../config/db.js';

export async function submitContact(req, res, next) {
  try {
    const body = req.body ?? {};
    const field = (value) => (typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '');
    const name = field(body.name);
    const email = field(body.email);
    const phone = field(body.phone);
    const message = field(body.message);

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (name.length > 120 || email.length > 254 || phone.length > 40 || message.length > 5000) {
      return res.status(400).json({ success: false, message: 'One or more fields are too long.' });
    }

    const trimmedData = { name, email, phone, message };
    const ip = req.ip || '';

    let savedToDb = false;
    const { connected } = getDbStatus();

    // 1. If MongoDB is connected, save the inquiry to database
    if (connected) {
      try {
        await Contact.create({ ...trimmedData, ip });
        savedToDb = true;
      } catch (dbErr) {
        console.error('[Contact] Error saving message to MongoDB:', dbErr.message);
      }
    }

    // 2. If Formspree is configured, forward message
    let forwardedToEmail = false;
    if (process.env.FORMSPREE_ENDPOINT) {
      try {
        const upstream = await fetch(process.env.FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(trimmedData)
        });
        forwardedToEmail = upstream.ok;
      } catch (emailErr) {
        console.error('[Contact] Formspree forwarding notice:', emailErr.message);
      }
    }

    console.log(`\n📬 [Contact] Received message from: ${trimmedData.name} <${trimmedData.email}>`);
    console.log(`   Saved to MongoDB: ${savedToDb ? 'Yes' : 'No'} · Forwarded via Formspree: ${forwardedToEmail ? 'Yes' : 'No'}\n`);

    // Don't tell the visitor "received" when the message went nowhere.
    if (!savedToDb && !forwardedToEmail) {
      return res.status(503).json({
        success: false,
        message: 'Sorry, messages can’t be delivered right now. Please email me directly instead.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received.',
      savedToDb,
      forwardedToEmail
    });
  } catch (error) {
    return next(error);
  }
}

export async function getContacts(req, res, next) {
  try {
    const { connected } = getDbStatus();
    if (!connected) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected. Add MONGODB_URI in .env to store and view inquiries.'
      });
    }

    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    return next(error);
  }
}
