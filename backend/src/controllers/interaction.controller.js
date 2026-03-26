import Subscriber from '../models/subscriber.js';
import ContactMessage from '../models/contact.js';

// Public Endpoints
export async function subscribeToNewsletter(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email is already subscribed' });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({ message: 'Subscribed successfully', subscriber });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while subscribing' });
  }
}

export async function submitContactMessage(req, res) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const contact = new ContactMessage({ name, email, message });
    await contact.save();

    res.status(201).json({ message: 'Message submitted successfully', contact });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while submitting message' });
  }
}

// Protected Admin Endpoints
export async function getSubscribers(req, res) {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json({ subscribers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
}

export async function getContactMessages(req, res) {
  try {
    const messages = await ContactMessage.find().sort({ submittedAt: -1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
}

export async function markContactMessageRead(req, res) {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByIdAndUpdate(id, { status: 'read' }, { new: true });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
}
