document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const selectedColorHex = document.getElementById('selectedColorHex');
    const presetColors = document.querySelectorAll('.color-option');
    
    const colorMap = {
        'yellow': '#FFEB3B',
        'lightgreen': '#90EE90',
        'lightblue': '#ADD8E6',
        'pink': '#FFB6C1'
    };

    chrome.storage.local.get('currentColor', function(data) {
        if (data.currentColor) {
            const hexColor = colorMap[data.currentColor] || data.currentColor;
            colorPicker.value = hexColor;
            selectedColorHex.textContent = hexColor;
        }
    });

    presetColors.forEach(option => {
        option.addEventListener('click', async function() {
            const colorName = this.dataset.color;
            const hexColor = colorMap[colorName];
            
            try {
                colorPicker.value = hexColor;
                selectedColorHex.textContent = hexColor;
                
                await chrome.storage.local.set({ currentColor: colorName });
                
                const [tab] = await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });
                
                if (tab?.id) {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: "setHighlightColor",
                        color: colorName
                    });
                }
            } catch (error) {
                console.log('Error setting color:', error);
            }
        });
    });

    colorPicker.addEventListener('change', async function(e) {
        const color = e.target.value;
        selectedColorHex.textContent = color;
        
        try {
            await chrome.storage.local.set({ currentColor: color });
            
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true
            });
            
            if (tab?.id) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: "setHighlightColor",
                    color: color
                });
            }
        } catch (error) {
            console.log('Error setting color:', error);
        }
    });

    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
        if (tabs[0]?.id) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: () => {
                        if (!window.hasContentScript) {
                            window.hasContentScript = true;
                            chrome.runtime.sendMessage({ action: "contentScriptReady" });
                        }
                    }
                });
            } catch (e) {
                console.log('Cannot inject script into this page');
            }
        }
    });
});