const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/{model=models/*}:generateContent';

const geminiService = {
  // Image ke liye caption generate karne ka function

  async generateCaption(imageUrl) {
    try {
      const base64Image = await this.getBase64FromUrl(imageUrl);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Generate a creative and descriptive caption for this image. Provide captions in both Hindi and English. Make it engaging and interesting."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        })
      });
      console.log("📡 Status:", response.status);
      if (!response.ok) {
        throw new Error('Gemini API request failed');
      }

      const data = await response.json();
      console.log("📦 Gemini response:", data);
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating caption:', error);
      throw error;
    }
  },

  // Text correction ke liye function
  async correctText(text) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please correct the grammatical errors and improve the following text. Keep the same language (Hindi/English) as the input. Only return the corrected and improved text without any explanations or additional commentary:\n\n${text}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Gemini API request failed');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error correcting text:', error);
      throw error;
    }
  },

  // Conversational chat with AI
  async chat(message) {
    try {
      const apiUrl = import.meta.env.VITE_CAPTION_API_URL?.replace('/generate', '/chat') || 'http://localhost:8000/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Chat API request failed');
      }

      const data = await response.json();
      return data.caption; // Server returns response in 'caption' field
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  },

  // Image URL ko Base64 mein convert karne ka helper function
  async getBase64FromUrl(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }
};

export default geminiService;