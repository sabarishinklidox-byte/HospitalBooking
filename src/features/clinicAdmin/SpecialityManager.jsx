import React, { useState, useEffect } from 'react';
// 1. ✅ Use your centralized API instance (fixes 401 & Base URL issues)
import api from "../../lib/api"; 
import { ENDPOINTS } from "../../lib/endpoints";
import { Plus, Edit2, Trash2, X, Search, AlertCircle } from 'lucide-react';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout';

const SpecialityManager = () => {
  const [specialities, setSpecialities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  // 2. ✅ Fetch Data using 'api'
  const fetchSpecialities = async () => {
    try {
      setIsLoading(true);
      // No need for BASE_URL or getAuthHeader() - 'api' handles it
      const response = await api.get(ENDPOINTS.ADMIN.SPECIALITIES);
      setSpecialities(response.data);
    } catch (error) {
      console.error("Failed to fetch specialities", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialities();
  }, []);

  // Handlers
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({ 
      name: item.name, 
      description: item.description || '', 
      isActive: item.isActive 
    });
    setIsModalOpen(true);
  };

  // 3. ✅ Submit using 'api'
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        await api.put(ENDPOINTS.ADMIN.SPECIALITY_BY_ID(editingId), formData);
      } else {
        // Create
        await api.post(ENDPOINTS.ADMIN.SPECIALITIES, formData);
      }
      setIsModalOpen(false);
      fetchSpecialities();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  // 4. ✅ Delete using 'api'
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? If doctors are using this speciality, you should deactivate it instead of deleting.")) return;
    try {
      await api.delete(ENDPOINTS.ADMIN.SPECIALITY_BY_ID(id));
      fetchSpecialities();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  // Filter Logic
  const filteredData = specialities.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ClinicAdminLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Specialities</h1>
            <p className="text-gray-500 text-sm">Manage medical specialities available for doctors.</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={18} /> Add New
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search specialities (e.g. Dentist)..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Description</th>
                <th className="p-4 border-b">Usage</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Loading specialities...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 flex flex-col items-center">
                    <AlertCircle className="mb-2 text-gray-400" />
                    No specialities found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="p-4 font-medium text-gray-900">{item.name}</td>
                    <td className="p-4 text-gray-500 text-sm max-w-xs truncate">{item.description || '-'}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {/* Only shows if your backend includes _count */}
                      {item._count?.doctors || 0} Doctors
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-3">
                      <button 
                        onClick={() => handleOpenEdit(item)} 
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? 'Edit Speciality' : 'Add New Speciality'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Cardiologist"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    placeholder="Brief description of this field..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">Active Status</label>
                    <span className="text-xs text-gray-500">Uncheck to hide this from doctor selection forms.</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium shadow-md transition transform active:scale-95"
                  >
                    {editingId ? 'Save Changes' : 'Create Speciality'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ClinicAdminLayout>
  );
};

export default SpecialityManager;
