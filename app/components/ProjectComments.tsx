'use client';

import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, User, Send, AlertCircle, Edit2, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Input';
import Tooltip from './ui/Tooltip';
import { addProjectComment, updateComment, deleteComment } from '../lib/actions';
import { logger } from '../lib/logger';
import { useConfirm } from './ui/ConfirmProvider';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  user_name: string;
  user_id: number;
}

interface ProjectCommentsProps {
  projectId: number;
  comments: Comment[];
}

export default function ProjectComments({ projectId, comments }: ProjectCommentsProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      setError('Please log in to add a comment');
      return;
    }

    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addProjectComment(projectId, commentText.trim());
      setCommentText('');
      router.refresh();
    } catch (error) {
      setError('Error adding comment. Please try again.');
      logger.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
    setError(null);
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editText.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await updateComment(commentId, editText.trim());
      setEditingComment(null);
      setEditText('');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error updating comment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const confirmed = await confirm({
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    setIsDeleting(commentId);
    setError(null);

    try {
      await deleteComment(commentId);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error deleting comment');
    } finally {
      setIsDeleting(null);
    }
  };

  const canEditComment = (comment: Comment) => {
    if (!session?.user) return false;
    return Number(session.user.id) === comment.user_id || session.user.role === 'admin';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="animate-fade-in text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle size={20} />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Форма добавления комментария */}
        <div className="space-y-4">
          {!session?.user ? (
            <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/20 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-blue-400" />
                <span className="text-blue-200">Please log in to leave a comment</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`}>
                  <Button
                    size="sm"
                    className="min-h-[44px] min-w-[44px] text-blue-200 hover:text-white"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href={`/auth/register?callbackUrl=${encodeURIComponent(pathname)}`}>
                  <Button size="sm" className="min-h-[44px] min-w-[44px]">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  disabled={isSubmitting}
                  maxLength={1000}
                  rows={4}
                />
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">{commentText.length}/1000 characters</span>
                <Button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Список комментариев */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="py-8 text-center text-white/50">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to leave a review!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-400">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.user_name}</span>
                        <span className="text-xs text-white/50">
                          {formatDate(comment.created_at)}
                          {comment.updated_at && comment.updated_at !== comment.created_at && (
                            <span className="ml-1">(edited)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit/Delete buttons */}
                  {canEditComment(comment) && (
                    <div className="flex items-center gap-2">
                      {editingComment !== comment.id && (
                        <>
                          <Tooltip content="Edit comment" position="top">
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/40 bg-gradient-to-br from-white/25 to-white/15 p-2.5 text-slate-200 backdrop-blur-md transition-all hover:text-amber-400 hover:[background:linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.2)_100%)] focus:ring-2 focus:ring-amber-500/80 focus:outline-none"
                              aria-label="Edit comment"
                            >
                              <Edit2 size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete comment" position="top">
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={isDeleting === comment.id}
                              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/40 bg-gradient-to-br from-white/25 to-white/15 p-2.5 text-slate-200 backdrop-blur-md transition-all hover:text-red-400 hover:[background:linear-gradient(135deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.2)_100%)] focus:ring-2 focus:ring-red-500/80 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Delete comment"
                            >
                              {isDeleting === comment.id ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment content or edit form */}
                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      disabled={isUpdating}
                      maxLength={1000}
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">
                        {editText.length}/1000 characters
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="text-white/60 hover:text-white"
                        >
                          <X size={14} className="mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={isUpdating || !editText.trim()}
                        >
                          {isUpdating ? (
                            <div className="mr-1 h-3.5 w-3.5 animate-spin rounded-full border border-white/30 border-t-white" />
                          ) : (
                            <Check size={14} className="mr-1" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-line text-white/90">
                    {comment.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
