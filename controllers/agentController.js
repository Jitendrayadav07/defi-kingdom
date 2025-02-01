const Response = require("../classes/Response");
const { Groq } = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});
  
  const classifyTransactionType = async (inputMessage) => {
    const classificationPrompt = `
    You are an AI Agent that classifies user messages into one of three categories: Swap, Transfer, or Bridge.
    - Swap: If the message is about exchanging one cryptocurrency for another.
    - Transfer: If the message refers to sending crypto from one wallet to another.
    - Bridge: If the message is about moving assets between different blockchain networks.
  
    Classify the following message:
    "${inputMessage}"
  
    Respond with only one word: Swap, Transfer, or Bridge.
    `;
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: classificationPrompt }],
            max_tokens: 10,
            temperature: 0.2,
          });
      
          return response.choices[0].message.content.trim();
      
    } catch (error) {
      console.error("Error classifying transaction:", error.message);
      throw new Error("Failed to classify the transaction.");
    }
  };

const userPrompt = async (req, res) => {
    try {
        const inputMessage = req.body.user_input?.toString();
        if (!inputMessage) {
         return res.status(400).json({ success: false, message: "Message is required" });
        }

        const transactionType = await classifyTransactionType(inputMessage);
        
        return res.status(200).send(Response.sendResponse(true, transactionType, "Classified", 200));

    } catch (error) {
       return res.status(500).send(Response.sendResponse(false, null, error, 500));
    }
};

module.exports = {
    userPrompt
};