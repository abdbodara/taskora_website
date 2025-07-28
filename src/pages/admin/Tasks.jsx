import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { AddTaskModal } from './AddTaskModal';
import { getTasks, deleteTask, getComments } from "../../apiEndPoints/tasks.js";
import { FiChevronDown } from 'react-icons/fi';
import { MdChevronLeft, MdChevronRight, MdDelete, MdFirstPage, MdLastPage, MdEdit, MdError, MdClose } from 'react-icons/md';
import { IoMdEye } from 'react-icons/io';
import { AiOutlinePlus, AiOutlineCheckCircle, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { TechniciansModal } from '../../components/common/TechniciansModal.jsx';
import toast from 'react-hot-toast';

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        priority: 'all'
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTechniciansModal, setShowTechniciansModal] = useState(false);
    const [selectedTechnicians, setSelectedTechnicians] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [currentTaskComments, setCurrentTaskComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total || 0);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = {
                page: pagination.page,
                limit: pagination.pageSize,
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.priority !== 'all' && { priority: filters.priority }),
                ...(filters.search && { search: filters.search })
            };

            const response = await getTasks(new URLSearchParams(params));
            const { data } = response;

            if (data && data.success) {
                setTasks(data.data || []);
                setPagination(prev => ({
                    ...prev,
                    page: data.pagination?.page || 1,
                    total: data.pagination?.total || 0,
                    pages: data.pagination?.pages || 1,
                    pageSize: data.pagination?.limit || 10,
                }));
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('An error occurred while fetching tasks.');
            setTasks([]);
            // Reset to first page on error
            setPagination(prev => ({
                ...prev,
                current: 1,
                pages: 1,
                total: 0
            }));
        } finally {
            setLoading(false);
        }
    };

    // Handle data fetching with debounce for search/filters and pagination
    useEffect(() => {
        fetchTasks();
    }, [pagination.page, pagination.pageSize, filters.status, filters.priority, filters.search]);

    // Handle search debounce
    useEffect(() => {
        if (searchTimeout) clearTimeout(searchTimeout);

        const timeoutId = setTimeout(() => {
            setPagination(prev => ({
                ...prev,
                page: 1 // Reset to first page on filter change
            }));
        }, 500);

        setSearchTimeout(timeoutId);

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [filters.search, filters.status, filters.priority]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            in_progress: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDeleteClick = (taskId) => {
        setTaskToDelete(taskId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;

        try {
            setLoading(true);
            const response = await deleteTask(taskToDelete);

            if (response.data && response.data.success) {
                // If the deleted task was on the current page and it was the last item,
                // go to the previous page
                if (tasks.length === 1 && pagination.current > 1) {
                    setPagination(prev => ({
                        ...prev,
                        current: prev.current - 1
                    }));
                } else {
                    fetchTasks();
                }
                toast.success('Task deleted successfully');
            } else {
                throw new Error(response.data?.message || 'Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete task';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setTaskToDelete(null);
        }
    };

    const handleViewComments = async (taskId) => {
        console.log(taskId);
        setSelectedTaskId(taskId);
        setLoadingComments(true);
        setShowCommentsModal(true);

        try {
            const response = await getComments(taskId);
            if (response.data && response.data.success) {
                setCurrentTaskComments(response.data.data || []);
            } else {
                throw new Error('Failed to load comments');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Failed to load comments');
            setCurrentTaskComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowAddModal(true);
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

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setTaskToDelete(null);
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper functions for formatting
    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    const formatPriority = (priority) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    // Using the existing getStatusColor function that's already defined above
    // No need for a duplicate function

    const getPriorityDotColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
            default:
                return 'bg-green-500';
        }
    };

    const closeCommentsModal = () => {
        setShowCommentsModal(false);
        setCurrentTaskComments([]);
        setSelectedTaskId(null);
    };

    return (
        <AdminLayout>
            <div className="p-4 md:p-6">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Task Management</h2>
                            <p className="mt-1 text-sm text-gray-500">Manage and track all tasks in one place</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingTask(null);
                                setShowAddModal(true);
                            }}
                            className="theme-bg-btn text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 w-max hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <AiOutlinePlus className="h-5 w-5" />
                            Create New Task
                        </button>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search Input */}
                            <div className="md:col-span-2">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="search"
                                        id="search"
                                        className="focus:ring-2  focus:border-blue-500 block w-full pl-10 pr-3 py-2.5 rounded-lg  border border-gray-300 bg-white text-gray-700 focus:outline-none  focus:border-transparent transition-all duration-200 text-sm"
                                        placeholder="Search tasks..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <div className="relative">
                                    <div className="relative">
                                        <select
                                            id="status"
                                            name="status"
                                            value={filters.status}
                                            onChange={handleFilterChange}
                                            className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="on_hold">On Hold</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FiChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Priority Filter */}
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <div className="relative">
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={filters.priority}
                                        onChange={handleFilterChange}
                                        className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                    >
                                        <option value="all">All Priorities</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FiChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <span>Task</span>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                        <th scope="col" className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                    <p className="text-sm text-gray-500">Loading tasks...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : tasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <h3 className="text-sm font-medium text-gray-900">No tasks found</h3>
                                                    <p className="text-sm text-gray-500">Get started by creating a new task.</p>
                                                    <button
                                                        onClick={() => setShowAddModal(true)}
                                                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white theme-bg-btn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <AiOutlinePlus className="-ml-1 mr-1 h-3 w-3" />
                                                        New Task
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        tasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 mr-4">
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                                            <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                                        {formatStatus(task.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${getPriorityDotColor(task.priority)} mr-2`}></span>
                                                        <span className="text-sm text-gray-900">{formatPriority(task.priority)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-900">{formatDate(task.dueDate)}</span>
                                                        {isOverdue(task.dueDate) && (
                                                            <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {task.technicians && task.technicians.length > 0 ? (
                                                            <div className="flex -space-x-2">
                                                                {task.technicians.slice(0, 3).map((tech) => (
                                                                    <div key={tech.id} className="relative group">
                                                                        <div
                                                                            className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold border-2 border-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                                                                        >
                                                                            {tech.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                        </div>
                                                                        <div className="absolute z-10 left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg">
                                                                            {tech.name}
                                                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2.5 h-2.5 bg-gray-800 rotate-45"></div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {task.technicians.length > 3 && (
                                                                    <div
                                                                        className="relative group"
                                                                        onClick={() => {
                                                                            setSelectedTechnicians(task.technicians);
                                                                            setShowTechniciansModal(true);
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-500 text-xs font-semibold border-2 border-white shadow-sm cursor-pointer"
                                                                            title={`Show all ${task.technicians.length} technicians`}
                                                                        >
                                                                            +{task.technicians.length - 3}
                                                                        </div>
                                                                        <TechniciansModal
                                                                            isOpen={showTechniciansModal}
                                                                            onClose={() => setShowTechniciansModal(false)}
                                                                            technicians={selectedTechnicians}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                                </svg>
                                                                Assign Team
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleViewComments(task.id)}
                                                            className="text-gray-400 hover:text-purple-600 transition-colors duration-200 p-1.5 rounded-full hover:bg-purple-50 "
                                                            title="View Comments"
                                                        >
                                                            <IoMdEye className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditTask(task)}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1.5 rounded-full hover:bg-blue-50"
                                                            title="Edit Task"
                                                        >
                                                            <MdEdit className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(task.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors duration-200 p-1.5 rounded-full hover:bg-red-50"
                                                            title="Delete Task"
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

            <AddTaskModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingTask(null);
                }}
                onSuccess={() => {
                    fetchTasks();
                    setEditingTask(null);
                }}
                taskToEdit={editingTask}
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                confirmButtonStyle="bg-red-600 hover:bg-red-700"
                isLoading={loading}
            />

            {/* Comments Modal */}
            {showCommentsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100">
                        {/* Header */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Task Comments</h3>
                                <p className="text-sm text-gray-500 mt-1">View and manage task comments</p>
                            </div>
                            <button
                                onClick={closeCommentsModal}
                                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors duration-200"
                                aria-label="Close comments"
                            >
                                <MdClose className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
                            {loadingComments ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <AiOutlineLoading3Quarters className="animate-spin h-10 w-10 text-blue-600 mb-3" />
                                    <p className="text-sm text-gray-500">Loading comments...</p>
                                </div>
                            ) : currentTaskComments.length > 0 ? (
                                <div className="space-y-4">
                                    {currentTaskComments.map((comment, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow duration-200">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                                    {comment.technicians?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {comment.technicians?.name || 'Unknown User'}
                                                        </h4>
                                                        <span className="text-xs text-gray-400 ml-2">
                                                            {new Date(comment.createdAt).toLocaleString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap break-words">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-gray-700 font-medium mb-1">No comments yet</h4>
                                    <p className="text-sm text-gray-500 max-w-xs">Be the first to add a comment for this task.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeCommentsModal}
                                    className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Technicians Modal */}
            <TechniciansModal
                isOpen={showTechniciansModal}
                onClose={() => setShowTechniciansModal(false)}
                technicians={selectedTechnicians}
            />
        </AdminLayout>
    );
}

export default Tasks;