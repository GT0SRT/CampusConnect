import { useUserStore } from "../../store/useUserStore";

const ChatBubble = ({ message, isUser }) => {
  const theme = useUserStore((state) => state.theme);
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm backdrop-blur-xl transition-all ${isUser
            ? theme === 'dark'
              ? 'bg-linear-to-r from-cyan-500 to-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-500/20'
              : 'bg-linear-to-r from-cyan-400 to-cyan-500 text-white rounded-br-none shadow-lg shadow-cyan-500/30'
            : theme === 'dark'
              ? 'bg-slate-900/60 text-slate-100 rounded-bl-none border border-slate-700/50'
              : 'bg-white/80 text-slate-900 rounded-bl-none border border-gray-200/50'
          }`}
      >
        {/* Agar message mein image hai to dikhao */}
        {message.image && (
          <div className="mb-2">
            <img
              src={message.image}
              alt="Uploaded content"
              className="rounded-lg max-w-full h-auto shadow-md"
              style={{ maxHeight: '200px' }}
            />
          </div>
        )}

        {/* Message text */}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.text}
        </p>

        {/* Timestamp (optional) */}
        {message.timestamp && (
          <p className={`text-xs mt-1 ${isUser ? 'text-cyan-100' : theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`}>
            {message.timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;