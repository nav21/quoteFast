import express from 'express';
import ServiceItem from '../models/ServiceItem.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/services/batch — Create multiple services at once
router.post('/batch', async (req, res) => {
  try {
    const { services } = req.body;

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'Services array is required' });
    }

    if (services.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 services per batch' });
    }

    const docs = services.map(s => ({
      userId: req.user._id,
      name: s.name,
      description: s.description || '',
      unit: s.unit || 'flat rate',
      defaultPrice: s.defaultPrice || 0,
      category: s.category || 'General',
    }));

    const created = await ServiceItem.insertMany(docs, { ordered: false });
    res.status(201).json(created);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/services — Create a service
router.post('/', async (req, res) => {
  try {
    const { name, description, unit, defaultPrice, category } = req.body;

    const service = await ServiceItem.create({
      userId: req.user._id,
      name,
      description,
      unit,
      defaultPrice,
      category,
    });

    res.status(201).json(service);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/services — List user's services
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const services = await ServiceItem.find(filter).sort({ category: 1, name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/services/:id — Get a single service
router.get('/:id', async (req, res) => {
  try {
    const service = await ServiceItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid service ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/services/:id — Update a service
router.put('/:id', async (req, res) => {
  try {
    const service = await ServiceItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const { name, description, unit, defaultPrice, category, isActive } = req.body;
    Object.assign(service, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(unit !== undefined && { unit }),
      ...(defaultPrice !== undefined && { defaultPrice }),
      ...(category !== undefined && { category }),
      ...(isActive !== undefined && { isActive }),
    });

    await service.save();
    res.json(service);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid service ID' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/services/:id — Delete a service
router.delete('/:id', async (req, res) => {
  try {
    const service = await ServiceItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid service ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
