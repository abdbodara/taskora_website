import { useState, useEffect, useRef } from 'react';
import { createTask, updateTask } from '../../apiEndPoints/tasks';
import { getTechnicians } from '../../apiEndPoints/technician';
import { X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const AddTaskModal = ({ isOpen, onClose, onSuccess, taskToEdit = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'low',
        dueDate: '',
        technicianIds: []
    });

    // Initialize form with task data when in edit mode
    useEffect(() => {
        if (taskToEdit) {
            setFormData({
                title: taskToEdit.title || '',
                description: taskToEdit.description || '',
                status: taskToEdit.status || 'pending',
                priority: taskToEdit.priority || 'low',
                dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
                technicianIds: taskToEdit.technicians ? taskToEdit.technicians.map(t => t.id) : []
            });
        } else {
            // Reset form when opening in add mode
            setFormData({
                title: '',
                description: '',
                status: 'pending',
                priority: 'low',
                dueDate: '',
                technicianIds: []
            });
        }
    }, [taskToEdit, isOpen]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTechnicians();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchTechnicians = async () => {
        try {
            const response = await getTechnicians();
            if (response.data && response.data?.success) {
                setTechnicians(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching technicians:', err);
            toast.error('Failed to load technicians');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredTechnicians = technicians.filter(tech =>
        !formData.technicianIds.includes(tech.id) &&
        (tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tech.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAddTechnician = (techId) => {
        if (!formData.technicianIds.includes(techId)) {
            setFormData(prev => ({
                ...prev,
                technicianIds: [...prev.technicianIds, techId]
            }));
            setSearchTerm('');
        }
        setIsDropdownOpen(false);
    };

    const handleRemoveTechnician = (techId) => {
        setFormData(prev => ({
            ...prev,
            technicianIds: prev.technicianIds.filter(id => id !== techId)
        }));
    };

    const getSelectedTechnicians = () => {
        return formData.technicianIds.map(id =>
            technicians.find(tech => tech.id === id)
        ).filter(Boolean);
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error("Title is required.");
            return false;
        }

        const selectedDate = new Date(formData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Set minimum allowed date to tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        if (selectedDate < tomorrow) {
            toast.error("Please select a future date (tomorrow or later).");
            return false;
        }

        if (formData.technicianIds.length === 0) {
            toast.error("Please assign at least one technician.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const taskData = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                dueDate: formData.dueDate,
                technicianIds: formData.technicianIds
            };

            let res;
            if (taskToEdit) {
                res = await updateTask(taskToEdit.id, taskData);
                toast.success("Task updated successfully!");
            } else {
                res = await createTask(taskData);
                toast.success("Task created successfully!");
            }
            onSuccess();
            onClose();

        } catch (err) {
            const validationErrors = err.response?.data?.validationErrors;
            const message = err.response?.data?.message;

            if (Array.isArray(validationErrors)) {
                validationErrors.forEach(e => toast.error(e.message));
            } else if (message) {
                toast.error(message);
            } else {
                toast.error(`Failed to ${taskToEdit ? 'update' : 'create'} task. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{taskToEdit ? 'Edit Task' : 'Add New Task'}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min={(() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    return tomorrow.toISOString().split('T')[0];
                                })()}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assign to Technicians <span className="text-red-500">*</span>
                            </label>

                            {/* Selected Technicians Chips */}
                            <div className="flex flex-wrap gap-2 mb-2">
                                {getSelectedTechnicians().map(tech => (
                                    <div
                                        key={tech.id}
                                        className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                                    >
                                        {tech.name}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveTechnician(tech.id);
                                            }}
                                            className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Search and Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search technicians..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" />
                                </div>

                                {/* Dropdown */}
                                {isDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto">
                                        {filteredTechnicians.length > 0 ? (
                                            filteredTechnicians.map(tech => (
                                                <div
                                                    key={tech.id}
                                                    onClick={() => handleAddTechnician(tech.id)}
                                                    className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700 flex items-center"
                                                >
                                                    <div>
                                                        <div className="font-medium">{tech.name}</div>
                                                        <div className="text-xs text-gray-500">{tech.email}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-sm text-gray-500">
                                                {searchTerm ? 'No technicians found' : 'No technicians available'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {formData.technicianIds.length === 0 && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Please select at least one technician
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading
                                ? `${taskToEdit ? 'Updating...' : 'Creating...'}`
                                : `${taskToEdit ? 'Update' : 'Create'} Task`
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;
