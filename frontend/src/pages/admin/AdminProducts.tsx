import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/products`).then((res) => setProducts(res.data?.data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Productos</h1>
      <div className="bg-surface border border-border rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">SKU</th>
              <th className="py-2">Nombre</th>
              <th className="py-2">Marca</th>
              <th className="py-2">Categoría</th>
              <th className="py-2">Precio</th>
              <th className="py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-border">
                <td className="py-2">{p.sku}</td>
                <td className="py-2">{p.name}</td>
                <td className="py-2">{p.brand}</td>
                <td className="py-2">{p.category}</td>
                <td className="py-2">${p.price}</td>
                <td className="py-2">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


