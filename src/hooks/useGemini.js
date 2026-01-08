import { useState } from 'react';
import geminiService from '../services/geminiService';

export const useGemini = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Image caption generate karne ka function
  const generateCaption = async (imageUrl) => {
    setIsLoading(true);
    setError(null);

    try {
      const caption = await geminiService.generateCaption(imageUrl);
      setIsLoading(false);
      return caption;
    } catch (err) {
      setError('Failed to generate caption. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  // Text correction karne ka function
  const correctText = async (text) => {
    setIsLoading(true);
    setError(null);

    try {
      const correctedText = await geminiService.correctText(text);
      setIsLoading(false);
      return correctedText;
    } catch (err) {
      setError('Failed to correct text. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  // Conversational chat function
  const chat = async (message) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.chat(message);
      setIsLoading(false);
      return response;
    } catch (err) {
      setError('Failed to get response. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  // Error clear karne ka function
  const clearError = () => {
    setError(null);
  };

  return {
    isLoading,
    error,
    generateCaption,
    correctText,
    chat,
    clearError
  };
};

export default useGemini;