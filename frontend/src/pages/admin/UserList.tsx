import React, { useState } from 'react';
import { HiPlus, HiSearch, HiPencil, HiKey } from 'react-icons/hi';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loading } from '../../components/common/Loading';
import { Pagination } from '../../components/common/Pagination';
import { useUsers, useCreateUser, useUpdateUser, useToggleUserStatus, useResetPassword } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useCommon';
import type { UserListItem, CreateUserRequest, UpdateUserRequest } from '../../types/auth.types';

const ROLES = [
    { value: 'User', label: 'User' },
    { value: 'Agent', label: 'Agent' },
    { value: 'Supervisor', label: 'Supervisor' },
    { value: 'Admin', label: 'Admin' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
];

export const UserList: React.FC = () => {
    // Filters state
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

    // Form states
    const [formData, setFormData] = useState<CreateUserRequest>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'User',
        departmentId: undefined,
    });
    const [newPassword, setNewPassword] = useState('');

    // Queries and mutations
    const { data: response, isLoading } = useUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        departmentId: departmentFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'true',
        page,
        pageSize,
    });

    const { data: departmentsResponse } = useDepartments();
    const departments = departmentsResponse?.data || [];

    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const toggleStatusMutation = useToggleUserStatus();
    const resetPasswordMutation = useResetPassword();

    const users = response?.data?.items || [];
    const totalPages = response?.data?.totalPages || 1;
    const totalCount = response?.data?.totalCount || 0;

    // Handlers
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
    };

    const openCreateModal = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'User',
            departmentId: undefined,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user: UserListItem) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: '',
            role: user.role,
            departmentId: user.departmentId,
        });
        setIsEditModalOpen(true);
    };

    const openResetPasswordModal = (user: UserListItem) => {
        setSelectedUser(user);
        setNewPassword('');
        setIsResetPasswordModalOpen(true);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserMutation.mutateAsync(formData);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Failed to create user:', error);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        const updateData: UpdateUserRequest = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            departmentId: formData.departmentId,
            isActive: selectedUser.isActive,
        };

        try {
            await updateUserMutation.mutateAsync({ id: selectedUser.id, data: updateData });
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleToggleStatus = async (user: UserListItem) => {
        try {
            await toggleStatusMutation.mutateAsync(user.id);
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            await resetPasswordMutation.mutateAsync({ id: selectedUser.id, newPassword });
            setIsResetPasswordModalOpen(false);
        } catch (error) {
            console.error('Failed to reset password:', error);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Supervisor':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Agent':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                        Users
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Manage system users and permissions ({totalCount} users)
                    </p>
                </div>
                <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={openCreateModal}>
                    Add User
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Roles</option>
                        {ROLES.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>
                    <select
                        value={departmentFilter}
                        onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </form>
            </div>

            {/* Users Table */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loading size="lg" />
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <HiSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No users found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Department
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
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.fullName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {user.departmentName || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Edit user"
                                                >
                                                    <HiPencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openResetPasswordModal(user)}
                                                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Reset password"
                                                >
                                                    <HiKey className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Create User Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New User" size="md">
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                        />
                        <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            >
                                {ROLES.map((role) => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Department
                            </label>
                            <select
                                value={formData.departmentId || ''}
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value || undefined })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">No Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={createUserMutation.isPending}>
                            Create User
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User" size="md">
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                        />
                        <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-100 dark:bg-gray-600"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            >
                                {ROLES.map((role) => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Department
                            </label>
                            <select
                                value={formData.departmentId || ''}
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value || undefined })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">No Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={updateUserMutation.isPending}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} title="Reset Password" size="sm">
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Reset password for <strong>{selectedUser?.fullName}</strong>
                    </p>
                    <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsResetPasswordModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={resetPasswordMutation.isPending}>
                            Reset Password
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};