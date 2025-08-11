import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, X, LoaderCircle, AlertTriangle, Package } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { http } from '../../lib/http';

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const initialFormState = {
  name: '',
  slug: '',
  description: '',
  color: '#3B82F6',
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

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, '_id' | 'createdAt' | 'updatedAt'>>(initialFormState);
  
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

  const fetchCategories = useCallback(async () => {
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

      const res = await http.get(`/api/categories?${params.toString()}`);
      setCategories(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError('No se pudieron cargar las categorías.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort.by, sort.order, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(categories.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await http.delete(`/api/categories/${deletingId}`);
      showToast('Categoría eliminada exitosamente.', 'success');
      setDeletingId(null);
      fetchCategories();
    } catch (err) {
      showToast('Error al eliminar la categoría.', 'error');
      console.error(err);
      setLoading(false);
    }
  };

  const confirmDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await http.post('/api/categories/bulk-delete', { ids: selectedIds });
      showToast(`${selectedIds.length} categorías eliminadas.`, 'success');
      setSelectedIds([]);
      fetchCategories();
    } catch (err) {
      showToast('Error al eliminar las categorías seleccionadas.', 'error');
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
  };

  const openEditForm = (category: Category) => {
    setShowForm(true);
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6',
      isActive: category.isActive,
    });
    setFormError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(initialFormState);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      if (editing) {
        await http.put(`/api/categories/${editing._id}`, form);
        showToast('Categoría actualizada exitosamente.', 'success');
      } else {
        await http.post('/api/categories', form);
        showToast('Categoría creada exitosamente.', 'success');
      }
      closeForm();
      fetchCategories();
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
        message="¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer."
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
        <button 
          className="h-8 px-3 inline-flex items-center justify-center gap-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50 text-sm"
          onClick={openCreateForm} 
          disabled={loading}
        >
          <Plus size={18} />
          Nueva Categoría
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
          <span className="text-sm font-medium text-blue-800">{selectedIds.length} categorías seleccionadas</span>
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
                  checked={categories.length > 0 && selectedIds.length === categories.length}
                />
              </th>
              <SortableHeader field="name" label="Nombre" />
              <SortableHeader field="slug" label="Slug" />
              <th className="py-2 px-3 font-medium">Descripción</th>
              <th className="py-2 px-3 font-medium">Color</th>
              <SortableHeader field="isActive" label="Estado" />
              <th className="py-2 px-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <LoaderCircle className="animate-spin text-primary" size={32} />
                    <span className="text-mutedText">Cargando categorías...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <AlertTriangle className="text-red-500" size={32} />
                    <span className="text-red-600 font-medium">Error al cargar categorías</span>
                    <span className="text-sm text-mutedText">{error}</span>
                    <button 
                      onClick={fetchCategories}
                      className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-black/90 text-sm"
                    >
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-mutedText/10 rounded-full flex items-center justify-center">
                      <Package className="text-mutedText" size={24} />
                    </div>
                    <span className="text-mutedText font-medium">No se encontraron categorías</span>
                    <span className="text-sm text-mutedText">Aún no se han creado categorías en el sistema</span>
                    <button 
                      onClick={openCreateForm}
                      className="h-8 px-3 inline-flex items-center justify-center rounded-md bg-black text-white hover:bg-black/90 text-sm"
                    >
                      Crear Primera Categoría
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id} className={`border-t border-border hover:bg-black/5 ${selectedIds.includes(category._id) ? 'bg-blue-50' : ''}`}>
                  <td className="py-2 px-3 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-400"
                      checked={selectedIds.includes(category._id)}
                      onChange={() => handleSelect(category._id)}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-text">{category.name}</div>
                  </td>
                  <td className="py-2 px-3">
                    <code className="text-sm bg-black/5 px-2 py-1 rounded">/{category.slug}</code>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-sm text-mutedText max-w-xs truncate">
                      {category.description || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    {category.color && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border border-border"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs text-mutedText">{category.color}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <StatusBadge isActive={category.isActive} />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(category)}
                        className="text-mutedText hover:text-black transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(category._id)}
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
                {editing ? 'Editar Categoría' : 'Nueva Categoría'}
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
              {/* Primera fila: Nombre y Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Laptops"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-text mb-2">
                    Slug *
                  </label>
                  <input 
                    type="text" 
                    id="slug" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="laptops"
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
                  placeholder="Describe la categoría..."
                />
              </div>

              {/* Tercera fila: Color y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-text mb-2">
                    Color de Marca
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      id="color" 
                      className="h-11 w-16 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      value={form.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="h-11 flex-1 px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-mono text-sm"
                      value={form.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
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
                    'Crear Categoría'
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



