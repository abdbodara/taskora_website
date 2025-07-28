import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { technicianData, updateTechnician } from "../../apiEndPoints/technician";

function AddTechnicianModal({ onClose, technician = null, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    status: "active",
  });

  // Set form data if editing
  useEffect(() => {
    if (technician) {
      const { password, ...rest } = technician;
      setFormData(prev => ({
        ...prev,
        ...rest,
        password: '' // Don't pre-fill password for security
      }));
    }
  }, [technician]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const { name, email, phone, password, address } = formData;

    // Check each field and show specific error
    if (!name.trim()) {
      toast.error("Name is required.");
      return false;
    }

    if (!email.trim()) {
      toast.error("Email is required.");
      return false;
    }

    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return false;
    }

    const phoneDigitsOnly = /^\d{10}$/;
    if (!phoneDigitsOnly.test(phone)) {
      toast.error("Phone number must be exactly 10 digits and contain only numbers.");
      return false;
    }

    if (!address.trim()) {
      toast.error("Address is required.");
      return false;
    }

    if (!technician && !password.trim()) {
      toast.error("Password is required.");
      return false;
    }

    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (technician?.id) {
        await updateTechnician(technician.id, formData);
      } else {
        await technicianData(formData);
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      const validationErrors = error.response?.data?.validationErrors;

      if (Array.isArray(validationErrors)) {
        validationErrors.forEach((err) => {
          toast.error(err.message);
        });
      } else if (error.response?.data?.error) {
        toast.error(error.response?.data?.error);
      } else {
        toast.error("Failed to save technician.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {technician ? 'Edit Technician' : 'Add New Technician'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter name"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter email"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter phone"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Enter address"
              onChange={handleChange}
            />
          </div>

          {!technician && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition ${loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (technician ? 'Updating...' : 'Creating...') : (technician ? 'Update Technician' : 'Create Technician')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTechnicianModal;
