import { ThumbsupIcon, CommentIcon, EyeIcon } from "@primer/octicons-react";
import { Avatar, Button, Textarea } from "@primer/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MDEditor from "@uiw/react-md-editor";
import { useTitle } from "ahooks";
import { useState } from "react";

import { serviceApi } from "@/api";
import { useMsgBanner } from "@/components";
import type { DiscussionComments, Discussions } from "@/entity";
import { DatetimeToShow } from "@/util";

export const Route = createFileRoute("/service/discussions/$id")({
    component: RouteComponent,
});

interface CommentWithReplies extends DiscussionComments {
    replies: CommentWithReplies[];
    author_nickname?: string;
    author_avatar?: string;
}

function buildCommentTree(
    comments: DiscussionComments[],
): CommentWithReplies[] {
    const map = new Map<string, CommentWithReplies>();
    const roots: CommentWithReplies[] = [];

    comments.forEach((c) => {
        map.set(c.id, { ...c, replies: [] });
    });

    comments.forEach((c) => {
        const node = map.get(c.id)!;
        if (c.parent_id && map.has(c.parent_id)) {
            map.get(c.parent_id)!.replies.push(node);
        } else {
            roots.push(node);
        }
    });

    // Sort by reply count descending
    roots.sort((a, b) => b.replies.length - a.replies.length);
    roots.forEach((r) => {
        r.replies.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
        );
    });

    return roots;
}

