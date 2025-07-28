import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const TechniciansModal = ({ isOpen, onClose, technicians = [] }) => {
    // Prevent background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Modal */}
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <motion.div
                            className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative bg-white px-6 pt-6 pb-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-900" id="modal-title">
                                        Assigned Technicians
                                    </h3>
                                    <button
                                        type="button"
                                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <X className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {technicians.length} {technicians.length === 1 ? 'technician' : 'technicians'} assigned
                                </p>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-4">
                                <motion.ul
                                    className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 -mr-2"
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {technicians.map((tech, index) => (
                                        <motion.li
                                            key={tech.id || index}
                                            className="group flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                                            variants={item}
                                        >
                                            <div className="relative">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                                                    {tech.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 border-2 border-white">
                                                    <span className="sr-only">Online</span>
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {tech.name}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {tech.role || 'Technician'}
                                                </p>
                                            </div>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};
