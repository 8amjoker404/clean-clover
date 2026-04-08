// services/llm.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API client using the key from your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateAIResponse = async (prompt) => {
  try {
    console.log("Channeling mana... Sending prompt to Gemini.");

    // Swapping to the lightning-fast 3.1 Flash Lite model
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    // Send the prompt to the AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    // Returning an object so the router knows it succeeded
    return {
      success: true,
      text: aiText,
      errorDetail: null
    };

  } catch (error) {
    console.error("Gemini AI Service Error:", error.message);
    
    // Fallback response safely broken into multiple lines using + 
    // so it never crashes your editor again!
    const fallbackText = "The mana in the area is too chaotic to see what happened. (Connection Error)\n" +
                         "```json\n" +
                         "{\n" +
                         "  \"playerDamageTaken\": 0,\n" +
                         "  \"playerMpUsed\": 0,\n" +
                         "  \"enemyDamageTaken\": 0\n" +
                         "}\n" +
                         "```";

    return {
      success: false,
      text: fallbackText,
      errorDetail: error.message
    };
  }
};

module.exports = {
  generateAIResponse
};