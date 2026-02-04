import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Paperclip } from 'lucide-react';
import ChatBubble from './ChatBubble';
import { useGemini } from '../../hooks/useGemini';
import { useUserStore } from '../../store/useUserStore';

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

  const { isLoading, generateCaption, chat } = useGemini();

  // Upload to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.secure_url;
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    try {
      const imageUrl = await uploadToCloudinary(file);
      await handleImageUpload(imageUrl);
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
  const handleImageUpload = async (imageUrl) => {
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
      const caption = await generateCaption(imageUrl);
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
      const response = await chat(text);
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
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-16 md:bottom-4 right-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all z-50"
        >
          <MessageCircle className={`w-7 h-7 ${theme === 'dark' ? 'text-gray-900' : 'text-white'}`} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 w-[320px] sm:w-[360px]
            h-[70vh] max-h-[580px] ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'} rounded-3xl shadow-2xl
            flex flex-col z-50 border`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden p-3 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50'}`}>
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

            <div className="flex gap-2">              <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className={`p-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'}`}
              title="Upload image"
            >
              <Paperclip size={18} />
            </button>              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className={`flex-1 border rounded-xl px-3 py-2 text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900'}`}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-blue-500 text-white px-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
