import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    HiArrowLeft,
    HiPencil,
    HiTrash,
    HiUserAdd,
    HiChat,
    HiPaperClip,
    HiCheckCircle,
    HiPlay,
    HiPause,
    HiX,
    HiDownload,
    HiUpload,
    HiDocumentText,
    HiPhotograph,
    HiDocument,
} from 'react-icons/hi';
import { Button } from '../../components/common/Button';
import { TextArea } from '../../components/common/TextArea';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { Dropdown } from '../../components/common/Dropdown';
import { PageLoading } from '../../components/common/Loading';
import { Avatar } from '../../components/common/Avatar';
import { TicketStatusBadge } from '../../components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '../../components/tickets/TicketPriorityBadge';
import { downloadFile } from '../../api/axios';
import {
    useTicket,
    useUpdateTicketStatus,
    useAssignTicket,
    useAddComment,
    useUpdateComment,
    useDeleteComment,
    useDeleteTicket,
    useUploadTicketAttachment,
    useDeleteAttachment,
} from '../../hooks/useTickets';
import { useAgents } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { formatDateTime, formatRelativeTime, formatFileSize } from '../../utils/helpers';
import type { TicketStatus, CreateCommentRequest, UpdateCommentRequest, Comment, Attachment } from '../../types/ticket.types';
import { TICKET_STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';

export const TicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
    const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] = useState(false);
    const [selectedAssignee, setSelectedAssignee] = useState('');

    // Edit comment state
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    // Delete states
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);

    // Queries & Mutations
    const { data: response, isLoading } = useTicket(id!);
    const { data: agentsResponse } = useAgents();
    const { mutate: updateStatus } = useUpdateTicketStatus();
    const { mutate: assignTicket, isPending: isAssigning } = useAssignTicket();
    const { mutate: addComment, isPending: isAddingComment } = useAddComment();
    const { mutate: updateComment, isPending: isUpdatingComment } = useUpdateComment();
    const { mutate: deleteComment, isPending: isDeletingComment } = useDeleteComment();
    const { mutate: deleteTicket, isPending: isDeleting } = useDeleteTicket();
    const { mutate: uploadAttachment, isPending: isUploading } = useUploadTicketAttachment();
    const { mutate: deleteAttachment, isPending: isDeletingAttachment } = useDeleteAttachment();

    const ticket = response?.data;
    const agents = agentsResponse?.data || [];

    // Filter out duplicates and current assignee for better UX
    const availableAgents = agents
        .filter((agent, index, self) =>
            // Remove duplicates by id
            index === self.findIndex(a => a.id === agent.id)
        )
        .filter(agent =>
            // Optionally exclude current assignee
            agent.id !== ticket?.assigneeId
        );

    const { register, handleSubmit, reset, watch } = useForm<CreateCommentRequest>({
        defaultValues: {
            content: '',
            isInternal: false,
        },
    });

    const commentContent = watch('content');

    const isAdmin = user?.role === 'Admin' || user?.role === 'Supervisor';
    const isAgent = user?.role === 'Agent' || isAdmin;

    // Handlers
    const handleStatusChange = (status: TicketStatus) => {
        if (!id) return;
        updateStatus({ id, status });
    };

    const handleAssign = () => {
        if (!id || !selectedAssignee) return;
        assignTicket(
            { id, assigneeId: selectedAssignee },
            {
                onSuccess: () => {
                    setShowAssignModal(false);
                    setSelectedAssignee('');
                },
            }
        );
    };

    const handleAddComment = (data: CreateCommentRequest) => {
        if (!id || !data.content.trim()) return;
        addComment(
            { ticketId: id, data },
            {
                onSuccess: () => {
                    reset();
                },
            }
        );
    };

    const handleEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditCommentContent(comment.content);
    };

    const handleSaveComment = () => {
        if (!id || !editingCommentId || !editCommentContent.trim()) return;

        const data: UpdateCommentRequest = { content: editCommentContent };
        updateComment(
            { ticketId: id, commentId: editingCommentId, data },
            {
                onSuccess: () => {
                    setEditingCommentId(null);
                    setEditCommentContent('');
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditCommentContent('');
    };

    const handleDeleteCommentClick = (commentId: string) => {
        setCommentToDelete(commentId);
        setShowDeleteCommentModal(true);
    };

    const handleConfirmDeleteComment = () => {
        if (!id || !commentToDelete) return;
        deleteComment(
            { ticketId: id, commentId: commentToDelete },
            {
                onSuccess: () => {
                    setShowDeleteCommentModal(false);
                    setCommentToDelete(null);
                },
            }
        );
    };

    const handleDelete = () => {
        if (!id) return;
        deleteTicket(id, {
            onSuccess: () => {
                navigate('/tickets');
            },
        });
    };

    // File handlers
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        uploadAttachment(
            { ticketId: id, file },
            {
                onSuccess: () => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            }
        );
    };

    const handleDownloadAttachment = async (attachment: Attachment) => {
        try {
            await downloadFile(attachment.id, attachment.fileName);
        } catch {
            toast.error('Failed to download file');
        }
    };

    const handleDeleteAttachmentClick = (attachmentId: string) => {
        setAttachmentToDelete(attachmentId);
        setShowDeleteAttachmentModal(true);
    };

    const handleConfirmDeleteAttachment = () => {
        if (!attachmentToDelete) return;
        deleteAttachment(attachmentToDelete, {
            onSuccess: () => {
                setShowDeleteAttachmentModal(false);
                setAttachmentToDelete(null);
            },
        });
    };

    const copyTicketLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
    };

    const getFileIcon = (contentType: string) => {
        if (contentType.startsWith('image/')) return <HiPhotograph className="w-5 h-5 text-green-500" />;
        if (contentType.includes('pdf')) return <HiDocumentText className="w-5 h-5 text-red-500" />;
        return <HiDocument className="w-5 h-5 text-blue-500" />;
    };

    if (isLoading) {
        return <PageLoading />;
    }

    if (!ticket) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ticket Not Found
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    The ticket you're looking for doesn't exist or has been deleted.
                </p>
                <Link to="/tickets">
                    <Button>Back to Tickets</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/tickets')}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Link to="/tickets" className="hover:text-gray-700 dark:hover:text-gray-300">
                                Tickets
                            </Link>
                            <span>/</span>
                            <span>{ticket.ticketNumber}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Status Dropdown - Using Reusable Component */}
                    {isAgent && (
                        <Dropdown
                            trigger={
                                <Button variant="secondary">
                                    Change Status
                                </Button>
                            }
                            options={TICKET_STATUSES.map((status) => ({
                                value: status.value,
                                label: status.label,
                            }))}
                            value={ticket.status}
                            onSelect={(status) => handleStatusChange(status as TicketStatus)}
                        />
                    )}

                    {isAgent && (
                        <Button
                            variant="secondary"
                            leftIcon={<HiUserAdd className="w-4 h-4" />}
                            onClick={() => setShowAssignModal(true)}
                        >
                            Assign
                        </Button>
                    )}

                    <Link to={`/tickets/${id}/edit`}>
                        <Button variant="secondary" leftIcon={<HiPencil className="w-4 h-4" />}>
                            Edit
                        </Button>
                    </Link>

                    {isAdmin && (
                        <Button
                            variant="danger"
                            leftIcon={<HiTrash className="w-4 h-4" />}
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ticket Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <TicketStatusBadge status={ticket.status} />
                                <TicketPriorityBadge priority={ticket.priority} />
                            </div>
                            <span className="text-sm text-gray-500">{ticket.ticketNumber}</span>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {ticket.title}
                        </h1>

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                <HiPaperClip className="w-5 h-5 mr-2" />
                                Attachments ({ticket.attachments?.length || 0})
                            </h3>
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<HiUpload className="w-4 h-4" />}
                                onClick={handleFileSelect}
                                isLoading={isUploading}
                            >
                                Upload File
                            </Button>
                        </div>

                        <div className="p-6">
                            {ticket.attachments && ticket.attachments.length > 0 ? (
                                <div className="space-y-3">
                                    {ticket.attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {getFileIcon(attachment.contentType)}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {attachment.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(attachment.fileSize)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleDownloadAttachment(attachment)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <HiDownload className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAttachmentClick(attachment.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <HiPaperClip className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No attachments yet</p>
                                    <p className="text-sm mt-1">Upload files up to 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Comments ({ticket.comments?.length || 0})
                            </h3>
                        </div>

                        {/* Comment List */}
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {ticket.comments?.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <HiChat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No comments yet</p>
                                </div>
                            ) : (
                                ticket.comments?.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className={`p-6 ${comment.isInternal ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <Avatar src={comment.userAvatar} name={comment.userName} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {comment.userName}
                                                        </span>
                                                        {comment.isInternal && (
                                                            <span className="px-2 py-0.5 text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                                                                Internal Note
                                                            </span>
                                                        )}
                                                        {comment.updatedAt && (
                                                            <span className="text-xs text-gray-400">(edited)</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-500">
                                                            {formatDateTime(comment.createdAt)}
                                                        </span>
                                                        {/* Edit/Delete buttons - only for comment owner */}
                                                        {comment.userId === user?.id && (
                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    onClick={() => handleEditComment(comment)}
                                                                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                                    title="Edit"
                                                                >
                                                                    <HiPencil className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCommentClick(comment.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                                    title="Delete"
                                                                >
                                                                    <HiTrash className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Edit mode or display mode */}
                                                {editingCommentId === comment.id ? (
                                                    <div className="space-y-2">
                                                        <TextArea
                                                            value={editCommentContent}
                                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                                            rows={3}
                                                        />
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={handleSaveComment}
                                                                isLoading={isUpdatingComment}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={handleCancelEdit}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Comment Form */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <form onSubmit={handleSubmit(handleAddComment)} className="space-y-4">
                                <TextArea
                                    placeholder="Write a comment..."
                                    rows={4}
                                    {...register('content')}
                                />
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('isInternal')}
                                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Internal note (not visible to requester)
                                        </span>
                                    </label>
                                    <Button
                                        type="submit"
                                        disabled={!commentContent?.trim()}
                                        isLoading={isAddingComment}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Activity Timeline
                        </h3>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                            <div className="space-y-6">
                                {ticket.history?.map((item) => (
                                    <div key={item.id} className="relative flex items-start space-x-4 pl-10">
                                        <div className="absolute left-2 w-4 h-4 bg-primary-500 rounded-full border-4 border-white dark:border-gray-800" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    <span className="font-medium">{item.userName}</span> {item.action}
                                                </p>
                                                <span className="text-xs text-gray-500">
                                                    {formatRelativeTime(item.timestamp)}
                                                </span>
                                            </div>
                                            {(item.oldValue || item.newValue) && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.oldValue && (
                                                        <>
                                                            <span className="line-through">{item.oldValue}</span>
                                                            <span className="mx-1">→</span>
                                                        </>
                                                    )}
                                                    <span className="text-gray-900 dark:text-white">{item.newValue}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {/* Creation event */}
                                <div className="relative flex items-start space-x-4 pl-10">
                                    <div className="absolute left-2 w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-gray-800" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                <span className="font-medium">{ticket.requesterName}</span> created this ticket
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {formatRelativeTime(ticket.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500 dark:text-gray-400">Requester</dt>
                                <dd className="mt-1 flex items-center space-x-2">
                                    <Avatar src={ticket.requesterAvatar} name={ticket.requesterName} size="sm" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {ticket.requesterName}
                                    </span>
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500 dark:text-gray-400">Assignee</dt>
                                <dd className="mt-1">
                                    {ticket.assigneeId ? (
                                        <div className="flex items-center space-x-2">
                                            <Avatar src={ticket.assigneeAvatar} name={ticket.assigneeName!} size="sm" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {ticket.assigneeName}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">Unassigned</span>
                                    )}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500 dark:text-gray-400">Category</dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {ticket.categoryName}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500 dark:text-gray-400">Department</dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {ticket.departmentName}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-gray-500 dark:text-gray-400">Created</dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {formatDateTime(ticket.createdAt)}
                                </dd>
                            </div>

                            {ticket.dueDate && (
                                <div>
                                    <dt className="text-sm text-gray-500 dark:text-gray-400">Due Date</dt>
                                    <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDateTime(ticket.dueDate)}
                                    </dd>
                                </div>
                            )}

                            {ticket.resolvedAt && (
                                <div>
                                    <dt className="text-sm text-gray-500 dark:text-gray-400">Resolved</dt>
                                    <dd className="mt-1 text-sm font-medium text-green-600">
                                        {formatDateTime(ticket.resolvedAt)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            {ticket.status === 'Open' && (
                                <button
                                    onClick={() => handleStatusChange('InProgress')}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                                >
                                    <HiPlay className="w-4 h-4 text-blue-500" />
                                    <span>Start Working</span>
                                </button>
                            )}
                            {ticket.status === 'InProgress' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange('Resolved')}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                                    >
                                        <HiCheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Mark as Resolved</span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('Pending')}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                                    >
                                        <HiPause className="w-4 h-4 text-orange-500" />
                                        <span>Set to Pending</span>
                                    </button>
                                </>
                            )}
                            {ticket.status === 'Resolved' && (
                                <button
                                    onClick={() => handleStatusChange('Closed')}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                                >
                                    <HiX className="w-4 h-4 text-gray-500" />
                                    <span>Close Ticket</span>
                                </button>
                            )}
                            <hr className="my-2 border-gray-200 dark:border-gray-700" />
                            <button
                                onClick={copyTicketLink}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                            >
                                <HiPaperClip className="w-4 h-4 text-gray-500" />
                                <span>Copy Link</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Modal - FIXED: Show email to distinguish users */}
            <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Ticket">
                <div className="space-y-4">
                    {/* Show current assignee if exists */}
                    {ticket.assigneeId && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Currently assigned to:</p>
                            <div className="flex items-center space-x-2">
                                <Avatar src={ticket.assigneeAvatar} name={ticket.assigneeName!} size="sm" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {ticket.assigneeName}
                                </span>
                            </div>
                        </div>
                    )}

                    <Select
                        label="Select New Assignee"
                        value={selectedAssignee}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        placeholder="Select an agent..."
                        options={availableAgents.map((agent) => ({
                            value: agent.id,
                            label: `${agent.fullName} (${agent.email})`, // ✅ Show email to distinguish
                        }))}
                    />

                    {availableAgents.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                            No other agents available to assign
                        </p>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssign} isLoading={isAssigning} disabled={!selectedAssignee}>
                            Assign
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Ticket Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Ticket"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this ticket? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Comment Modal */}
            <Modal
                isOpen={showDeleteCommentModal}
                onClose={() => setShowDeleteCommentModal(false)}
                title="Delete Comment"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this comment? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowDeleteCommentModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleConfirmDeleteComment} isLoading={isDeletingComment}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Attachment Modal */}
            <Modal
                isOpen={showDeleteAttachmentModal}
                onClose={() => setShowDeleteAttachmentModal(false)}
                title="Delete Attachment"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this attachment? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowDeleteAttachmentModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleConfirmDeleteAttachment} isLoading={isDeletingAttachment}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};