function CommentItem({
    comment,
    discussionId,
    currentUserId,
    onReply,
    onDelete,
}: {
    comment: CommentWithReplies;
    discussionId: string;
    currentUserId?: string;
    onReply: (parentId: string, content: string, parentContent: string) => void;
    onDelete: (commentId: string) => void;
}) {
    const [showReply, setShowReply] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const banner = useMsgBanner();

    const submitReply = () => {
        if (!replyContent.trim()) {
            banner.showBanner("critical", "Reply content cannot be empty");
            return;
        }
        onReply(comment.id, replyContent, comment.content);
        setReplyContent("");
        setShowReply(false);
    };

    return (
        <div className="border rounded p-3 mb-2 bg-white">
            <div className="flex items-center gap-2 mb-2">
                {comment.author_avatar ? (
                    <Avatar src={comment.author_avatar} size={24} />
                ) : (
                    <div
                        className="flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-medium flex-shrink-0"
                        style={{ width: 24, height: 24, fontSize: 10 }}
                    >
                        {comment.author_nickname?.[0]?.toUpperCase() || "?"}
                    </div>
                )}
                <span className="font-medium">
                    {comment.author_nickname || comment.author_id}
                </span>
                <span className="text-gray-500 text-sm">
                    {DatetimeToShow(comment.created_at)}
                </span>
                {currentUserId === comment.author_id && (
                    <Button
                        size="small"
                        variant="danger"
                        onClick={() => onDelete(comment.id)}
                    >
                        Delete
                    </Button>
                )}
            </div>
            <div className="pl-8 border-l-2 border-gray-200">
                {comment.parent_id && (
                    <div className="text-sm text-gray-500 mb-1 italic">
                        Replying to a comment
                    </div>
                )}
                <p className="whitespace-pre-wrap">{comment.content}</p>

                <div className="mt-2 flex gap-2">
                    <Button
                        size="small"
                        onClick={() => setShowReply(!showReply)}
                    >
                        Reply
                    </Button>
                    <span className="text-sm text-gray-500 self-center">
                        {comment.replies.length} replies
                    </span>
                </div>

                {showReply && (
                    <div className="mt-2 flex flex-col gap-2">
                        <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            rows={3}
                        />
                        <Button
                            size="small"
                            variant="primary"
                            onClick={submitReply}
                        >
                            Submit Reply
                        </Button>
                    </div>
                )}

                {comment.replies.map((reply) => (
                    <CommentItem
                        key={reply.id}
                        comment={reply}
                        discussionId={discussionId}
                        currentUserId={currentUserId}
                        onReply={onReply}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

function RouteComponent() {
    const params = Route.useParams();
    const id = params.id!;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const banner = useMsgBanner();

    const [hasLiked, setHasLiked] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["discussion", id],
        queryFn: () => serviceApi.discussions.get(id),
    });

    const discussion = data?.data;

    const { data: meData } = useQuery({
        queryKey: ["profile"],
        queryFn: () => serviceApi.users.getMe(),
        select: (res) => res.data,
    });
    const currentUserId = meData?.id;

    const { data: commentsData, refetch: refetchComments } = useQuery({
        queryKey: ["discussion-comments", id],
        queryFn: () => serviceApi.discussions.getComments(id),
    });

    const comments = commentsData?.data || [];

    const likeMutation = useMutation({
        mutationFn: () => serviceApi.discussions.like(id),
        onSuccess: () => {
            setHasLiked(true);
            queryClient.invalidateQueries({ queryKey: ["discussion", id] });
        },
        onError: () => {
            banner.showBanner("critical", "Failed to like");
        },
    });

    const unlikeMutation = useMutation({
        mutationFn: () => serviceApi.discussions.unlike(id),
        onSuccess: () => {
            setHasLiked(false);
            queryClient.invalidateQueries({ queryKey: ["discussion", id] });
        },
        onError: () => {
            banner.showBanner("critical", "Failed to unlike");
        },
    });

    const createCommentMutation = useMutation({
        mutationFn: (data: { content: string; parent_id?: string }) =>
            serviceApi.discussions.createComment(id, data),
        onSuccess: () => {
            refetchComments();
            queryClient.invalidateQueries({ queryKey: ["discussion", id] });
        },
        onError: () => {
            banner.showBanner("critical", "Failed to post comment");
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (comment_id: string) =>
            serviceApi.discussions.deleteComment(id, comment_id),
        onSuccess: () => {
            refetchComments();
            queryClient.invalidateQueries({ queryKey: ["discussion", id] });
        },
        onError: () => {
            banner.showBanner("critical", "Failed to delete comment");
        },
    });

    const deleteDiscussionMutation = useMutation({
        mutationFn: () => serviceApi.discussions.remove(id),
        onSuccess: () => {
            navigate({ to: "/service/discussions" });
        },
    });

    useTitle(`${discussion?.title ?? "Discussion"} | FloatCTF`);

    const [newComment, setNewComment] = useState("");

    const handlePostComment = () => {
        if (!newComment.trim()) {
            banner.showBanner("critical", "Comment cannot be empty");
            return;
        }
        createCommentMutation.mutate({ content: newComment });
        setNewComment("");
    };

    const handleReply = (
        parentId: string,
        content: string,
        _parentContent: string,
    ) => {
        createCommentMutation.mutate({ content, parent_id: parentId });
    };

    const handleDeleteComment = (commentId: string) => {
        deleteCommentMutation.mutate(commentId);
    };

    const handleLike = () => {
        likeMutation.mutate();
    };

    const handleUnlike = () => {
        unlikeMutation.mutate();
    };

    const handleDeleteDiscussion = () => {
        if (confirm("Are you sure you want to delete this discussion?")) {
            deleteDiscussionMutation.mutate();
        }
    };

    if (isLoading) {
        return <div className="p-8">Loading...</div>;
    }

    if (isError || !discussion) {
        return (
            <div className="p-8 text-red-500">
                Discussion not found or failed to load.
            </div>
        );
    }

    const commentTree = buildCommentTree(comments);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
                <div className="flex flex-col pt-3 px-8 gap-3">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold">
                            {discussion.title}
                        </h2>
                        {currentUserId === discussion.author_id && (
                            <Button
                                size="small"
                                variant="danger"
                                onClick={handleDeleteDiscussion}
                            >
                                Delete Discussion
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {discussion.author_avatar ? (
                            <Avatar src={discussion.author_avatar} size={32} />
                        ) : (
                            <div
                                className="flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-medium flex-shrink-0"
                                style={{ width: 32, height: 32, fontSize: 14 }}
                            >
                                {discussion.author_nickname?.[0]?.toUpperCase() ||
                                    "?"}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">
                                {discussion.author_nickname}
                            </span>
                            <span className="text-gray-500 text-sm ml-2">
                                {DatetimeToShow(discussion.created_at)}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <EyeIcon size={16} />
                            {discussion.view_count} views
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsupIcon size={16} />
                            {discussion.like_count} likes
                        </span>
                        <span className="flex items-center gap-1">
                            <CommentIcon size={16} />
                            {discussion.comment_count} comments
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {hasLiked ? (
                            <Button
                                size="small"
                                variant="danger"
                                onClick={handleUnlike}
                            >
                                Unlike
                            </Button>
                        ) : (
                            <Button
                                size="small"
                                variant="primary"
                                onClick={handleLike}
                            >
                                Like
                            </Button>
                        )}
                    </div>

                    <div className="border-top my-2" />

                    <div className="prose max-w-none">
                        <MDEditor.Markdown source={discussion.content} />
                    </div>

                    <div className="border-top my-4" />

                    <h3 className="text-lg font-semibold">Comments</h3>

                    <div className="mb-4">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            rows={4}
                        />
                        <Button
                            className="mt-2"
                            variant="primary"
                            onClick={handlePostComment}
                            disabled={createCommentMutation.isPending}
                        >
                            Post Comment
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {commentTree.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                discussionId={id}
                                currentUserId={currentUserId}
                                onReply={handleReply}
                                onDelete={handleDeleteComment}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
