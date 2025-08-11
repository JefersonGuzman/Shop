import { useState, useCallback, useEffect, useRef } from 'react';
import { AxiosError } from 'axios';
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, X, LoaderCircle, AlertTriangle, Globe } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { http } from '../../lib/http';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Brand = {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const initialFormState = {
  name: '',
  logo: '',
  isActive: true,
};

// --- SUB-COMPONENTS ---

function PaginationControls({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (page: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed text-sm">‹</button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} disabled={p === page} className={`h-8 w-8 inline-flex items-center justify-center rounded-md border border-border ${p === page ? 'bg-black text-white' : 'bg-surface text-text'} hover:bg-black/5 disabled:opacity-100 text-sm`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed text-sm">›</button>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-200 rounded-full">Activo</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-200 rounded-full">Inactivo</span>;
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

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<Omit<Brand, '_id' | 'createdAt' | 'updatedAt'>>(initialFormState);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const debouncedSearch = useDebounce(filters.search, 500);

  // --- New states for added features ---
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resolveUrl = (u?: string | null) => {
    if (!u) return '';
    if (u.startsWith('http') || u.startsWith('blob:') || u.startsWith('data:')) return u;
    // Rutas relativas como /uploads/...
    return `${API_BASE}${u}`;
  };

  const fetchBrands = useCallback(async () => {
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

      const res = await http.get(`${API_BASE}/api/brands?${params.toString()}`);
      setBrands(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError('No se pudieron cargar las marcas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort.by, sort.order, debouncedSearch]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Limpiar URLs de preview cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(brands.map(b => b._id));
    } else {
      setSelectedIds([]);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await http.delete(`${API_BASE}/api/brands/${deletingId}`);
      showToast('Marca eliminada exitosamente.', 'success');
      setDeletingId(null);
      fetchBrands();
    } catch (err) {
      showToast('Error al eliminar la marca.', 'error');
      console.error(err);
      setLoading(false);
    }
  };

  const confirmDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await http.post(`${API_BASE}/api/brands/bulk-delete`, { ids: selectedIds });
      showToast(`${selectedIds.length} marcas eliminadas.`, 'success');
      setSelectedIds([]);
      fetchBrands();
    } catch (err) {
      showToast('Error al eliminar las marcas seleccionadas.', 'error');
      console.error(err);
    } finally {
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
    clearLogo();
  };

  const openEditForm = (brand: Brand) => {
    setShowForm(true);
    setEditing(brand);
    setForm({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      isActive: brand.isActive,
    });
    setFormError(null);
    clearLogo();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(initialFormState);
    setFormError(null);
    clearLogo();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Solo se permiten archivos de imagen (JPG, PNG, WebP)', 'error');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('El logo no puede superar 5MB', 'error');
      return;
    }

    setSelectedLogo(file);

    // Crear URL de preview
    const newPreviewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(newPreviewUrl);
  };

  const removeLogo = () => {
    // Limpiar archivo seleccionado y vista previa
    setSelectedLogo(null);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
    }
    // Señalar que se debe quitar el logo actual
    setForm((prev) => ({ ...prev, logo: '' }));
  };

  const clearLogo = () => {
    setSelectedLogo(null);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      // Enviar multipart si hay archivo; si no, enviar JSON
      const hasFile = !!selectedLogo;
      if (hasFile) {
        // Subir a Cloudinary usando endpoint de firma
        const sig = await http.get(`/api/auth/cloudinary-signature`);
        const { timestamp, signature, apiKey, cloudName, folder } = sig.data;
        const fd = new FormData();
        fd.append('file', selectedLogo as Blob);
        fd.append('api_key', apiKey);
        fd.append('timestamp', String(timestamp));
        fd.append('signature', signature);
        fd.append('folder', folder);
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const upRes = await fetch(uploadUrl, { method: 'POST', body: fd });
        const upJson = await upRes.json();
        const cloudUrl = upJson.secure_url as string;

        const payload = { name: form.name, logo: cloudUrl, isActive: form.isActive } as any;
        if (editing) await http.put(`${API_BASE}/api/brands/${editing._id}`, payload);
        else await http.post(`${API_BASE}/api/brands`, payload);
      } else {
        // Si form.logo === '' significa que el usuario pulsó "Remover"
        const payload = { name: form.name, logo: form.logo, isActive: form.isActive } as any;
        if (editing) {
          await http.put(`${API_BASE}/api/brands/${editing._id}`, payload);
        } else {
          await http.post(`${API_BASE}/api/brands`, payload);
        }
      }
      showToast(editing ? 'Marca actualizada exitosamente.' : 'Marca creada exitosamente.', 'success');
      closeForm();
      fetchBrands();
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
        message="¿Estás seguro de que quieres eliminar esta marca? Esta acción no se puede deshacer."
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Marcas</h1>
        <button 
          className="h-8 px-3 inline-flex items-center justify-center gap-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50 text-sm"
          onClick={openCreateForm} 
          disabled={loading}
        >
          <Plus size={18} />
          Nueva Marca
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 p-4 bg-surface border border-border rounded-xl">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedText" />
          <input 
            type="text"
            placeholder="Buscar por nombre..."
            className="h-9 w-full pl-10 pr-4 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-100 border border-blue-300 rounded-xl">
          <span className="text-sm font-medium text-blue-800">{selectedIds.length} marcas seleccionadas</span>
          <button 
            onClick={confirmDeleteSelected}
            className="h-8 px-3 inline-flex items-center justify-center gap-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            <Trash2 size={16} />
            Eliminar Seleccionadas
          </button>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-mutedText text-xs bg-black/5">
              <th className="py-2 px-3 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-400"
                  onChange={handleSelectAll}
                  checked={brands.length > 0 && selectedIds.length === brands.length}
                />
              </th>
              <th className="py-2 px-3 font-medium">Logo</th>
              <SortableHeader field="name" label="Nombre" />
              <th className="py-2 px-3 font-medium">Descripción</th>
              <th className="py-2 px-3 font-medium">Sitio Web</th>
              <SortableHeader field="isActive" label="Estado" />
              <th className="py-2 px-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && brands.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <LoaderCircle className="animate-spin text-primary" size={32} />
                    <span className="text-mutedText">Cargando marcas...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <AlertTriangle className="text-red-500" size={32} />
                    <span className="text-red-600 font-medium">Error al cargar marcas</span>
                    <span className="text-sm text-mutedText">{error}</span>
                    <button 
                      onClick={fetchBrands}
                      className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-black/90 text-sm"
                    >
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-mutedText/10 rounded-full flex items-center justify-center">
                      <Globe className="text-mutedText" size={24} />
                    </div>
                    <span className="text-mutedText font-medium">No se encontraron marcas</span>
                    <span className="text-sm text-mutedText">Aún no se han creado marcas en el sistema</span>
                    <button 
                      onClick={openCreateForm}
                      className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-black/90 text-sm"
                    >
                      Crear Primera Marca
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand._id} className={`border-t border-border hover:bg-black/5 ${selectedIds.includes(brand._id) ? 'bg-blue-50' : ''}`}>
                  <td className="py-2 px-3 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-400"
                      checked={selectedIds.includes(brand._id)}
                      onChange={() => handleSelect(brand._id)}
                    />
                  </td>
                  <td className="py-2 px-3">
                    {brand.logo ? (
                      <img 
                        src={resolveUrl(brand.logo)} 
                        alt={`Logo ${brand.name}`}
                        className="w-12 h-12 object-contain rounded border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded border border-border flex items-center justify-center">
                        <span className="text-xs text-gray-500">Sin logo</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-text">{brand.name}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-sm text-mutedText max-w-xs truncate">
                      {brand.description || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    {brand.website ? (
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Globe size={14} />
                        Visitar
                      </a>
                    ) : (
                      <span className="text-sm text-mutedText">Sin sitio web</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <StatusBadge isActive={brand.isActive} />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(brand)}
                        className="text-mutedText hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(brand._id)}
                        className="text-mutedText hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <PaginationControls 
          page={pagination.page} 
          totalPages={pagination.totalPages} 
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))} 
        />
      )}

      {/* Modal del Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl shadow-2xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text">
                {editing ? 'Editar Marca' : 'Nueva Marca'}
              </h2>
              <button
                onClick={closeForm}
                className="text-mutedText hover:text-text transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Primera fila: Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                  Nombre *
                </label>
                <input 
                  type="text" 
                  id="name" 
                  className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Apple"
                  required
                />
              </div>

              {/* Eliminado campo Descripción */}

              {/* Logo */}
              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-text mb-2">
                  Logo
                </label>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="logo"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-black/90 text-sm"
                    >
                      Seleccionar logo
                    </button>
                    <span className="text-sm text-mutedText truncate max-w-[240px]">
                      {selectedLogo?.name || (form.logo ? 'Logo actual seleccionado' : 'Ningún archivo seleccionado')}
                    </span>
                  </div>
                  <p className="text-xs text-mutedText">Formatos: JPG, PNG, WebP. Máximo 5MB.</p>
                  
                  {/* Preview del logo */}
                  {(logoPreviewUrl || form.logo) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text">Logo seleccionado:</span>
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                          aria-label="Remover logo"
                        >
                          Remover
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <img 
                          src={resolveUrl(logoPreviewUrl || form.logo)} 
                          alt="Preview del logo"
                          className="w-20 h-20 object-contain rounded-lg border border-border"
                        />
                        <div className="text-sm text-mutedText">
                          <p>Vista previa del logo</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-text mb-2">
                  Estado
                </label>
                <select 
                  id="isActive" 
                  className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={form.isActive.toString()}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
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
                    'Crear Marca'
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



