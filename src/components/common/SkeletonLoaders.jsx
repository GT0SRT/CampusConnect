import { memo } from 'react';

// Skeleton loader for posts - renders while data loads
export const PostSkeleton = memo(function PostSkeleton({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 h-96 animate-pulse border border-gray-100 shadow-sm"
        >
          {/* Header skeleton */}
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          </div>

          {/* Image skeleton */}
          <div className="h-40 bg-gray-200 rounded-lg mb-4" />

          {/* Caption skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>

          {/* Stats skeleton */}
          <div className="flex gap-4 text-xs text-gray-400 mb-4">
            <div className="h-3 bg-gray-100 rounded w-16" />
            <div className="h-3 bg-gray-100 rounded w-16" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>

          {/* Actions skeleton */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <div className="flex-1 h-8 bg-gray-100 rounded" />
            <div className="flex-1 h-8 bg-gray-100 rounded" />
            <div className="flex-1 h-8 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </>
  );
});

// Skeleton loader for threads - renders while thread data loads
export const ThreadSkeleton = memo(function ThreadSkeleton({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 animate-pulse border border-gray-100 shadow-sm"
        >
          {/* Header skeleton */}
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>

          {/* Title skeleton */}
          <div className="mb-4 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-4/5" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>

          {/* Stats and actions skeleton */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <div className="h-8 bg-gray-100 rounded w-12" />
            <div className="h-8 bg-gray-100 rounded w-12" />
            <div className="flex-1" />
            <div className="h-8 bg-gray-100 rounded w-12" />
          </div>
        </div>
      ))}
    </>
  );
});

export const LoadingPagination = memo(function LoadingPagination() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="space-y-3 w-full px-4">
        <PostSkeleton count={1} />
      </div>
    </div>
  );
});

export const PaginationError = memo(function PaginationError({ error, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p className="text-red-700 font-medium mb-2">Failed to load data</p>
      <p className="text-red-600 text-sm mb-3">{error?.message || 'Unknown error'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
});
