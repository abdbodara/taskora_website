import { useEffect, useState, useCallback } from 'react';
import { AiOutlinePlus, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdEdit, MdDelete, MdFilterList, MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';
import { FiSearch, FiChevronDown, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { getTechnicians, deleteTechnician } from '../../apiEndPoints/technician';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import AdminLayout from '../../components/admin/AdminLayout';
import AddTechnicianModal from './AddTechnicianModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const TechnicianPage = () => {
  const [technicians, setTechnicians] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.pageSize,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      };

      const res = await getTechnicians(params);
      const { data } = res;

      if (data && data.success) {
        setTechnicians(data.data || []);
        setPagination((prev) => ({
          ...prev,
          page: data.pagination?.page || 1,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 1,
          pageSize: data.pagination?.limit || 10,
        }));
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error('An error occurred while fetching technicians.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, [pagination.page, pagination.pageSize, statusFilter, search]);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => setPagination((prev) => ({ ...prev, page: 1 })), 500));
  };

  const handleDeleteClick = (id) => {
    setTechnicianToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!technicianToDelete) return;
    try {
      const result = await deleteTechnician(technicianToDelete);
      if (result && result.data && result.data.success) {
        toast.success('Technician deleted successfully');
        fetchTechnicians();
        setShowDeleteModal(false);
        setTechnicianToDelete(null);
      } else {
        throw new Error(result?.data?.message || 'Failed to delete technician');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete technician. Please try again.');
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
    setSelectedTechnician(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 ring-1 ring-green-500/30',
      inactive: 'bg-red-100 text-red-700 ring-1 ring-red-500/30',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-500/20';
  };

  // Generate pagination items with ellipsis for better navigation
  const getPaginationItems = () => {
    const items = [];
    const { page, pages } = pagination;
    const maxVisiblePages = isMobile ? 3 : 5;

    if (pages <= maxVisiblePages) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    // Always show first page
    items.push(1);

    // Calculate start and end pages
    let startPage = Math.max(2, page - 1);
    let endPage = Math.min(pages - 1, page + 1);

    // Adjust if we're near the start or end
    if (page <= 3) {
      endPage = maxVisiblePages - 1;
    } else if (page >= pages - 2) {
      startPage = pages - maxVisiblePages + 2;
    }

    // Add ellipsis if needed
    if (startPage > 2) {
      items.push('...');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    // Add ellipsis if needed
    if (endPage < pages - 1) {
      items.push('...');
    }

    // Always show last page
    if (pages > 1) {
      items.push(pages);
    }

    return items;
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const start = (pagination.page - 1) * pagination.pageSize + 1;
  const end = Math.min(pagination.page * pagination.pageSize, pagination.total || 0);

  // Handle window resize for responsive adjustments
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Technician Management</h2>
              <p className="mt-1 text-sm text-gray-500">Manage and track all technicians in one place</p>
            </div>
            <button
              onClick={() => {
                setEditingTechnician(null);
                setShowModal(true);
              }}
              className="theme-bg-btn text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 w-max hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <AiOutlinePlus className="h-5 w-5" />
              Add New Technician
            </button>
          </div>


          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-2 focus:border-blue-500 block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Search technicians by name, email, or phone..."
                    value={search}
                    onChange={handleSearchChange}
                    aria-label="Search technicians"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdFilterList className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="status"
                    name="status"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technicians Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <span>Technician</span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          <p className="text-sm text-gray-500">Loading technicians...</p>
                        </div>
                      </td>
                    </tr>
                  ) : technicians.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <h3 className="text-sm font-medium text-gray-900">No technicians found</h3>
                          <p className="text-sm text-gray-500">
                            {search || statusFilter !== 'all'
                              ? 'Try adjusting your search or filter criteria.'
                              : 'Get started by adding a new technician.'}
                          </p>
                          {(!search && statusFilter === 'all') && (
                            <button
                              onClick={() => setShowModal(true)}
                              className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white theme-bg-btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <AiOutlinePlus className="-ml-1 mr-1 h-3 w-3" />
                              Add Technician
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    technicians.map((tech) => (
                      <tr key={tech.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center theme-bg-btn text-white font-medium">
                              {tech.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{tech.name}</div>
                              <div className="text-xs text-gray-500">ID: {tech.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <a href={`mailto:${tech.email}`} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center">
                              <FiMail className="mr-1.5 h-3.5 w-3.5" />
                              <span className="truncate max-w-[180px]">{tech.email}</span>
                            </a>
                          </div>
                          {tech.phone && (
                            <div className="mt-1 text-sm text-gray-500 flex items-center">
                              <FiPhone className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                              <a href={`tel:${tech.phone}`} className="hover:text-blue-600 hover:underline">
                                {tech.phone}
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tech.status)}`}>
                            {tech.status.charAt(0).toUpperCase() + tech.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-start">
                            <FiMapPin className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 mt-0.5 text-gray-400" />
                            <span className="line-clamp-2">{tech.address || <span className="text-gray-400">No address provided</span>}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTechnician(tech);
                                setShowPasswordModal(true);
                              }}
                              className="text-gray-400 hover:text-purple-700 transition-colors duration-200 p-1.5 rounded-full hover:bg-purple-50"
                              title="Change password"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setEditingTechnician(tech);
                                setShowModal(true);
                              }}
                              className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1.5 rounded-full hover:bg-blue-50"
                              title="Edit technician"
                            >
                              <MdEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(tech.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1.5 rounded-full hover:bg-red-50"
                              title="Delete technician"
                            >
                              <MdDelete className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {/* {pagination.pages > 1 && ( */}
            <div className="bg-white px-4 py-3 flex flex-col xs:flex-row items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden w-full sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 whitespace-nowrap">Rows per page:</span>
                    <select
                      id="pageSize"
                      value={pagination.pageSize}
                      onChange={(e) => setPagination((prev) => ({ ...prev, pageSize: +e.target.value, page: 1 }))}
                      className="appearance-none block w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <nav className="flex items-center space-x-1" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="First page"
                    >
                      <span className="sr-only">First</span>
                      <MdFirstPage className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Previous"
                    >
                      <span className="sr-only">Previous</span>
                      <MdChevronLeft className="h-5 w-5" />
                    </button>

                    {getPaginationItems().map((item, index) => (
                      <button
                        key={index}
                        onClick={() => typeof item === 'number' ? handlePageChange(item) : null}
                        className={`min-w-[36px] px-2 py-1.5 text-sm font-medium rounded-md ${item === '...'
                          ? 'text-gray-500 cursor-default'
                          : pagination.page === item
                            ? 'bg-blue-50 border border-blue-500 text-blue-600'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        disabled={item === '...'}
                      >
                        {item}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Next"
                    >
                      <span className="sr-only">Next</span>
                      <MdChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.pages)}
                      disabled={pagination.page >= pagination.pages}
                      className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Last page"
                    >
                      <span className="sr-only">Last</span>
                      <MdLastPage className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>

              {/* Mobile pagination */}
              <div className="sm:hidden flex-1 flex justify-between items-center mt-2 w-full">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {
        showModal && (
          <AddTechnicianModal
            onClose={() => {
              setShowModal(false);
              setEditingTechnician(null);
            }}
            technician={editingTechnician}
            onSuccess={() => {
              fetchTechnicians();
              toast.success(`Technician ${editingTechnician ? 'updated' : 'added'} successfully`);
            }}
          />
        )
      }

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Technician"
        message="Are you sure you want to delete this technician? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        technician={selectedTechnician}
        onSuccess={handlePasswordChangeSuccess}
      />
    </AdminLayout>
  );
};

export default TechnicianPage;
