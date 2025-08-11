import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, X, LoaderCircle, AlertTriangle, Percent, Tag, DollarSign } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { http } from '../../lib/http';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Offer = {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  discountPercent?: number;
  priceOff?: number;
  productIds: string[];
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  createdAt?: string;
};

const initialFormState = {
  title: '',
  description: '',
  image: '',
  discountPercent: 10,
  priceOff: undefined,
  productIds: [],
  startsAt: '',
  endsAt: '',
  isActive: true,
};

// --- SUB-COMPONENTS ---

function StatusBadge({ isActive, startsAt, endsAt }: { isActive: boolean, startsAt?: string, endsAt?: string }) {
  if (!isActive) {
    return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-200 rounded-full">Inactiva</span>;
  }
  
  const now = new Date();
  const startDate = startsAt ? new Date(startsAt) : null;
  const endDate = endsAt ? new Date(endsAt) : null;
  
  if (startDate && now < startDate) {
    return <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-200 rounded-full">Próxima</span>;
  }
  
  if (endDate && now > endDate) {
    return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-200 rounded-full">Expirada</span>;
  }
  
  return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-200 rounded-full">Activa</span>;
}

function DiscountDisplay({ discountPercent, priceOff }: { discountPercent?: number, priceOff?: number }) {
  if (discountPercent) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <Percent size={14} />
        <span className="font-medium">{discountPercent}%</span>
      </div>
    );
  }
  
  if (priceOff) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <DollarSign size={14} />
        <span className="font-medium">${priceOff}</span>
      </div>
    );
  }
  
  return <span className="text-mutedText">-</span>;
}

