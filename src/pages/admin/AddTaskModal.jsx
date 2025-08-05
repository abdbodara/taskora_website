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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {taskToEdit ? 'Edit Task' : 'Add New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="col-span-2 space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Enter task title"
                            />
                        </div>

                        <div className="col-span-2 space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Enter task description"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjdjV2NnY4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[right_0.75rem_center]"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjdjV2NnY4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+')] bg-no-repeat bg-[right_0.75rem_center]"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                min={(() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    return tomorrow.toISOString().split('T')[0];
                                })()}
                            />
                        </div>

                        <div className="col-span-2 space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assign to Technicians <span className="text-red-500">*</span>
                            </label>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {getSelectedTechnicians().map(tech => (
                                    <div
                                        key={tech.id}
                                        className="flex items-center bg-indigo-100 text-indigo-800 text-sm px-3 py-1.5 rounded-full"
                                    >
                                        {tech.name}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveTechnician(tech.id);
                                            }}
                                            className="ml-1.5 text-indigo-500 hover:text-indigo-700 focus:outline-none transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search technicians..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[105px] overflow-auto">
                                        {filteredTechnicians.length > 0 ? (
                                            filteredTechnicians.map(tech => (
                                                <div
                                                    key={tech.id}
                                                    onClick={() => handleAddTechnician(tech.id)}
                                                    className="cursor-pointer hover:bg-gray-50 px-4 py-2 text-sm text-gray-700 flex items-center transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium mr-3">
                                                        {tech.name.charAt(0)}
                                                    </div>
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

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 theme-bg-btn text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {taskToEdit ? 'Updating...' : 'Creating...'}
                                </span>
                            ) : (
                                taskToEdit ? 'Update Task' : 'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;