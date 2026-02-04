import { useUserStore } from "../../store/useUserStore";

const ChatBubble = ({ message, isUser }) => {
  const theme = useUserStore((state) => state.theme);
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
      <div 
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none' 
            : ' text-gray-800 rounded-bl-none border border-gray-200'
        } ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
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
          <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
            {message.timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;