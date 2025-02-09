// ==UserScript==
// @name         WritingPolisherX
// @namespace    http://tampermonkey.net/
// @version      2025-02-08
// @description  Corrects grammar, improves expression, and translates to English if needed
// @author       Ningzhi Tang
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// This script may not function on certain websites (e.g., ChatGPT, GitHub) due to their Content Security Policy (CSP) restrictions.
// Additionally, it may not be able to recognize selected text on some platforms (such as Google Docs) because of the way text selection logic is implemented.

(function () {
    'use strict';

    // Create a draggable button
    const button = document.createElement('button');
    button.textContent = 'Polish Writing';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#e8f5e9'; // Very light green
    button.style.color = '#2e7d32'; // Darker green text
    button.style.border = '2px solid #a5d6a7'; // Medium light green border
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';
    button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    button.style.transition = 'none';

    // Add hover effect
    button.addEventListener('mouseover', () => {
        if (!button.disabled) {
            button.style.backgroundColor = '#c8e6c9'; // Slightly darker light green
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }
    });

    button.addEventListener('mouseout', () => {
        if (!button.disabled) {
            button.style.backgroundColor = '#e8f5e9'; // Back to very light green
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        }
    });

    document.body.appendChild(button);

    // Drag variables
    let isDragging = false, startX, startY, startLeft, startTop;

    // Handle mouse events for dragging
    button.addEventListener('mousedown', (e) => {
        isDragging = false; // Reset dragging state
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(button.style.left);
        startTop = parseInt(button.style.top);

        // Detect if the user drags (if movement exceeds 1px)
        const onMouseMove = (event) => {
            if (Math.abs(event.clientX - startX) > 1 || Math.abs(event.clientY - startY) > 1) {
                isDragging = true;
                button.style.left = `${startLeft + (event.clientX - startX)}px`;
                button.style.top = `${startTop + (event.clientY - startY)}px`;
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    /**
     * Function to get the selected text on the page
     * @returns {string} The selected text
     */
    function getSelectedText() {
        const selection = window.getSelection();
        return selection ? selection.toString().trim() : '';
    }

    /**
     * Function to call OpenAI API for text correction
     * @param {string} text The user-selected text to be corrected
     * @returns {string} The corrected text
     */
    async function callOpenAIAPI(text) {
        const endpoint = "https://us-central1-vivid-poet-450321-v7.cloudfunctions.net/polish-text";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error: ${response.status} - ${response.statusText}\n${errorText}`);
                return `Error: ${response.statusText}`;
            }

            const fixedText = await response.text();
            return fixedText;

        } catch (error) {
            return "An error occurred while calling the API: " + error;
        }
    }

    /**
     * Function to create a modal dialog for displaying the fixed text
     * @param {string} originalText The original selected text
     * @param {string} fixedText The corrected text
     */
    function showModal(originalText, fixedText) {
        // Remove existing modal if any
        document.getElementById('ai-modal')?.remove();

        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'ai-modal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'white';
        modal.style.padding = '15px';
        modal.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.5)';
        modal.style.zIndex = '2000';
        modal.style.borderRadius = '8px';
        modal.style.width = '400px';

        // Create a simple display for original and fixed text
        const createTextDisplay = (value, label = '') => {
            const container = document.createElement('div');
            container.style.marginBottom = '15px';

            if (label) {
                const title = document.createElement('span');
                title.textContent = label;
                title.style.fontSize = '12px';
                title.style.color = '#666';
                title.style.marginBottom = '4px';
                title.style.display = 'block';
                title.style.letterSpacing = '0.5px';
                container.appendChild(title);
            }

            const textDiv = document.createElement('div');
            textDiv.textContent = value;
            textDiv.style.border = '1px solid #ccc';
            textDiv.style.padding = '10px';
            textDiv.style.borderRadius = '5px';
            textDiv.style.backgroundColor = '#f9f9f9';
            textDiv.style.overflowWrap = 'break-word';
            textDiv.style.fontSize = '14px';
            textDiv.style.lineHeight = '1.5';

            container.appendChild(textDiv);
            return container;
        };

        // Add the text displays with updated labels
        modal.appendChild(createTextDisplay(originalText, 'Original version'));
        modal.appendChild(createTextDisplay(fixedText, 'Improved version'));

        // Updated button styles with smaller dimensions
        const buttonStyle = `
            padding: 6px 12px;
            margin: 5px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            background-color: #ffffff;
            color: #333;
            cursor: pointer;
            font-weight: 500;
            font-size: 13px;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            min-width: 80px;
        `;

        // Create button container with adjusted spacing
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '12px';
        buttonContainer.style.gap = '8px';

        // Copy button with updated styling
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.style.cssText = buttonStyle;
        copyButton.addEventListener('mouseover', () => {
            copyButton.style.backgroundColor = '#f8f9fa';
            copyButton.style.borderColor = '#dee2e6';
            copyButton.style.transform = 'translateY(-1px)';
            copyButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        });
        copyButton.addEventListener('mouseout', () => {
            copyButton.style.backgroundColor = '#ffffff';
            copyButton.style.borderColor = '#e0e0e0';
            copyButton.style.transform = 'translateY(0)';
            copyButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        });
        copyButton.onclick = () => {
            navigator.clipboard.writeText(fixedText).then(() => {
                const originalStyles = {
                    backgroundColor: copyButton.style.backgroundColor,
                    borderColor: copyButton.style.borderColor
                };
                copyButton.textContent = '✓ Copied';
                copyButton.style.backgroundColor = '#f8f9fa';
                copyButton.style.borderColor = '#dee2e6';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.style.backgroundColor = originalStyles.backgroundColor;
                    copyButton.style.borderColor = originalStyles.borderColor;
                }, 1500);
            });
        };

        // Close button with updated styling
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = buttonStyle;
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.backgroundColor = '#f8f9fa';
            closeButton.style.borderColor = '#dee2e6';
            closeButton.style.transform = 'translateY(-1px)';
            closeButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        });
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.backgroundColor = '#ffffff';
            closeButton.style.borderColor = '#e0e0e0';
            closeButton.style.transform = 'translateY(0)';
            closeButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        });
        closeButton.onclick = () => {
            modal.remove();
        };

        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(closeButton);
        modal.appendChild(buttonContainer);

        document.body.appendChild(modal);
    }

    // Event listener for button click
    button.addEventListener("click", async () => {
        if (!isDragging) {
            let textToProcess = getSelectedText();

            // If no text is selected, prompt user to input text
            if (!textToProcess) {
                textToProcess = prompt("No text selected. Please enter the text you want to polish:");
                if (!textToProcess) {
                    return; // User cancelled the prompt
                }
            }

            button.textContent = "Processing...";
            button.disabled = true;
            button.style.backgroundColor = '#fff3e0'; // Very light orange
            button.style.borderColor = '#ffe0b2'; // Light orange border
            button.style.color = '#f57c00'; // Darker orange text
            button.style.cursor = 'wait';

            const fixedText = await callOpenAIAPI(textToProcess);

            button.textContent = "Polish Writing";
            button.disabled = false;
            button.style.backgroundColor = '#e8f5e9'; // Back to very light green
            button.style.borderColor = '#a5d6a7'; // Back to light green border
            button.style.color = '#2e7d32'; // Back to darker green text
            button.style.cursor = 'pointer';

            showModal(textToProcess, fixedText);
        }
    });

})();
