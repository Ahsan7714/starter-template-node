const catchAsyncError = require("../middleware/catchAsyncError");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");
const Message=require("../models/messageModel");

const systemPrompt = `You are a highly intelligent, professional, and friendly chatbot that helps users with their inquiries about a business. You should provide concise, accurate responses, and if you lack specific information, offer helpful alternatives and guide the user to other services.

Instructions:
1. **Respond Thoughtfully**: If you don't have the exact information the user is asking for, still try to help by providing related information or suggestions. Always be humble and polite.
   
2. **Use Context**: Always try to relate your response to the context of the question. If the user asks about an event or date, and you don't have an answer, offer helpful insights about the business or its upcoming services instead.
   
3. **Suggest Alternatives**: When you don’t have the information requested, suggest how the user might get the answer (e.g., contacting support, looking at business hours, etc.), and express eagerness to help with any other inquiries.
   
4. **Friendly and Professional Tone**: Respond with empathy and professionalism. Even if you lack information, maintain a positive tone, and try to keep the conversation flowing.

5. **Examples**: Here are a few sample responses based on different scenarios:

---

** Structure: **
*Business Details:*
*Past two messages with responds for context:*
*User's Message:*
*Response:*

**Example 1:**

**Business Details:**
Q: What is the hardware cost?
A: It costs around $200 for soft materials and $400 for hard materials. These costs are based on 1kg.

**User's Message:** 
Q: What is the price for 2kg of soft material?

**Response:**
*The price for 2kg of soft material is approximately $400, based on our standard $200 per kg pricing. Let me know if you'd like more details!* 😊

---

**Example 2:**

**User's Message:** 
Q: What should be on 1st September?

**Response:**
*I'm not sure what's happening specifically on 1st September, but if you're looking for something from us, I'd be happy to assist! If you need information about our opening hours or services, feel free to ask. Otherwise, let me know if there's something else on your mind!* 🌟
---

**Example 3:**

**User's Message:** 
Q: What gluten-free options do you have?

**Response:**
*I'm sorry, I don't have details on gluten-free options right now. However, we do offer vegan and vegetarian products. If you'd like, I can help you explore those options. Let me know if I can assist further!* 🌱

---

The goal is to be both helpful and conversational, even when direct information is unavailable.

`;



exports.getResponse = catchAsyncError(async (req, res, next) => {
  const { messages, message, session_id, chatbot_id } = req.body;

  if (!messages || !message || !session_id || !chatbot_id) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  const owner = await User.findById(chatbot_id);



  const bussinessDetails = owner.bussinessDetails;

  if (!bussinessDetails || bussinessDetails.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Not enough business details",
    });
  }

  const businessDetailsText = bussinessDetails.map(detail => `${detail.question} \n ${detail.answer}`).join("\n");

  const messagesText = messages.map(detail => `${detail.question} \n ${detail.answer}`).join("\n");

  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatModel = genai.getGenerativeModel({
  model: "gemini-pro",
});

  const completion = await chatModel.generateContent({
    contents: [
      {
        parts: [
          { text: systemPrompt },
          {text: "Business Name: " + owner.bussinessName + "\n" + "Business Description: " + owner.bussinessDescription + "\n"},
          { text: businessDetailsText },
          { text: messagesText },
          { text: message },
        ],
      },
    ],
  });


  // add messages to the session and save the session
    const session = await Session.findById(session_id);

    if (!session) {
        return res.status(404).json({
            success: false,
            message: "Session not found",
        });
    }

   // First Create message of the user
    const userMessage=await Message.create({
         sessionId:session_id,
         message,
         role:"user",
         chatbotId:chatbot_id,
    });

    session.messages.push(userMessage._id);

    // Create message of the chatbot

    const chatbotMessage=await Message.create({
        sessionId:session_id,
        message:completion.response.candidates[0].content.parts[0].text,
        role:"chatbot",
        chatbotId:chatbot_id,
    });

    session.messages.push(chatbotMessage._id);

    await session.save();


  


  res.status(200).json({
    success: true,
    data: completion.response.candidates[0].content.parts[0].text,
  });
});



exports.testByOwner=catchAsyncError(async(req,res,next)=>{

  const owner=req.user;
  const { messages, message} = req.body;

  const {bussinessDetails} = owner;

  if (!bussinessDetails || bussinessDetails.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Not enough business details",
    });
  }

  const businessDetailsText = bussinessDetails.map(detail => `${detail.question} \n ${detail.answer}`).join("\n");

  const messagesText = messages.map(detail => `${detail.question} \n ${detail.answer}`).join("\n");

  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const chatModel = genai.getGenerativeModel({
    model: "gemini-pro",
  });
  
    const completion = await chatModel.generateContent({
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {text: "Business Name: " + owner.bussinessName + "\n" + "Business Description: " + owner.bussinessDescription + "\n"},
            { text: businessDetailsText },
            { text: messagesText },
            { text: message },
          ],
        },
      ],
    });


    res.status(200).json({
      success: true,
      data: completion.response.candidates[0].content.parts[0].text,
    });

})
  

