const elements = {
    input: document.getElementById("inputText"),
    inputRequirements: document.getElementById("inputRequirements"),
    output: document.getElementById("output"),
    button: document.getElementById("checkGrammar"),
    loading: document.getElementById("loading"),
    suggestions: document.getElementById("suggestions"),
    toggleSuggestions: document.getElementById("toggleSuggestions")
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
        const originalText = elements.input.value.trim();
        const additionalRequirements = elements.inputRequirements.value.trim();

        // Check if the original text is empty
        if (!originalText) {
            elements.output.innerText = "Please enter some text to improve.";
            return;
        }

        setLoading(true);

        // Get the polished text
        const polishResponse = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: originalText,
                requirements: additionalRequirements
            })
        });

        if (!polishResponse.ok) throw new Error(`Polish API Error: ${polishResponse.status}`);
        const polishedText = await polishResponse.text();
        elements.output.innerText = polishedText;

        // Check if suggestions should be shown
        if (elements.toggleSuggestions.checked) {
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
            elements.suggestions.innerText = suggestions.replace(/\n{2,}/g, '\n');
        } else {
            elements.suggestions.innerText = ''; // Clear suggestions if toggle is off
        }

    } catch (error) {
        elements.output.innerText = `Error: ${error.message}`;
        console.error('Error details:', error);
        elements.suggestions.innerText = 'Failed to load suggestions';
    } finally {
        setLoading(false);
    }
};

elements.button.addEventListener("click", polishText); 