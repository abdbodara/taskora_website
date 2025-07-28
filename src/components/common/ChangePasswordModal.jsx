import React, { useState } from 'react';
import { changePassword } from '../../apiEndPoints/technician';
import toast from 'react-hot-toast';

const ChangePasswordModal = ({
    isOpen,
    onClose,
    technician,
    onSuccess
}) => {
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handlePasswordChange = async () => {
        if (!newPassword.trim()) {
            toast.error('Please enter a new password');
            return;
        }

        try {
            setIsChangingPassword(true);
            const result = await changePassword(technician.id, newPassword);

            if (result && result.data && result.data.success) {
                toast.success('Password changed successfully');
                onSuccess?.();
                handleClose();
            } else {
                throw new Error(result?.data?.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Password change failed:', error.response.data.error);
            toast.error(error.response.data.error || 'Failed to change password. Please try again.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleClose = () => {
        setNewPassword('');
        onClose();
    };

    if (!isOpen || !technician) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    disabled={isChangingPassword}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-xl font-semibold mb-4">
                    Change Password for {technician.name}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter new password"
                            required
                            minLength={6}
                            disabled={isChangingPassword}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            disabled={isChangingPassword}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handlePasswordChange}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
