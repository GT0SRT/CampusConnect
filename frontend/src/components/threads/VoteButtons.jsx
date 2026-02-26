import { ChevronUp, ChevronDown } from "lucide-react";

/**
 * Reusable voting buttons component for threads and answers
 * Handles optimistic UI updates
 */
export default function VoteButtons({
    upvotes = [],
    downvotes = [],
    currentUserId,
    onVote,
    isVoting = false,
    theme = 'dark',
    size = 'default'
}) {
    const votes = upvotes.length - downvotes.length;
    const hasUpvoted = currentUserId && upvotes.includes(currentUserId);
    const hasDownvoted = currentUserId && downvotes.includes(currentUserId);

    const sizeClasses = size === 'small'
        ? 'p-1'
        : 'p-2';

    const iconSize = size === 'small' ? 14 : 16;

    return (
        <div className={`flex flex-col items-center gap-1 ${theme === 'dark' ? '' : ''}`}>
            <button
                onClick={() => onVote('up')}
                disabled={isVoting}
                className={`${sizeClasses} rounded transition-colors disabled:opacity-50 ${hasUpvoted
                    ? 'bg-cyan-500/20 text-cyan-500'
                    : theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-cyan-500'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-cyan-600'
                    }`}
                aria-label="Upvote"
            >
                <ChevronUp size={iconSize} />
            </button>

            <span
                className={`text-sm font-semibold min-w-6 text-center ${votes > 0
                    ? 'text-cyan-500'
                    : votes < 0
                        ? 'text-red-500'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
            >
                {votes}
            </span>

            <button
                onClick={() => onVote('down')}
                disabled={isVoting}
                className={`${sizeClasses} rounded transition-colors disabled:opacity-50 ${hasDownvoted
                    ? 'bg-red-500/20 text-red-500'
                    : theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-red-500'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'
                    }`}
                aria-label="Downvote"
            >
                <ChevronDown size={iconSize} />
            </button>
        </div>
    );
}
