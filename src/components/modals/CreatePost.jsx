export default function CreatePost({ onClose }) {
  return (
    <Modal onClose={onClose}>
      <h3 className="font-semibold text-lg mb-4">Create Post</h3>

      <textarea
        className="w-full border rounded-lg p-3 text-sm resize-none"
        rows={4}
        placeholder="What's happening on campus?"
      />

      <div className="flex justify-between items-center mt-4">
        <button className="text-blue-600 text-sm">Add Image</button>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
          Post
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
