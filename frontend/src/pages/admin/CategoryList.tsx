import React, { useState } from 'react';
import { HiTag, HiPlus, HiPencil, HiTrash, HiExclamation } from 'react-icons/hi';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from '../../hooks/useCommon';
import type { Category, CreateCategoryRequest } from '../../types/common.types';

// Predefined icons for categories
const CATEGORY_ICONS = [
    { value: 'HiTag', label: 'Tag' },
    { value: 'HiDesktopComputer', label: 'Computer' },
    { value: 'HiServer', label: 'Server' },
    { value: 'HiWifi', label: 'Network' },
    { value: 'HiMail', label: 'Email' },
    { value: 'HiShieldCheck', label: 'Security' },
    { value: 'HiCog', label: 'Settings' },
    { value: 'HiSupport', label: 'Support' },
    { value: 'HiPrinter', label: 'Printer' },
    { value: 'HiPhone', label: 'Phone' },
];

// Predefined colors for categories
const CATEGORY_COLORS = [
    { value: '#3B82F6', label: 'Blue', bg: 'bg-blue-500' },
    { value: '#10B981', label: 'Green', bg: 'bg-green-500' },
    { value: '#F59E0B', label: 'Amber', bg: 'bg-amber-500' },
    { value: '#EF4444', label: 'Red', bg: 'bg-red-500' },
    { value: '#8B5CF6', label: 'Purple', bg: 'bg-purple-500' },
    { value: '#EC4899', label: 'Pink', bg: 'bg-pink-500' },
    { value: '#06B6D4', label: 'Cyan', bg: 'bg-cyan-500' },
    { value: '#F97316', label: 'Orange', bg: 'bg-orange-500' },
];

export const CategoryList: React.FC = () => {
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateCategoryRequest>({
        name: '',
        description: '',
        icon: 'HiTag',
        color: '#3B82F6',
    });

    // Queries and mutations
    const { data: response, isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const categories = response?.data || [];

    // Handlers
    const openCreateModal = () => {
        setFormData({
            name: '',
            description: '',
            icon: 'HiTag',
            color: '#3B82F6',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || 'HiTag',
            color: category.color || '#3B82F6',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMutation.mutateAsync(formData);
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '', icon: 'HiTag', color: '#3B82F6' });
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;

        try {
            await updateMutation.mutateAsync({
                id: selectedCategory.id,
                data: formData,
            });
            setIsEditModalOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error('Failed to update category:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;

        try {
            await deleteMutation.mutateAsync(selectedCategory.id);
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    // Get color style for category
    const getCategoryColorStyle = (color?: string) => {
        const categoryColor = color || '#3B82F6';
        return {
            backgroundColor: `${categoryColor}20`,
            color: categoryColor,
        };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                        Categories
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Manage ticket categories ({categories.length} total)
                    </p>
                </div>
                <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={openCreateModal}>
                    Add Category
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loading size="lg" />
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <HiTag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No categories found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Get started by creating your first category
                    </p>
                    <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={openCreateModal}>
                        Add Category
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => openEditModal(category)}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={getCategoryColorStyle(category.color)}
                                    >
                                        <HiTag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                            {category.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(category);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Edit category"
                                    >
                                        <HiPencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => openDeleteModal(category, e)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Delete category"
                                    >
                                        <HiTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {/* Status badge */}
                            <div className="mt-4 flex items-center justify-between">
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${category.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                >
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {category.color && (
                                    <div
                                        className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                                        style={{ backgroundColor: category.color }}
                                        title={`Color: ${category.color}`}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Category"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="Category Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter category name"
                        required
                    />
                    <TextArea
                        label="Description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter category description (optional)"
                        rows={3}
                    />

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Icon
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_ICONS.map((icon) => (
                                <button
                                    key={icon.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: icon.value })}
                                    className={`p-2 rounded-lg border-2 transition-colors ${formData.icon === icon.value
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                    title={icon.label}
                                >
                                    <HiTag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: color.value })}
                                    className={`w-8 h-8 rounded-full transition-transform ${formData.color === color.value
                                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                            : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={createMutation.isPending}>
                            Create Category
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Category"
                size="md"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <Input
                        label="Category Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter category name"
                        required
                    />
                    <TextArea
                        label="Description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter category description (optional)"
                        rows={3}
                    />

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Icon
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_ICONS.map((icon) => (
                                <button
                                    key={icon.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: icon.value })}
                                    className={`p-2 rounded-lg border-2 transition-colors ${formData.icon === icon.value
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                    title={icon.label}
                                >
                                    <HiTag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: color.value })}
                                    className={`w-8 h-8 rounded-full transition-transform ${formData.color === color.value
                                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                            : 'hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

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
                title="Delete Category"
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
                                    {selectedCategory?.name}
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
                            Delete Category
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};