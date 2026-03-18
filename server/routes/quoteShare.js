import express from 'express';
import Quote from '../models/Quote.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/quotes/share/:token — Public: view a quote
router.get('/:token', async (req, res) => {
  try {
    const quote = await Quote.findOne({ shareToken: req.params.token });
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const user = await User.findById(quote.userId)
      .select('businessName name phone email address brandColor templateStyle');
    if (!user) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Mark as viewed on first access
    if (!quote.viewedAt && quote.status === 'sent') {
      quote.viewedAt = new Date();
      quote.status = 'viewed';
      await quote.save();
    }

    const expired = quote.expiresAt && new Date(quote.expiresAt) < new Date();

    res.json({
      quote: {
        quoteNumber: quote.quoteNumber,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientPhone: quote.clientPhone,
        jobDescription: quote.jobDescription,
        lineItems: quote.lineItems,
        subtotal: quote.subtotal,
        tax: quote.tax,
        taxRate: quote.taxRate,
        total: quote.total,
        notes: quote.notes,
        status: quote.status,
        createdAt: quote.createdAt,
        expiresAt: quote.expiresAt,
        respondedAt: quote.respondedAt,
      },
      business: {
        businessName: user.businessName,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        brandColor: user.brandColor,
        templateStyle: user.templateStyle,
      },
      expired,
    });
  } catch (error) {
    console.error('Quote share view error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/quotes/share/:token/respond — Public: approve/decline a quote
router.put('/:token/respond', async (req, res) => {
  try {
    const { response, reason } = req.body;

    if (!response || !['approved', 'declined'].includes(response)) {
      return res.status(400).json({ message: 'Response must be "approved" or "declined"' });
    }

    // Check quote exists and hasn't expired
    const existing = await Quote.findOne({ shareToken: req.params.token });
    if (!existing) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    if (existing.expiresAt && new Date(existing.expiresAt) < new Date()) {
      return res.status(410).json({ message: 'This quote has expired' });
    }

    // Atomic update to prevent race conditions
    const updateFields = {
      status: response,
      respondedAt: new Date(),
    };

    if (response === 'declined' && reason) {
      updateFields.notes = existing.notes
        ? `${existing.notes}\n\n---\nClient decline reason: ${reason}`
        : `Client decline reason: ${reason}`;
    }

    const result = await Quote.findOneAndUpdate(
      { shareToken: req.params.token, respondedAt: null },
      updateFields,
      { new: true }
    );

    if (!result) {
      return res.status(409).json({ message: 'This quote has already been responded to' });
    }

    res.json({
      status: result.status,
      respondedAt: result.respondedAt,
    });
  } catch (error) {
    console.error('Quote respond error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
