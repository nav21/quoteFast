import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Quote from '../models/Quote.js';
import User from '../models/User.js';
import ServiceItem from '../models/ServiceItem.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/quotes/generate — AI-powered quote generation
router.post('/generate', async (req, res) => {
  try {
    const { clientName, clientEmail, clientPhone, clientAddress, jobDescription } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    if (process.env.SKIP_AI === 'true') {
      return res.json({
        lineItems: [
          { description: 'Sample service', quantity: 1, unitPrice: 100, unit: 'flat rate', amount: 100 },
        ],
        notes: 'Placeholder quote — AI generation bypassed.',
        suggestedTerms: 'Payment due within 30 days.',
        taxRate: req.user.taxRate || 0,
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        message: 'AI generation is not configured. Please add your API key.',
        fallback: true,
      });
    }

    // Fetch user's active service catalog
    const services = await ServiceItem.find({
      userId: req.user._id,
      isActive: true,
    }).lean();

    const catalogJSON = JSON.stringify(
      services.map(s => ({
        name: s.name,
        description: s.description,
        unit: s.unit,
        defaultPrice: s.defaultPrice,
        category: s.category,
      }))
    );

    const businessName = req.user.businessName || 'the business';
    const businessType = req.user.businessType || 'general services';

    const systemPrompt = `You are a quoting assistant for ${businessName}, a ${businessType} business.

Your job is to generate accurate, professional quote line items based on a job description provided by the business owner.

Here is the business's service catalog (JSON array):
${catalogJSON}

INSTRUCTIONS:
- Analyze the job description and select appropriate services from the catalog.
- For each line item, use the catalog's service name/description and defaultPrice as the unitPrice when a matching service exists.
- You may create line items not in the catalog if the job clearly requires them, using reasonable market pricing.
- Set quantity based on the scope described in the job description. If unclear, use reasonable estimates.
- Use the unit type from the catalog when available (per hour, per sqft, per unit, per linear ft, per day, flat rate).
- Include professional notes relevant to the quote.
- Suggest standard terms appropriate for this type of work.

You MUST respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.

Response format:
{
  "lineItems": [
    {
      "description": "string — clear description of the work",
      "quantity": number,
      "unitPrice": number,
      "unit": "per hour | per sqft | per unit | per linear ft | per day | flat rate",
      "total": number
    }
  ],
  "notes": "string — professional notes about the work, materials, timeline, etc.",
  "suggestedTerms": "string — payment terms, warranty info, conditions, etc."
}`;

    // Call Claude API
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a detailed quote for the following job:\n\n${jobDescription.trim()}`,
        },
      ],
    });

    // Parse AI response
    const responseText = message.content[0]?.text;
    if (!responseText) {
      return res.status(502).json({
        message: 'AI returned an empty response. Please try again or enter items manually.',
        fallback: true,
      });
    }

    let parsed;
    try {
      const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({
        message: 'AI response could not be parsed. Please try again or enter items manually.',
        fallback: true,
      });
    }

    if (!parsed.lineItems || !Array.isArray(parsed.lineItems) || parsed.lineItems.length === 0) {
      return res.status(502).json({
        message: 'AI did not return any line items. Please try again or enter items manually.',
        fallback: true,
      });
    }

    // Normalize line items to match Quote model schema
    const lineItems = parsed.lineItems.map(item => ({
      description: String(item.description || ''),
      quantity: Math.max(0, Number(item.quantity) || 1),
      unit: item.unit || 'flat rate',
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
      amount: Math.max(0, Number(item.total) || (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)),
    }));

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = req.user.taxRate || 0;
    const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    res.json({
      clientName: clientName || '',
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      clientAddress: clientAddress || '',
      jobDescription: jobDescription.trim(),
      lineItems,
      subtotal,
      taxRate,
      tax,
      total,
      notes: parsed.notes || '',
      suggestedTerms: parsed.suggestedTerms || '',
    });
  } catch (error) {
    if (error?.status === 401) {
      return res.status(502).json({
        message: 'AI API key is invalid. Please check your configuration.',
        fallback: true,
      });
    }
    if (error?.status === 429) {
      return res.status(429).json({
        message: 'AI rate limit reached. Please wait a moment and try again.',
        fallback: true,
      });
    }
    if (error?.status === 529 || error?.message?.includes('overloaded')) {
      return res.status(503).json({
        message: 'AI service is temporarily overloaded. Please try again shortly.',
        fallback: true,
      });
    }

    console.error('Quote generation error:', error.message);
    res.status(500).json({
      message: 'Failed to generate quote. Please try again or enter items manually.',
      fallback: true,
    });
  }
});

// POST /api/quotes — Create a quote
router.post('/', async (req, res) => {
  try {
    const {
      clientName, clientEmail, clientPhone, clientAddress, jobDescription,
      lineItems, subtotal, tax, taxRate, total, notes, expiresAt, status,
    } = req.body;

    // Auto-generate quoteNumber (max existing + 1)
    const lastQuote = await Quote.findOne({ userId: req.user._id })
      .sort({ quoteNumber: -1 })
      .select('quoteNumber')
      .lean();

    const quoteNumber = (lastQuote?.quoteNumber || 0) + 1;

    // Snapshot the user's current template style onto the quote
    const currentUser = await User.findById(req.user._id).select('templateStyle').lean();

    const quoteData = {
      userId: req.user._id,
      quoteNumber,
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      jobDescription,
      lineItems,
      subtotal,
      tax,
      taxRate,
      total,
      notes,
      templateStyle: currentUser?.templateStyle || 'clean-minimal',
      ...(expiresAt && { expiresAt }),
      ...(status && { status }),
    };

    let quote;
    try {
      quote = await Quote.create(quoteData);
    } catch (error) {
      // Retry once on duplicate quoteNumber (race condition)
      if (error.code === 11000 && error.message.includes('quoteNumber')) {
        const freshLast = await Quote.findOne({ userId: req.user._id })
          .sort({ quoteNumber: -1 })
          .select('quoteNumber')
          .lean();
        quoteData.quoteNumber = (freshLast?.quoteNumber || 0) + 1;
        quote = await Quote.create(quoteData);
      } else {
        throw error;
      }
    }

    res.status(201).json(quote);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/quotes — List user's quotes
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    const validStatuses = ['draft', 'sent', 'viewed', 'approved', 'declined'];
    if (req.query.status && validStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const quotes = await Quote.find(filter).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/quotes/:id/pdf — Download quote as PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const { generatePdf } = await import('../utils/pdf.js');
    const pdfBuffer = await generatePdf(quote, req.user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quote-${quote.quoteNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid quote ID' });
    }
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// GET /api/quotes/:id — Get a single quote
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    res.json(quote);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid quote ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/quotes/:id — Update a quote
router.put('/:id', async (req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Strip protected fields
    const { quoteNumber, shareToken, userId, _id, ...updates } = req.body;

    Object.assign(quote, updates);
    await quote.save();
    res.json(quote);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid quote ID' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/quotes/:id — Delete a quote
router.delete('/:id', async (req, res) => {
  try {
    const quote = await Quote.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    res.json({ message: 'Quote deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid quote ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
