/**
 * Function to polish text using the Polish Text cloud function
 * @param {string} text The user-selected text to be corrected
 * @returns {string} The polished text
 */
async function polishText(text) {
    const endpoint = "https://us-central1-vivid-poet-450321-v7.cloudfunctions.net/polish-text";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Polish Text API Error: ${response.status} - ${response.statusText}\n${errorText}`);
            return `Error: ${response.statusText}`;
        }

        return await response.text();

    } catch (error) {
        return "An error occurred while calling the Polish Text API: " + error;
    }
}

/**
 * Function to get improvement suggestions using the Suggest Points cloud function
 * @param {string} originalText The original text
 * @param {string} polishedText The polished text
 * @returns {string} The suggestion points
 */
async function getSuggestions(originalText, polishedText) {
    const endpoint = "https://us-central1-vivid-poet-450321-v7.cloudfunctions.net/suggest-points";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                originalText: originalText,
                polishedText: polishedText
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Suggest Points API Error: ${response.status} - ${response.statusText}\n${errorText}`);
            return `Error: ${response.statusText}`;
        }

        return await response.text();

    } catch (error) {
        return "An error occurred while calling the Suggest Points API: " + error;
    }
}

// Run the tests
async function runTests() {
    const originalText = "I is 胖 cat. This is a exemple text writen badly.";
    console.log("Original text:", originalText);

    const polishedText = await polishText(originalText);
    console.log("\nPolished text:", polishedText);

    const suggestions = await getSuggestions(originalText, polishedText);
    console.log("\nSuggestion points:", suggestions);
}

runTests();
