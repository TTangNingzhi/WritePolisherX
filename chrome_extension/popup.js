const elements = {
    input: document.getElementById("inputText"),
    output: document.getElementById("output"),
    button: document.getElementById("checkGrammar"),
    loading: document.getElementById("loading"),
    suggestions: document.getElementById("suggestions")
};

const API_URL = "https://us-central1-vivid-poet-450321-v7.cloudfunctions.net/polish-text";
const SUGGESTIONS_API_URL = "https://us-central1-vivid-poet-450321-v7.cloudfunctions.net/suggest-points";

const setLoading = (isLoading) => {
    elements.loading.style.display = isLoading ? "block" : "none";
    elements.button.disabled = isLoading;
    if (isLoading) {
        elements.output.innerText = "";
        elements.suggestions.innerHTML = "";
    }
};

const polishText = async () => {
    try {
        setLoading(true);
        const originalText = elements.input.value;

        // Get the polished text
        const polishResponse = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: originalText })
        });

        if (!polishResponse.ok) throw new Error(`Polish API Error: ${polishResponse.status}`);
        const polishedText = await polishResponse.text();
        elements.output.innerText = polishedText;

        // Get the suggestions
        const suggestionsResponse = await fetch(SUGGESTIONS_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                originalText: originalText,
                polishedText: polishedText
            })
        });

        if (!suggestionsResponse.ok) {
            const errorText = await suggestionsResponse.text();
            throw new Error(`Suggestions API Error: ${suggestionsResponse.status} - ${errorText}`);
        }

        const suggestions = await suggestionsResponse.text();
        elements.suggestions.innerText = suggestions;

    } catch (error) {
        elements.output.innerText = `Error: ${error.message}`;
        console.error('Error details:', error);
        elements.suggestions.innerText = 'Failed to load suggestions';
    } finally {
        setLoading(false);
    }
};

elements.button.addEventListener("click", polishText); 