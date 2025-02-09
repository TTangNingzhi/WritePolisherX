import OpenAI from "openai";
import functions from '@google-cloud/functions-framework';

/**
 * Cloud function to process text through OpenAI's GPT model
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
async function polishText(req, res) {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    try {
        // 1. Validate input
        if (!req.body?.text) {
            return res.status(400).json({
                error: 'Missing "text" in request body'
            });
        }

        const { text } = req.body;  // Extract text from request body

        // 2. Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // 3. Build dynamic request body
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant that corrects grammar and improves expression in English writing. If there's content in another language, provide its English translation. Directly return the fixed text without any additional information or encapsulation (e.g., no 'Here is the fixed text:', no quotation marks, etc.)."
                },
                {
                    role: "user",
                    content: "Please fix the grammar and expression errors in the following text:\n\nI has a apple. This is a exemple text writen badly. 我喜欢吃苹果, but I no can speak English good."
                },
                {
                    role: "assistant",
                    content: "I have an apple. This is an example of poorly written text. I like to eat apples, but I cannot speak English well."
                },
                {
                    role: "user",
                    content: `Please fix the grammar and expression errors in the following text:\n\n${text}`
                }
            ],
            response_format: { type: "text" },
            temperature: 0.7,
            max_tokens: 800,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        // 4. Return the corrected text
        res.status(200).send(response.choices[0].message.content.trim());

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
}

// Export the cloud function
functions.http('polishText', polishText);
