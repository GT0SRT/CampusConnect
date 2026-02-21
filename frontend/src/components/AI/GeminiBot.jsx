import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Paperclip } from 'lucide-react';
import ChatBubble from './ChatBubble';
import { useUserStore } from '../../store/useUserStore';
import { chatWithGemini, generateCaptionFromImageFile } from '../../services/geminiService';
import { uploadImageToCloudinary, validateImageFile } from '../../services/cloudinaryService';

const GeminiBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useUserStore((state) => state.theme);
  const [messages, setMessages] = useState([
    {
      text: '👋 Namaste! I am your CampusConnect AI Assistant.\n\nI can help you with:\n📸 Generate captions for images\n💬 Answer questions about CampusConnect\n✨ Have a conversation\n\nHow can I help you today?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file, 10);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      await handleImageUpload(imageUrl, file);
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    }

    e.target.value = '';
  };

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // image upload handler
  const handleImageUpload = async (imageUrl, file) => {
    setMessages((prev) => [
      ...prev,
      {
        text: '📸 Image uploaded',
        image: imageUrl,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);

    try {
      setIsLoading(true);
      const caption = await generateCaptionFromImageFile(file);
      setMessages((prev) => [
        ...prev,
        {
          text: `✨ Generated Caption:\n\n${caption}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Sorry, facing problem in caption generate. Please try again.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const text = inputText;
    setInputText('');

    setMessages((prev) => [
      ...prev,
      {
        text,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);

    try {
      setIsLoading(true);
      const response = await chatWithGemini(text);
      setMessages((prev) => [
        ...prev,
        {
          text: response,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Sorry, I\'m having trouble responding. Please try again.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-3 md:bottom-4 right-4 w-16 h-16 bg-linear-to-r from-cyan-500 to-cyan-600 rounded-full shadow-xl shadow-cyan-500/30 flex items-center justify-center hover:scale-110 transition-all z-50"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 w-80 sm:w-90 h-[70vh] max-h-145 rounded-3xl shadow-2xl flex flex-col z-50 backdrop-blur-xl border transition-colors ${theme === 'dark'
          ? 'bg-slate-900/80 border-slate-700/50 text-white'
          : 'bg-white/80 border-gray-200/50 text-slate-900'
          }`}>
          {/* Header */}
          <div className="bg-linear-to-r from-cyan-500 to-cyan-600 text-white p-4 rounded-t-3xl flex justify-between items-center shadow-lg shadow-cyan-500/20">
            <div className="flex items-center gap-2">
              <Sparkles />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden p-3 transition-colors ${theme === 'dark'
            ? 'bg-slate-800/50'
            : 'bg-gray-50/50'
            }`}>
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} isUser={msg.isUser} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="animate-spin" /> Processing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 ">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={`p-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                  ? 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60'
                  : 'bg-gray-100/60 border border-gray-200/50 text-gray-600 hover:bg-gray-200/60'
                  }`}
                title="Upload image"
              >
                <Paperclip size={18} />
              </button>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className={`flex-1 border rounded-xl px-3 py-2 text-sm backdrop-blur-md transition-colors ${theme === 'dark'
                  ? 'bg-slate-800/60 border-slate-700/50 text-white placeholder-slate-400 focus:border-cyan-500/50'
                  : 'bg-white/60 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:border-cyan-400/50'
                  }`}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-linear-to-r from-cyan-500 to-cyan-600 text-white px-3 rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiBot;
