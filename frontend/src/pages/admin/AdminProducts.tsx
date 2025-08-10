import { useEffect, useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { Plus, Edit, Trash2, LoaderCircle, ChevronUp, ChevronDown, Search, AlertTriangle, X, Package } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { http } from '../../lib/http';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  description?: string;
  images?: string[];
  specifications?: Record<string, any>;
  tags?: string[];
};

const initialFormState = {
  name: '',
  brand: 'HP',
  category: 'laptop',
  price: 0,
  stock: 0,
  sku: '',
  description: '',
  images: [],
  specifications: {},
  tags: [],
};

// --- SUB-COMPONENTS ---

function PaginationControls({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (page: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed">‹</button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} disabled={p === page} className={`h-9 w-9 inline-flex items-center justify-center rounded-md border border-border ${p === page ? 'bg-primary text-primary-foreground' : 'bg-surface text-text'} hover:bg-black/5 disabled:opacity-100`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed">›</button>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-200 rounded-full">Agotado</span>;
  }
  if (stock < 10) {
    return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-200 rounded-full">Stock bajo ({stock})</span>;
  }
  return <span className="text-text">{stock}</span>;
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

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, '_id'>>(initialFormState);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ search: '', category: 'all', brand: 'all' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const debouncedSearch = useDebounce(filters.search, 500);

  // --- New states for added features ---
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
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
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.brand !== 'all') params.append('brand', filters.brand);

      const res = await http.get(`${API_BASE}/api/products?${params.toString()}`);
      setProducts(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError('No se pudieron cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort.by, sort.order, debouncedSearch, filters.category, filters.brand]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Cargar marcas y categorías para los selects
  useEffect(() => {
    (async () => {
      try {
        const [brandsRes, catsRes] = await Promise.all([
          http.get(`${API_BASE}/api/brands`),
          http.get(`${API_BASE}/api/categories`),
        ]);
        const bs = Array.from(new Set((brandsRes.data?.data || []).map((b: any) => b.name))).sort();
        const cs = Array.from(new Set((catsRes.data?.data || []).map((c: any) => c.name))).sort();
        setBrands(bs);
        setCategories(cs);
      } catch (e) {
        setBrands([]);
        setCategories([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Limpiar URLs de preview cuando el componente se desmonte
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await http.delete(`${API_BASE}/api/products/${deletingId}`);
      showToast('Producto eliminado exitosamente.', 'success');
      setDeletingId(null);
      fetchProducts(); // Refresh list
    } catch (err) {
      showToast('Error al eliminar el producto.', 'error');
      console.error(err);
      setLoading(false);
    }
  };

  const confirmDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      // Assuming the backend supports bulk delete via POST/DELETE with a body
      await http.post(`${API_BASE}/api/products/bulk-delete`, { ids: selectedIds });
      showToast(`${selectedIds.length} productos eliminados.`, 'success');
      setSelectedIds([]);
      fetchProducts(); // Refresh list
    } catch (err) {
      showToast('Error al eliminar los productos seleccionados.', 'error');
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
    clearImages();
  };

  const openEditForm = (product: Product) => {
    setShowForm(true);
    setEditing(product);
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      description: product.description || '',
      images: product.images || [],
      specifications: product.specifications || {},
      tags: product.tags || [],
    });
    setFormError(null);
    clearImages();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(initialFormState);
    setFormError(null);
    clearImages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      // Crear FormData para enviar imágenes
      const formData = new FormData();
      
      // Agregar campos del formulario
      formData.append('name', form.name);
      formData.append('brand', form.brand);
      formData.append('category', form.category);
      formData.append('price', form.price.toString());
      formData.append('stock', form.stock.toString());
      formData.append('sku', form.sku);
      formData.append('description', form.description || '');
      formData.append('tags', JSON.stringify(form.tags));
      
      // Agregar imágenes si hay archivos seleccionados
      if (selectedImages.length > 0) {
        selectedImages.forEach((file) => {
          formData.append('images', file);
        });
      } else if (form.images && form.images.length > 0) {
        // Si no hay archivos nuevos pero hay URLs existentes (edición)
        formData.append('existingImages', JSON.stringify(form.images));
      }

      if (editing) {
        await http.put(`${API_BASE}/api/products/${editing._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast('Producto actualizado exitosamente.', 'success');
      } else {
        await http.post(`${API_BASE}/api/products`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast('Producto creado exitosamente.', 'success');
      }
      closeForm();
      fetchProducts();
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      showToast('Solo se permiten archivos de imagen (JPG, PNG, WebP)', 'error');
      return;
    }

    // Validar tamaño (máximo 5MB por archivo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      showToast('Las imágenes no pueden superar 5MB cada una', 'error');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    // Crear URLs de preview
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revocar URL del objeto para liberar memoria
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const clearImages = () => {
    setSelectedImages([]);
    setImagePreviewUrls(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
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
        message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <button 
          className="h-9 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          onClick={openCreateForm} 
          disabled={loading}
        >
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 p-4 bg-surface border border-border rounded-xl">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedText" />
          <input 
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="h-9 w-full pl-10 pr-4 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <select 
          className="h-9 pl-3 pr-8 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="all">Todas las Categorías</option>
          {['laptop', 'desktop', 'tablet', 'smartphone', 'accessory'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className="h-9 pl-3 pr-8 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
          value={filters.brand}
          onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
        >
          <option value="all">Todas las Marcas</option>
          {['HP', 'Dell', 'Apple', 'Lenovo', 'Asus', 'Samsung'].map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-100 border border-blue-300 rounded-xl">
          <span className="text-sm font-medium text-blue-800">{selectedIds.length} productos seleccionados</span>
          <button 
            onClick={confirmDeleteSelected}
            className="h-8 px-3 inline-flex items-center justify-center gap-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            <Trash2 size={16} />
            Eliminar Seleccionados
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
                  checked={products.length > 0 && selectedIds.length === products.length}
                />
              </th>
              <SortableHeader field="sku" label="SKU" />
              <SortableHeader field="name" label="Nombre" />
              <SortableHeader field="brand" label="Marca" />
              <SortableHeader field="category" label="Categoría" />
              <SortableHeader field="price" label="Precio" />
              <SortableHeader field="stock" label="Stock" />
              <th className="py-2 px-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <LoaderCircle className="animate-spin text-primary" size={32} />
                    <span className="text-mutedText">Cargando productos...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <AlertTriangle className="text-red-500" size={32} />
                    <span className="text-red-600 font-medium">Error al cargar productos</span>
                    <span className="text-sm text-mutedText">{error}</span>
                    <button 
                      onClick={fetchProducts}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-mutedText/10 rounded-full flex items-center justify-center">
                      <Package className="text-mutedText" size={24} />
                    </div>
                    <span className="text-mutedText font-medium">No se encontraron productos</span>
                    <span className="text-sm text-mutedText">Aún no se han creado productos en el sistema</span>
                    <button 
                      onClick={openCreateForm}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Crear Primer Producto
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className={`border-t border-border hover:bg-black/5 ${selectedIds.includes(p._id) ? 'bg-blue-50' : ''}`}>
                  <td className="py-2 px-3 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-400"
                      checked={selectedIds.includes(p._id)}
                      onChange={() => handleSelect(p._id)}
                    />
                  </td>
                  <td className="py-2 px-3 text-mutedText">{p.sku}</td>
                  <td className="py-2 px-3 text-text font-medium">{p.name}</td>
                  <td className="py-2 px-3 text-mutedText">{p.brand}</td>
                  <td className="py-2 px-3 text-mutedText capitalize">{p.category}</td>
                  <td className="py-2 px-3">${p.price.toFixed(2)}</td>
                  <td className="py-2 px-3">
                    <StockBadge stock={p.stock} />
                  </td>
                  <td className="py-2 px-3 space-x-2">
                    <button className="text-mutedText hover:text-primary" onClick={() => openEditForm(p)} disabled={loading}><Edit size={16} /></button>
                    <button className="text-mutedText hover:text-red-600" onClick={() => setDeletingId(p._id)} disabled={loading}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <PaginationControls page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))} />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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
              
              {/* Primera fila: Nombre y Marca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                    Nombre del Producto *
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: MacBook Air M2"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-text mb-2">
                    Marca *
                  </label>
                  <select 
                    id="brand" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Segunda fila: Categoría y SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-text mb-2">
                    Categoría *
                  </label>
                  <select 
                    id="category" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((c) => (
                      <option key={c} value={c.toLowerCase()} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-text mb-2">
                    SKU *
                  </label>
                  <input 
                    type="text" 
                    id="sku" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Ej: APPLE-MBA-M2-001"
                    required
                  />
                </div>
              </div>

              {/* Tercera fila: Precio y Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-text mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedText">$</span>
                    <input 
                      type="number" 
                      id="price" 
                      className="h-11 w-full pl-8 pr-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      value={form.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-text mb-2">
                    Stock *
                  </label>
                  <input 
                    type="number" 
                    id="stock" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={form.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Cuarta fila: Descripción */}
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
                  placeholder="Describe las características principales del producto..."
                />
              </div>

              {/* Quinta fila: Imágenes y Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-text mb-2">
                    Cargar Imágenes
                  </label>
                  <div className="space-y-3">
                    <input 
                      type="file" 
                      id="images" 
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-mutedText">
                      Formatos: JPG, PNG, WebP. Máximo 5MB por imagen.
                    </p>
                    
                    {/* Preview de imágenes */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-text">Imágenes seleccionadas:</span>
                          <button
                            type="button"
                            onClick={clearImages}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Limpiar todas
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={url} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-text mb-2">
                    Tags
                  </label>
                  <textarea 
                    id="tags" 
                    rows={3}
                    className="w-full px-3 py-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    value={(form.tags || []).join(', ')}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                    placeholder="apple, m2, laptop, portatil"
                  />
                  <p className="text-xs text-mutedText mt-1">
                    Separados por comas
                  </p>
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
                  className="h-11 px-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
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
                    'Crear Producto'
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


