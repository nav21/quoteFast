import { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import CustomSelect from '../components/CustomSelect.jsx';

const UNIT_OPTIONS = ['per hour', 'per sqft', 'per unit', 'per linear ft', 'per day', 'flat rate'];

const EMPTY_SERVICE = {
  name: '',
  description: '',
  price: '',
  unit: 'flat rate',
  category: '',
};

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_SERVICE });
  const [addSaving, setAddSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    api.fetch('/api/services')
      .then(data => setServices(data.services || data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Group services by category
  const grouped = useMemo(() => {
    const groups = {};
    services.forEach(s => {
      const cat = s.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [services]);

  // Add service
  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setAddSaving(true);
    setError('');
    try {
      const data = await api.fetch('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          name: addForm.name.trim(),
          description: addForm.description.trim(),
          defaultPrice: parseFloat(addForm.price) || 0,
          unit: addForm.unit,
          category: addForm.category.trim() || 'General',
        }),
      });
      const newService = data.service || data;
      setServices(prev => [...prev, newService]);
      setAddForm({ ...EMPTY_SERVICE });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddSaving(false);
    }
  };

  // Start editing
  const startEdit = (service) => {
    setEditingId(service._id);
    setEditForm({
      name: service.name,
      description: service.description || '',
      price: service.defaultPrice ?? service.price ?? 0,
      unit: service.unit || 'flat rate',
      category: service.category || 'General',
      isActive: service.isActive !== false,
    });
    setShowAddForm(false);
    setDeletingId(null);
  };

  // Save edit
  const handleEdit = async () => {
    if (!editForm.name.trim()) return;
    setEditSaving(true);
    setError('');
    try {
      const data = await api.fetch(`/api/services/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          defaultPrice: parseFloat(editForm.price) || 0,
          unit: editForm.unit,
          category: editForm.category.trim() || 'General',
          isActive: editForm.isActive,
        }),
      });
      const updated = data.service || data;
      setServices(prev => prev.map(s => s._id === editingId ? updated : s));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // Delete service
  const handleDelete = async (id) => {
    setDeleteLoading(true);
    setError('');
    try {
      await api.fetch(`/api/services/${id}`, { method: 'DELETE' });
      setServices(prev => prev.filter(s => s._id !== id));
      setDeletingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatPrice = (service) => {
    const price = service.defaultPrice ?? service.price ?? 0;
    return `$${Number(price).toFixed(2)}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-navy">{user?.businessType ? `${user.businessType} Services` : 'Services'}</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Add Service Button / Form */}
      {!showAddForm ? (
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); setDeletingId(null); }}
          className="w-full mb-6 h-12 rounded-xl border-2 border-solid border-navy/15 text-navy/50 text-sm font-medium hover:border-gold hover:text-gold-dark transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Add Service
        </button>
      ) : (
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-navy/10 p-5">
          <h3 className="text-sm font-semibold text-navy mb-4">New Service</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Service name"
              className="w-full h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
            />
            <input
              type="text"
              value={addForm.description}
              onChange={(e) => setAddForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
            />
            <div className="flex gap-3">
              <div className="flex items-center gap-1 flex-1">
                <span className="text-navy/40 text-sm">$</span>
                <input
                  type="number"
                  value={addForm.price}
                  onChange={(e) => setAddForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="flex-1 h-11 px-3 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
                />
              </div>
              <CustomSelect
                value={addForm.unit}
                onChange={(val) => setAddForm(f => ({ ...f, unit: val }))}
                options={UNIT_OPTIONS}
                className="h-11 w-32"
              />
            </div>
            <input
              type="text"
              value={addForm.category}
              onChange={(e) => setAddForm(f => ({ ...f, category: e.target.value }))}
              placeholder="Category (e.g. General)"
              className="w-full h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={addSaving || !addForm.name.trim()}
                className="flex-1 h-11 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold-light active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {addSaving ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : 'Add Service'}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setAddForm({ ...EMPTY_SERVICE }); }}
                className="h-11 px-5 rounded-lg border border-navy/20 text-navy/60 font-medium text-sm hover:bg-navy/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-navy/10 p-4 animate-pulse">
              <div className="h-4 w-32 bg-navy/10 rounded-full mb-2" />
              <div className="h-3 w-20 bg-navy/10 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Service List grouped by category */}
      {!loading && grouped.map(([category, categoryServices]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="space-y-3">
            {categoryServices.map(service => {
              const isEditing = editingId === service._id;
              const isDeleting = deletingId === service._id;
              const inactive = service.isActive === false;

              if (isEditing) {
                return (
                  <div key={service._id} className="bg-white rounded-xl border border-gold/30 shadow-sm p-5">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Service name"
                        className="w-full h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
                      />
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Description (optional)"
                        className="w-full h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
                      />
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-navy/40 text-sm">$</span>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm(f => ({ ...f, price: e.target.value }))}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="flex-1 h-11 px-3 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
                          />
                        </div>
                        <CustomSelect
                          value={editForm.unit}
                          onChange={(val) => setEditForm(f => ({ ...f, unit: val }))}
                          options={UNIT_OPTIONS}
                          className="h-11 w-32"
                        />
                      </div>
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                        placeholder="Category"
                        className="w-full h-11 px-4 rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                          className="w-4 h-4 rounded border-navy/20 text-gold focus:ring-gold/20 cursor-pointer"
                        />
                        <span className="text-sm text-navy/70">Active</span>
                      </label>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleEdit}
                          disabled={editSaving || !editForm.name.trim()}
                          className="flex-1 h-11 rounded-lg bg-gold text-navy font-semibold text-sm hover:bg-gold-light active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                        >
                          {editSaving ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="h-11 px-5 rounded-lg border border-navy/20 text-navy/60 font-medium text-sm hover:bg-navy/5 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={service._id}
                  className={`bg-white rounded-xl border border-navy/10 p-4 transition-shadow hover:shadow-sm ${inactive ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-navy truncate">{service.name}</p>
                        {inactive && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-navy/50">
                        {formatPrice(service)} <span className="text-navy/30">{service.unit}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit button */}
                      <button
                        onClick={() => startEdit(service)}
                        className="p-2 text-navy/30 hover:text-gold-dark transition-colors cursor-pointer"
                        aria-label="Edit service"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => { setDeletingId(service._id); setEditingId(null); }}
                        className="p-2 text-navy/30 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Delete service"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {isDeleting && (
                    <div className="mt-3 pt-3 border-t border-navy/10">
                      <p className="text-sm text-red-600 font-medium mb-2">Remove this service?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(service._id)}
                          disabled={deleteLoading}
                          className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                        >
                          {deleteLoading ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : 'Remove'}
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="h-9 px-4 rounded-lg border border-navy/20 text-navy/60 text-sm font-medium hover:bg-navy/5 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {!loading && services.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-navy/25">
              <path d="M20 7h-7m0 0L9 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-7z" />
            </svg>
          </div>
          <h3 className="font-display text-lg text-navy mb-1">No services yet</h3>
          <p className="text-sm text-navy/40 mb-6">Add your first service to start building quotes</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex h-12 px-6 rounded-lg bg-gold text-navy font-semibold text-sm items-center gap-2 hover:bg-gold-light active:scale-[0.98] transition-all cursor-pointer"
          >
            Add Your First Service
          </button>
        </div>
      )}
    </div>
  );
}
