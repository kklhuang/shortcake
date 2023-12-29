let scrapeIngredients = document.getElementById('scrapeIngredients');
let list = document.getElementById("ingredientsList")

// handler to receive from content script 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let ingredients = request.ingredients;

    if (ingredients == null) {
        let div = document.createElement("div");
        div.innerText = "Oops! No ingredients found here.";
        list.appendChild(div);
    } else {
        let div = document.createElement("div");
        div.innerText = ingredients
        list.appendChild(div);
    }
})

scrapeIngredients.addEventListener("click", async () => {
    // Disable the button to prevent multiple clicks
    scrapeIngredients.disabled = true;

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeIngredientsFromPage,
    });
});

function scrapeIngredientsFromPage() {
    // Try to find a div with id or class containing "-ingredient"
    let ingredientsDiv = document.querySelector('div[id*="-ingredient"], div[class*="-ingredient"], div[id*="-ingredients"], div[class*="-ingredients"]');

    if (ingredientsDiv) {
        // Extract the content of the found div
        let extractedContent = ingredientsDiv.innerText.trim();
        extractedContent = extractedContent.replace(/[^a-zA-Z0-9\s.,;:'"(){}[\]<>?/!@#$%^&*+=\\|\-_/`~]/g, '');

        // Send info to popup
        chrome.runtime.sendMessage({ ingredients: extractedContent });
    } else {
        // No matching div found
        chrome.runtime.sendMessage({ ingredients: null });
    }
}
