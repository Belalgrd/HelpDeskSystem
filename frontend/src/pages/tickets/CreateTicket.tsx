import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiArrowLeft } from 'react-icons/hi';
import { Input } from '../../components/common/Input';
import { TextArea } from '../../components/common/TextArea';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useCreateTicket } from '../../hooks/useTickets';
import { useDepartments, useCategories } from '../../hooks/useCommon';
import { CreateTicketRequest, TicketPriority } from '../../types/ticket.types';
import { TICKET_PRIORITIES } from '../../utils/constants';

const createTicketSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(4000, 'Description must be less than 4000 characters'),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
    categoryId: z.string().min(1, 'Please select a category'),
    departmentId: z.string().min(1, 'Please select a department'),
    dueDate: z.string().optional(),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

export const CreateTicket: React.FC = () => {
    const navigate = useNavigate();
    const { mutate: createTicket, isPending } = useCreateTicket();
    const { data: departmentsResponse } = useDepartments();
    const { data: categoriesResponse } = useCategories();

    const departments = departmentsResponse?.data || [];
    const categories = categoriesResponse?.data || [];

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CreateTicketFormData>({
        resolver: zodResolver(createTicketSchema),
        defaultValues: {
            priority: 'Medium',
        },
    });

    const description = watch('description');

    const onSubmit = (data: CreateTicketFormData) => {
        const request: CreateTicketRequest = {
            ...data,
            priority: data.priority as TicketPriority,
            dueDate: data.dueDate || undefined,
        };

        createTicket(request, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    navigate(`/tickets/${response.data.id}`);
                }
            },
        });
    };

    const getPriorityHint = (priority: string) => {
        const hints: Record<string, string> = {
            Low: "Minor issues that don't affect productivity",
            Medium: 'Issues that affect productivity but have workarounds',
            High: 'Critical issues affecting multiple users',
            Critical: 'System down or security issues requiring immediate attention',
        };
        return hints[priority] || '';
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-4 mb-2">
                    <button
                        onClick={() => navigate('/tickets')}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Link to="/tickets" className="hover:text-gray-700 dark:hover:text-gray-300">
                            Tickets
                        </Link>
                        <span>/</span>
                        <span>Create New</span>
                    </div>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Create New Ticket
                </h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Fill in the details below to submit a new support request
                </p>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-8 space-y-6">
                    {/* Title */}
                    <Input
                        label="Title"
                        placeholder="Brief description of your issue"
                        error={errors.title?.message}
                        {...register('title')}
                    />

                    {/* Description */}
                    <div>
                        <TextArea
                            label="Description"
                            placeholder="Provide detailed information about your issue..."
                            rows={6}
                            error={errors.description?.message}
                            {...register('description')}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {description?.length || 0} / 4000 characters
                        </p>
                    </div>

                    {/* Category & Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="Category"
                            placeholder="Select a category..."
                            options={categories.map((c) => ({ value: c.id, label: c.name }))}
                            error={errors.categoryId?.message}
                            {...register('categoryId')}
                        />

                        <Select
                            label="Department"
                            placeholder="Select a department..."
                            options={departments.map((d) => ({ value: d.id, label: d.name }))}
                            error={errors.departmentId?.message}
                            {...register('departmentId')}
                        />
                    </div>

                    {/* Priority & Due Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Select
                                label="Priority"
                                options={TICKET_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
                                error={errors.priority?.message}
                                {...register('priority')}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {getPriorityHint(watch('priority'))}
                            </p>
                        </div>

                        <Input
                            label="Due Date (Optional)"
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            {...register('dueDate')}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => navigate('/tickets')}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isPending}>
                            Create Ticket
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};