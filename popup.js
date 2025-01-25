document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const selectedColorHex = document.getElementById('selectedColorHex');
    const presetColors = document.querySelectorAll('.color-option');
    
    const colorMap = {
        '#ffeb3b': '#FFEB3B',
        '#90ee90': '#90EE90',
        '#add8e6': '#ADD8E6',
        '#ffb6c1': '#FFB6C1'
    };

    chrome.storage.local.get('currentColor', function(data) {
        if (data.currentColor) {
            const hexColor = colorMap[data.currentColor] || data.currentColor;
            if (/^#[0-9A-F]{6}$/i.test(hexColor)) {
                colorPicker.value = hexColor;
                selectedColorHex.textContent = hexColor;
            } else {
                console.error('Invalid color format:', hexColor);
            }
        }
    });

    presetColors.forEach(option => {
        option.addEventListener('click', async function() {
            const hexColor = this.dataset.color;
            
            if (hexColor && /^#[0-9A-F]{6}$/i.test(hexColor)) {
                colorPicker.value = hexColor;
                selectedColorHex.textContent = hexColor;
                
                await chrome.storage.local.set({ currentColor: hexColor });
                
                const [tab] = await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });
                
                if (tab?.id) {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: "setHighlightColor",
                        color: hexColor
                    });
                }
            } else {
                console.error('Invalid color selected:', hexColor);
            }
        });
    });

    colorPicker.addEventListener('change', async function(e) {
        const color = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            selectedColorHex.textContent = color;
            
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
        } else {
            console.error('Invalid color format:', color);
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
