import OpenAI from "openai";
import functions from '@google-cloud/functions-framework';

/**
 * Cloud function to analyze text improvements and generate suggestion points
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
async function suggestPoints(req, res) {
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
        if (!req.body?.originalText || !req.body?.polishedText) {
            return res.status(400).json({
                error: 'Missing "originalText" or "polishedText" in request body'
            });
        }

        const { originalText, polishedText } = req.body;

        // 2. Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // 3. Build dynamic request body
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "You are a concise writing coach. Analyze text improvements and explain each change in one short sentence. Use 1-4 bullet points with emojis, focusing only on key changes. Be extremely brief and direct - no extra words."
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Please analyze the following texts and provide improvement points:\n\nOriginal text:\nI has a 苹果. This is a exemple text writen badly.\n\nPolished text:\nI have an apple. This is an example of poorly written text."
                        }
                    ]
                },
                {
                    "role": "assistant",
                    "content": [
                        {
                            "type": "text",
                            "text": "🔄 I has → I have: Fixed verb agreement with 'I'\n\n🍎 苹果 → apple: Translated to English for clarity\n\n✒️ writen badly → poorly written: More professional phrasing"
                        }
                    ]
                },
                {
                    role: "user",
                    content: [
                        {
                            "type": "text",
                            "text": `Please analyze the following texts and provide improvement points:\n\nOriginal text:\n${originalText}\n\nPolished text:\n${polishedText}`
                        }
                    ]
                }
            ],
            response_format: { type: "text" },
            temperature: 0.7,
            max_tokens: 800,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        // 4. Return the suggestion points
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
functions.http('suggestPoints', suggestPoints); 