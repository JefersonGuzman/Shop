import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Search, Edit, Trash2, ChevronUp, ChevronDown, X, LoaderCircle, AlertTriangle, Package, Truck, CreditCard, Calendar } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { http } from '../../lib/http';

type Order = {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      images?: string[];
    };
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
};

const initialFormState = {
  status: 'pending' as Order['status'],
  paymentStatus: 'pending' as Order['paymentStatus'],
  notes: '',
};

// --- SUB-COMPONENTS ---

function StatusBadge({ status }: { status: Order['status'] }) {
  const statusConfig = {
    pending: { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800', icon: Calendar },
    confirmed: { label: 'Confirmado', classes: 'bg-blue-100 text-blue-800', icon: CreditCard },
    processing: { label: 'Procesando', classes: 'bg-purple-100 text-purple-800', icon: Package },
    shipped: { label: 'Enviado', classes: 'bg-indigo-100 text-indigo-800', icon: Truck },
    delivered: { label: 'Entregado', classes: 'bg-green-100 text-green-800', icon: CreditCard },
    cancelled: { label: 'Cancelado', classes: 'bg-red-100 text-red-800', icon: AlertTriangle },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${config.classes}`}>
      <IconComponent size={12} />
      {config.label}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: Order['paymentStatus'] }) {
  const statusConfig = {
    pending: { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800', icon: Calendar },
    paid: { label: 'Pagado', classes: 'bg-green-100 text-green-800', icon: CreditCard },
    failed: { label: 'Fallido', classes: 'bg-red-100 text-red-800', icon: AlertTriangle },
    refunded: { label: 'Reembolsado', classes: 'bg-gray-100 text-gray-800', icon: CreditCard },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${config.classes}`}>
      <IconComponent size={12} />
      {config.label}
    </span>
  );
}

function OrderDetailsModal({ order, open, onClose }: { order: Order | null, open: boolean, onClose: () => void }) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Orden #{order.orderNumber}</h2>
              <p className="text-mutedText">Creada el {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-mutedText hover:text-text p-2 rounded-full hover:bg-black/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información del Cliente */}
          <div className="bg-black/5 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-mutedText">Nombre</p>
                <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-mutedText">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
            </div>
          </div>

          {/* Dirección de Envío */}
          <div className="bg-black/5 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Dirección de Envío</h3>
            <p className="text-sm">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
            </p>
          </div>

          {/* Productos */}
          <div className="bg-black/5 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Productos</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-border">
                  {item.product.images && item.product.images[0] && (
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-grow">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-mutedText">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-mutedText">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-black/5 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState(initialFormState);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ search: '', status: 'all', paymentStatus: 'all' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [sort, setSort] = useState({ by: 'createdAt', order: 'desc' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        sortBy: sort.by,
        sortOrder: sort.order,
      });
      if (debouncedSearch) params.append('q', debouncedSearch);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.paymentStatus !== 'all') params.append('paymentStatus', filters.paymentStatus);

      const res = await http.get(`/api/admin/orders?${params.toString()}`);
      setOrders(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setError('No se pudieron cargar las órdenes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort.by, sort.order, debouncedSearch, filters.status, filters.paymentStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      await http.delete(`/api/admin/orders/${deletingId}`);
      showToast('Orden eliminada exitosamente.', 'success');
      setDeletingId(null);
      fetchOrders();
    } catch (err) {
      showToast('Error al eliminar la orden.', 'error');
      console.error(err);
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    const newOrder = sort.by === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ by: field, order: newOrder });
  };

  const openEditForm = (order: Order) => {
    setShowForm(true);
    setEditing(order);
    setForm({
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: '',
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
        await http.patch(`/api/admin/orders/${editing._id}`, form);
        showToast('Orden actualizada exitosamente.', 'success');
      }
      closeForm();
      fetchOrders();
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
        message="¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer."
      />
      <OrderDetailsModal 
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
        <div className="text-sm text-mutedText">
          Total: {pagination.total} órdenes
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 p-4 bg-surface border border-border rounded-xl">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedText" />
          <input 
            type="text"
            placeholder="Buscar por número de orden o cliente..."
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
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado</option>
          <option value="processing">Procesando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select 
          className="h-9 pl-3 pr-8 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
          value={filters.paymentStatus}
          onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
        >
          <option value="all">Todos los Pagos</option>
          <option value="pending">Pendiente</option>
          <option value="paid">Pagado</option>
          <option value="failed">Fallido</option>
          <option value="refunded">Reembolsado</option>
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-mutedText text-xs bg-black/5">
              <SortableHeader field="orderNumber" label="Orden" />
              <SortableHeader field="customer.firstName" label="Cliente" />
              <th className="py-2 px-3 font-medium">Productos</th>
              <th className="py-2 px-3 font-medium">Total</th>
              <SortableHeader field="status" label="Estado" />
              <th className="py-2 px-3 font-medium">Pago</th>
              <SortableHeader field="createdAt" label="Fecha" />
              <th className="py-2 px-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <LoaderCircle className="animate-spin text-primary" size={32} />
                    <span className="text-mutedText">Cargando órdenes...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <AlertTriangle className="text-red-500" size={32} />
                    <span className="text-red-600 font-medium">Error al cargar órdenes</span>
                    <span className="text-sm text-mutedText">{error}</span>
                    <button 
                      onClick={fetchOrders}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-mutedText/10 rounded-full flex items-center justify-center">
                      <Package className="text-mutedText" size={24} />
                    </div>
                    <span className="text-mutedText font-medium">No se encontraron órdenes</span>
                    <span className="text-sm text-mutedText">Aún no se han creado órdenes en el sistema</span>
                    <button 
                      onClick={() => window.location.href = '/admin/products'}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Ver Productos
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-t border-border hover:bg-black/5">
                  <td className="py-2 px-3">
                    <div className="font-medium text-text">#{order.orderNumber}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-text">{order.customer.firstName} {order.customer.lastName}</div>
                    <div className="text-xs text-mutedText">{order.customer.email}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-sm text-mutedText">{order.items.length} producto(s)</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-medium text-text">${order.total.toFixed(2)}</div>
                  </td>
                  <td className="py-2 px-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-2 px-3">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="py-2 px-3 text-mutedText">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 space-x-2">
                    <button 
                      className="text-mutedText hover:text-blue-600" 
                      onClick={() => setSelectedOrder(order)}
                      title="Ver detalles"
                    >
                      <CreditCard size={16} />
                    </button>
                    <button 
                      className="text-mutedText hover:text-primary" 
                      onClick={() => openEditForm(order)}
                      disabled={loading}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="text-mutedText hover:text-red-600" 
                      onClick={() => setDeletingId(order._id)}
                      disabled={loading}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Editar Orden #{editing.orderNumber}</h2>
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
              
              {/* Estado de la Orden */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-text mb-2">
                  Estado de la Orden *
                </label>
                <select 
                  id="status" 
                  className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={form.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  required
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Estado del Pago */}
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-text mb-2">
                  Estado del Pago *
                </label>
                <select 
                  id="paymentStatus" 
                  className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={form.paymentStatus}
                  onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                  required
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="failed">Fallido</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-text mb-2">
                  Notas (opcional)
                </label>
                <textarea 
                  id="notes" 
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notas adicionales sobre la orden..."
                />
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
                  ) : (
                    'Guardar Cambios'
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


