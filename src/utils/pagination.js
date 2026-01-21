/**
 * PAGINATION UTILITIES - Cursor-Based Pagination System
 * 
 * Why cursor-based instead of offset-based:
 * - Offset becomes inefficient and inaccurate with deletions/insertions
 * - Cursors are stable across data changes
 * - Better performance: just need to check one item vs all previous items
 * - Natural for real-time data (Firebase)
 * - Prevents duplicate/missing items when data changes during pagination
 */

/**
 * Extracts minimal fields needed for list view (reduces payload significantly)
 * This is critical for performance - we only fetch what's displayed
 * Secondary data (full author profile, all comments) loads after
 * 
 * @param {Object} item - The full document from Firebase
 * @param {string} type - 'post' or 'thread'
 * @returns {Object} Minimal data for list view
 */
export const selectListFields = (item, type = 'post') => {
  // For posts: we need just enough to display in feed
  if (type === 'post') {
    return {
      id: item.id,
      // Critical: these must render immediately
      uid: item.uid,
      caption: item.caption,
      imageUrl: item.imageUrl,
      likes: item.likes,
      comments: item.comments,
      createdAt: item.createdAt,
      // Basic author info for list display (lightweight)
      author: {
        name: item.author?.name || 'User',
        profile_pic: item.author?.profile_pic || ''
      },
      // Metadata for filtering tabs
      campus: item.campus,
      branch: item.branch,
      batch: item.batch,
      // For tracking interactions
      likedBy: item.likedBy || []
    };
  }

  // For threads: keep it minimal
  if (type === 'thread') {
    return {
      id: item.id,
      uid: item.uid,
      title: item.title,
      description: item.description,
      votes: item.votes,
      category: item.category,
      createdAt: item.createdAt,
      author: {
        name: item.author?.name || 'User',
        profile_pic: item.author?.profile_pic || ''
      },
      campus: item.campus,
      branch: item.branch,
      batch: item.batch,
      upvotes: item.upvotes || [],
      downvotes: item.downvotes || [],
      Discussion: item.Discussion || [] 
    };
  }

  return item;
};

/**
 * Creates a cursor from a Firestore document
 * Cursor is base64-encoded for cleaner transmission
 * This is what we pass to the next page request
 * 
 * @param {Object} doc - Firestore document
 * @returns {string} Base64-encoded cursor
 */
export const createCursor = (doc) => {
  if (!doc) return null;
  // Use the document ID and creation time as cursor
  const cursorData = {
    id: doc.id,
    timestamp: doc.createdAt?.seconds || Date.now() / 1000
  };
  return btoa(JSON.stringify(cursorData));
};

/**
 * Decodes a cursor back to usable data
 * @param {string} cursor - Base64-encoded cursor
 * @returns {Object} Cursor data with id and timestamp
 */
export const decodeCursor = (cursor) => {
  if (!cursor) return null;
  try {
    return JSON.parse(atob(cursor));
  } catch (e) {
    console.error('Invalid cursor:', e);
    return null;
  }
};

/**
 * Pagination response structure
 * Always consistent, makes caching and UI handling predictable
 * 
 * @typedef {Object} PaginationResult
 * @property {Array} items - The fetched items
 * @property {string|null} nextCursor - Cursor for next page, null if no more items
 * @property {boolean} hasMore - Whether more items exist
 * @property {number} count - Number of items in this page
 */

/**
 * Creates a standardized pagination response
 * @param {Array} items - Fetched items
 * @param {number} pageSize - Requested page size
 * @returns {PaginationResult}
 */
export const createPaginationResult = (items, pageSize) => {
  // If we got less than pageSize items, we've reached the end
  const hasMore = items.length >= pageSize;

  // The cursor for the NEXT page is based on the last item
  const nextCursor = hasMore && items.length > 0
    ? createCursor(items[items.length - 1])
    : null;

  // Return consistent format for all queries
  return {
    items: items.slice(0, pageSize), // Ensure we don't return more than requested
    nextCursor,
    hasMore,
    count: Math.min(items.length, pageSize)
  };
};
