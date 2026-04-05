import React, { useState } from 'react';
import { HiOfficeBuilding, HiPlus, HiPencil, HiTrash, HiExclamation } from 'react-icons/hi';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import {
    useDepartments,
    useCreateDepartment,
    useUpdateDepartment,
    useDeleteDepartment
} from '../../hooks/useCommon';
import type { Department, CreateDepartmentRequest } from '../../types/common.types';

export const DepartmentList: React.FC = () => {
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateDepartmentRequest>({
        name: '',
        description: '',
    });

    // Queries and mutations
    const { data: response, isLoading } = useDepartments();
    const createMutation = useCreateDepartment();
    const updateMutation = useUpdateDepartment();
    const deleteMutation = useDeleteDepartment();

    const departments = response?.data || [];

    // Handlers
    const openCreateModal = () => {
        setFormData({ name: '', description: '' });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (department: Department) => {
        setSelectedDepartment(department);
        setFormData({
            name: department.name,
            description: department.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (department: Department) => {
        setSelectedDepartment(department);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMutation.mutateAsync(formData);
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '' });
        } catch (error) {
            console.error('Failed to create department:', error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDepartment) return;

        try {
            await updateMutation.mutateAsync({
                id: selectedDepartment.id,
                data: formData,
            });
            setIsEditModalOpen(false);
            setSelectedDepartment(null);
        } catch (error) {
            console.error('Failed to update department:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedDepartment) return;

        try {
            await deleteMutation.mutateAsync(selectedDepartment.id);
            setIsDeleteModalOpen(false);
            setSelectedDepartment(null);
        } catch (error) {
            console.error('Failed to delete department:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                        Departments
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Manage organization departments ({departments.length} total)
                    </p>
                </div>
                <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={openCreateModal}>
                    Add Department
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loading size="lg" />
                </div>
            ) : departments.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <HiOfficeBuilding className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No departments found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Get started by creating your first department
                    </p>
                    <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={openCreateModal}>
                        Add Department
                    </Button>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {departments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                    <HiOfficeBuilding className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                                                    {dept.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                            {dept.description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${dept.isActive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                            >
                                                {dept.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(dept)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Edit department"
                                                >
                                                    <HiPencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(dept)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Delete department"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Department"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="Department Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter department name"
                        required
                    />
                    <TextArea
                        label="Description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter department description (optional)"
                        rows={3}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={createMutation.isPending}>
                            Create Department
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Department"
                size="md"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                        label="Department Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter department name"
                        required
                    />
                    <TextArea
                        label="Description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter department description (optional)"
                        rows={3}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={updateMutation.isPending}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Department"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <HiExclamation className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Are you sure you want to delete{' '}
                                <strong className="text-gray-900 dark:text-white">
                                    {selectedDepartment?.name}
                                </strong>
                                ? This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            isLoading={deleteMutation.isPending}
                        >
                            Delete Department
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};