function ConfirmationDialog({ open, onClose, onConfirm, title, message }: { open: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">{title}</h3>
            <p className="text-sm text-mutedText mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="h-9 px-4 inline-flex items-center justify-center rounded-md border border-border hover:bg-black/5">Cancelar</button>
          <button onClick={onConfirm} className="h-9 px-4 inline-flex items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  const baseClasses = "fixed top-5 right-5 z-50 flex items-center gap-4 p-4 rounded-lg shadow-lg";
  const typeClasses = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };
  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={onClose}><X size={18} /></button>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<Omit<Offer, '_id'>>(initialFormState);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [sort, setSort] = useState({ by: 'createdAt', order: 'desc' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const debouncedSearch = useDebounce(filters.search, 500);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        sortBy: sort.by,
        sortOrder: sort.order,
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filters.status !== 'all') params.append('status', filters.status);

      const res = await http.get(`${API_BASE}/api/offers?${params.toString()}`);
      setOffers(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError('No se pudieron cargar las ofertas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort.by, sort.order, debouncedSearch, filters.status]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await http.delete(`${API_BASE}/api/offers/${deletingId}`);
      showToast('Oferta eliminada exitosamente.', 'success');
      setDeletingId(null);
      fetchOffers();
    } catch (err) {
      showToast('Error al eliminar la oferta.', 'error');
      console.error(err);
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    const newOrder = sort.by === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ by: field, order: newOrder });
  };

  const openCreateForm = () => {
    setShowForm(true);
    setEditing(null);
    setForm(initialFormState);
    setFormError(null);
  };

  const openEditForm = (offer: Offer) => {
    setShowForm(true);
    setEditing(offer);
    setForm({
      title: offer.title,
      description: offer.description || '',
      image: offer.image || '',
      discountPercent: offer.discountPercent,
      priceOff: offer.priceOff,
      productIds: offer.productIds || [],
      startsAt: offer.startsAt || '',
      endsAt: offer.endsAt || '',
      isActive: offer.isActive,
    });
    setFormError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(initialFormState);
    setFormError(null);
  };

  const resolveUrl = (u?: string | null) => {
    if (!u) return '';
    if (u.startsWith('http') || u.startsWith('blob:') || u.startsWith('data:')) return u;
    return `${API_BASE}${u}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return;
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      let imageUrl = form.image || '';
      if (selectedImage) {
        const sig = await http.get(`/api/auth/cloudinary-signature`, { params: { folder: 'makers-tech/offers' } });
        const { timestamp, signature, apiKey, cloudName, folder } = sig.data;
        const fd = new FormData();
        fd.append('file', selectedImage as Blob);
        fd.append('api_key', apiKey);
        fd.append('timestamp', String(timestamp));
        fd.append('signature', signature);
        fd.append('folder', folder);
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const upRes = await fetch(uploadUrl, { method: 'POST', body: fd });
        const upJson = await upRes.json();
        if (upJson.error) throw new Error(upJson.error?.message || 'Error al subir imagen');
        imageUrl = upJson.secure_url as string;
      }
      const payload = { ...form, image: imageUrl } as any;
      if (editing) {
        await http.put(`${API_BASE}/api/offers/${editing._id}`, payload);
        showToast('Oferta actualizada exitosamente.', 'success');
      } else {
        await http.post(`${API_BASE}/api/offers`, payload);
        showToast('Oferta creada exitosamente.', 'success');
      }
      closeForm();
      fetchOffers();
    } catch (err) {
      if (err instanceof AxiosError) {
        setFormError(err.response?.data?.message || 'Error al procesar la solicitud.');
      } else {
        setFormError('Error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const SortableHeader = ({ field, label }: { field: string, label: string }) => (
    <th className="py-2 px-3 font-medium cursor-pointer" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {label}
        {sort.by === field && (sort.order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </div>
    </th>
  );

  return (
    <div className="p-6 bg-background text-text">
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <ConfirmationDialog 
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar esta oferta? Esta acción no se puede deshacer."
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Ofertas</h1>
        <button 
          className="h-8 px-3 inline-flex items-center justify-center gap-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50 text-sm"
          onClick={openCreateForm} 
          disabled={loading}
        >
          <Plus size={18} />
          Nueva Oferta
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 p-4 bg-surface border border-border rounded-xl">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedText" />
          <input 
            type="text"
            placeholder="Buscar por título o descripción..."
            className="h-9 w-full pl-10 pr-4 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <select 
          className="h-9 pl-3 pr-8 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="all">Todos los Estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
          <option value="upcoming">Próximas</option>
          <option value="expired">Expiradas</option>
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-mutedText text-xs bg-black/5">
              <SortableHeader field="title" label="Título" />
              <SortableHeader field="discountPercent" label="Descuento" />
              <SortableHeader field="startsAt" label="Fecha Inicio" />
              <SortableHeader field="endsAt" label="Fecha Fin" />
              <th className="py-2 px-3 font-medium">Estado</th>
              <th className="py-2 px-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && offers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <LoaderCircle className="animate-spin text-primary" size={32} />
                    <span className="text-mutedText">Cargando ofertas...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <AlertTriangle className="text-red-500" size={32} />
                    <span className="text-red-600 font-medium">Error al cargar ofertas</span>
                    <span className="text-sm text-mutedText">{error}</span>
                    <button 
                      onClick={fetchOffers}
                      className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-black/90 text-sm"
                    >
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : offers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-mutedText/10 rounded-full flex items-center justify-center">
                      <Tag className="text-mutedText" size={24} />
                    </div>
                    <span className="text-mutedText font-medium">No se encontraron ofertas</span>
                    <span className="text-sm text-mutedText">Aún no se han creado ofertas en el sistema</span>
                    <button 
                      onClick={openCreateForm}
                      className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-black/90 text-sm"
                    >
                      Crear Primera Oferta
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              offers.map((offer) => (
                <tr key={offer._id} className="border-t border-border hover:bg-black/5">
                  <td className="py-2 px-3">
                    <div>
                      <div className="font-medium text-text">{offer.title}</div>
                      {offer.description && (
                        <div className="text-sm text-mutedText truncate max-w-xs">{offer.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <DiscountDisplay discountPercent={offer.discountPercent} priceOff={offer.priceOff} />
                  </td>
                  <td className="py-2 px-3 text-mutedText">
                    {offer.startsAt ? new Date(offer.startsAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-2 px-3 text-mutedText">
                    {offer.endsAt ? new Date(offer.endsAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-2 px-3">
                    <StatusBadge isActive={offer.isActive} startsAt={offer.startsAt} endsAt={offer.endsAt} />
                  </td>
                  <td className="py-2 px-3 space-x-2">
                    <button className="text-mutedText hover:text-primary" onClick={() => openEditForm(offer)} disabled={loading}>
                      <Edit size={16} />
                    </button>
                    <button className="text-mutedText hover:text-red-600" onClick={() => setDeletingId(offer._id)} disabled={loading}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{editing ? 'Editar Oferta' : 'Nueva Oferta'}</h2>
                <button 
                  onClick={closeForm}
                  className="text-mutedText hover:text-text p-2 rounded-full hover:bg-black/5"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}
              
              {/* Primera fila: Título y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
                    Título de la Oferta *
                  </label>
                  <input 
                    type="text" 
                    id="title" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Descuento de Verano 20%"
                    required
                  />
                </div>
              </div>

              {/* Segunda fila: Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
                  Descripción
                </label>
                <textarea 
                  id="description" 
                  rows={3}
                  className="w-full px-3 py-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe los detalles de la oferta..."
                />
              </div>

              {/* Imagen de la oferta */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Imagen</label>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-black/90 text-sm">
                    Seleccionar imagen
                  </button>
                  <span className="text-sm text-mutedText truncate max-w-[240px]">
                    {selectedImage?.name || (form.image ? 'Imagen actual seleccionada' : 'Ningún archivo seleccionado')}
                  </span>
                </div>
                {(imagePreviewUrl || form.image) && (
                  <div className="mt-2">
                    <img src={resolveUrl(imagePreviewUrl || form.image)} className="w-32 h-32 object-contain border border-border rounded" />
                  </div>
                )}
              </div>

              {/* Tercera fila: Descuento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="discountPercent" className="block text-sm font-medium text-text mb-2">
                    Porcentaje de Descuento
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      id="discountPercent" 
                      className="h-11 w-full pr-8 px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      value={form.discountPercent || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || undefined;
                        handleInputChange('discountPercent', value);
                        if (value) handleInputChange('priceOff', undefined);
                      }}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mutedText">%</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="priceOff" className="block text-sm font-medium text-text mb-2">
                    Descuento en Pesos
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedText">$</span>
                    <input 
                      type="number" 
                      id="priceOff" 
                      className="h-11 w-full pl-8 pr-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      value={form.priceOff || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || undefined;
                        handleInputChange('priceOff', value);
                        if (value) handleInputChange('discountPercent', undefined);
                      }}
                      min="0"
                      step="0.01"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>

              {/* Cuarta fila: Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startsAt" className="block text-sm font-medium text-text mb-2">
                    Fecha de Inicio
                  </label>
                  <input 
                    type="datetime-local" 
                    id="startsAt" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.startsAt}
                    onChange={(e) => handleInputChange('startsAt', e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="endsAt" className="block text-sm font-medium text-text mb-2">
                    Fecha de Fin
                  </label>
                  <input 
                    type="datetime-local" 
                    id="endsAt" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.endsAt}
                    onChange={(e) => handleInputChange('endsAt', e.target.value)}
                  />
                </div>
              </div>

              {/* Quinta fila: Productos y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="productIds" className="block text-sm font-medium text-text mb-2">
                    IDs de Productos
                  </label>
                  <textarea 
                    id="productIds" 
                    rows={3}
                    className="w-full px-3 py-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    value={(form.productIds || []).join(', ')}
                    onChange={(e) => handleInputChange('productIds', e.target.value.split(',').map(id => id.trim()).filter(id => id))}
                    placeholder="ID1, ID2, ID3 (separados por comas)"
                  />
                  <p className="text-xs text-mutedText mt-1">
                    IDs de productos separados por comas
                  </p>
                </div>
                
                <div className="flex items-center justify-center">
                  <label className="flex items-center gap-3 text-sm font-medium text-text">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      checked={form.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                    Oferta Activa
                  </label>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  className="h-11 px-6 inline-flex items-center justify-center rounded-lg border border-border hover:bg-black/5 transition-colors"
                  onClick={closeForm}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="h-9 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50 transition-colors text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      Procesando...
                    </>
                  ) : editing ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Oferta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


