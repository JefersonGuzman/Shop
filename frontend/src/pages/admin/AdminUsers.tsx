// @ts-nocheck
import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, X, LoaderCircle, AlertTriangle, Shield, UserCheck, UserX, User } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { http } from '../../lib/http';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type UserType = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee' | 'customer';
  isActive: boolean;
  createdAt?: string;
};

type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'employee' | 'customer';
  isActive: boolean;
  password?: string;
};

type EditingUser = {
  id: string;
  formData: UserFormData;
};

// --- SUB-COMPONENTS ---

function RoleBadge({ role }: { role: UserType['role'] }) {
  const roleConfig = {
    admin: { label: 'Administrador', classes: 'bg-red-100 text-red-800', icon: Shield },
    employee: { label: 'Empleado', classes: 'bg-blue-100 text-blue-800', icon: User },
    customer: { label: 'Cliente', classes: 'bg-gray-100 text-gray-800', icon: User },
  };

  const config = roleConfig[role];
  const IconComponent = config.icon;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${config.classes}`}>
      <IconComponent size={12} />
      {config.label}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-200 rounded-full inline-flex items-center gap-1">
        <UserCheck size={12} />
        Activo
      </span>
    );
  }
  
  return (
    <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-200 rounded-full inline-flex items-center gap-1">
      <UserX size={12} />
      Inactivo
    </span>
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

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [sort, setSort] = useState({
    by: 'createdAt' as keyof UserType,
    order: 'desc' as 'asc' | 'desc'
  });
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const isEdit = Boolean(editingUser && editingUser.id);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        sortBy: sort.by,
        sortOrder: sort.order,
      });
      if (debouncedSearch) params.append('q', debouncedSearch);

      const res = await http.get(`${API_BASE}/api/admin/users?${params.toString()}`);
      setUsers(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort.by, sort.order, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    if (!userToDelete) return;
    setLoading(true);
    try {
      await http.delete(`${API_BASE}/api/admin/users/${userToDelete._id}`);
      showToast('Usuario eliminado exitosamente.', 'success');
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      showToast('Error al eliminar el usuario.', 'error');
      console.error(err);
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    const newOrder = sort.by === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ by: field as keyof UserType, order: newOrder });
  };

  const openCreateForm = () => {
    setEditingUser({ id: '', formData: { firstName: '', lastName: '', email: '', role: 'employee', isActive: true, password: '' } });
    setShowEditModal(true);
  };

  const openEditForm = (user: UserType) => {
    setEditingUser({ id: user._id, formData: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: '', // Password is not editable in this form
    } });
    setShowEditModal(true);
  };

  const closeForm = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && editingUser) {
        await http.patch(`${API_BASE}/api/admin/users/${editingUser.id}`, {
          firstName: editingUser.formData.firstName,
          lastName: editingUser.formData.lastName,
          email: editingUser.formData.email,
          role: editingUser.formData.role,
          isActive: editingUser.formData.isActive,
        });
        showToast('Usuario actualizado exitosamente.', 'success');
      } else {
        await http.post(`${API_BASE}/api/admin/users`, {
          firstName: editingUser?.formData.firstName,
          lastName: editingUser?.formData.lastName,
          email: editingUser?.formData.email,
          password: editingUser?.formData.password,
          role: editingUser?.formData.role,
        });
        showToast('Usuario creado exitosamente.', 'success');
      }
      closeForm();
      fetchUsers();
    } catch (err) {
      if (err instanceof AxiosError) {
        showToast(err.response?.data?.message || 'Error al procesar la solicitud.', 'error');
      } else {
        showToast('Error inesperado.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    if (editingUser) {
      setEditingUser(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          [field]: value
        }
      }));
    }
  };

  const toggleActive = async (user: UserType) => {
    try {
      await http.patch(`${API_BASE}/api/admin/users/${user._id}`, { isActive: !user.isActive });
      showToast(`Usuario ${user.isActive ? 'desactivado' : 'activado'} exitosamente.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Error al cambiar el estado del usuario.', 'error');
    }
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
        open={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button 
          className="h-9 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          onClick={openCreateForm} 
          disabled={loading}
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 p-4 bg-surface border border-border rounded-xl">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedText" />
          <input 
            type="text"
            placeholder="Buscar por nombre o email..."
            className="h-9 w-full pl-10 pr-4 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="h-9 pl-3 pr-8 rounded-md border border-border bg-surface focus:ring-2 focus:ring-primary"
          value={editingUser?.formData.role || 'all'}
          onChange={(e) => handleInputChange('role', e.target.value as UserType['role'])}
        >
          <option value="all">Todos los Roles</option>
          <option value="admin">Administradores</option>
          <option value="employee">Empleados</option>
          <option value="customer">Clientes</option>
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="text-mutedText text-xs bg-black/5">
              <SortableHeader field="firstName" label="Nombre" />
              <SortableHeader field="email" label="Email" />
              <th className="py-2 px-3 font-medium">Rol</th>
              <th className="py-2 px-3 font-medium">Estado</th>
              <th className="py-2 px-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8"><LoaderCircle className="animate-spin inline-block text-primary" size={32} /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-mutedText">No se encontraron usuarios.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-t border-border hover:bg-black/5">
                  <td className="py-2 px-3">
                    <div className="font-medium text-text">{user.firstName} {user.lastName}</div>
                  </td>
                  <td className="py-2 px-3 text-mutedText">{user.email}</td>
                  <td className="py-2 px-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-2 px-3">
                    <StatusBadge isActive={user.isActive} />
                  </td>
                  <td className="py-2 px-3 space-x-2">
                    <button className="text-mutedText hover:text-primary" onClick={() => openEditForm(user)} disabled={loading}>
                      <Edit size={16} />
                    </button>
                    <button 
                      className="text-mutedText hover:text-blue-600" 
                      onClick={() => toggleActive(user)} 
                      disabled={loading}
                      title={user.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button className="text-mutedText hover:text-red-600" onClick={() => setUserToDelete(user)} disabled={loading}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                <button 
                  onClick={closeForm}
                  className="text-mutedText hover:text-text p-2 rounded-full hover:bg-black/5"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Primera fila: Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-text mb-2">
                    Nombre *
                  </label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={editingUser?.formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Juan"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-text mb-2">
                    Apellido *
                  </label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={editingUser?.formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>

              {/* Segunda fila: Email y Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                    Email *
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={editingUser?.formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="juan.perez@ejemplo.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                    {isEdit ? 'Nueva Password (opcional)' : 'Password *'}
                  </label>
                  <input 
                    type="password" 
                    id="password" 
                    className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    value={editingUser?.formData.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder={isEdit ? 'Dejar en blanco para mantener' : 'Mínimo 6 caracteres'}
                    required={!isEdit}
                  />
                </div>
              </div>

              {/* Tercera fila: Rol */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-text mb-2">
                  Rol *
                </label>
                <select 
                  id="role" 
                  className="h-11 w-full px-3 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  value={editingUser?.formData.role || 'employee'}
                  onChange={(e) => handleInputChange('role', e.target.value as UserType['role'])}
                  required
                >
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                  <option value="customer">Cliente</option>
                </select>
                <p className="text-xs text-mutedText mt-1">
                  Los administradores tienen acceso completo al sistema
                </p>
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
                  ) : isEdit ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Usuario'
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


