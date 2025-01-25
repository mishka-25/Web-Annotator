let currentColor = 'yellow';

document.addEventListener('mouseup', function() {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
        createHighlight(selection);
    }
});

function createHighlight(selection) {
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'web-annotator-highlight';
    span.style.backgroundColor = currentColor;
    span.dataset.note = '';
    
    try {
        range.surroundContents(span);
        selection.removeAllRanges();
        saveHighlight(span);
    } catch (e) {
        console.error('Error creating highlight:', e);
    }
}

function saveHighlight(element) {
    const pageUrl = window.location.href;
    const highlightData = {
        text: element.textContent,
        color: element.style.backgroundColor,
        note: element.dataset.note || '',
        textContent: document.body.textContent,
        timestamp: new Date().getTime()
    };

    chrome.storage.local.get({ highlights: {} }, function(data) {
        if (!data.highlights[pageUrl]) {
            data.highlights[pageUrl] = [];
        }
        data.highlights[pageUrl].push(highlightData);
        
        chrome.storage.local.set({ highlights: data.highlights }, function() {
            console.log('Highlight saved successfully');
        });
    });
}

function loadHighlights() {
    const pageUrl = window.location.href;
    
    chrome.storage.local.get({ highlights: {} }, function(data) {
        const pageHighlights = data.highlights[pageUrl] || [];
        
        pageHighlights.forEach(highlight => {
            try {
                const textNodes = findTextNodes(document.body);
                for (let node of textNodes) {
                    if (node.textContent.includes(highlight.text)) {
                        const range = document.createRange();
                        const startIndex = node.textContent.indexOf(highlight.text);
                        
                        if (startIndex >= 0) {
                            range.setStart(node, startIndex);
                            range.setEnd(node, startIndex + highlight.text.length);
                            
                            const span = document.createElement('span');
                            span.className = 'web-annotator-highlight';
                            span.style.backgroundColor = highlight.color;
                            span.dataset.note = highlight.note;
                            
                            range.surroundContents(span);
                        }
                        break;
                    }
                }
            } catch (e) {
                console.error('Error restoring highlight:', e);
            }
        });
    });
}

function findTextNodes(node) {
    const textNodes = [];
    const walk = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let n;
    while (n = walk.nextNode()) {
        if (n.textContent.trim()) {
            textNodes.push(n);
        }
    }
    
    return textNodes;
}

document.addEventListener('DOMContentLoaded', loadHighlights);
window.addEventListener('load', loadHighlights);

const observer = new MutationObserver(function(mutations) {
    loadHighlights();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

window.debugAnnotations = {
    showStorage: function() {
        chrome.storage.local.get(null, function(data) {
            console.log('All stored highlights:', data);
        });
    },
    reloadHighlights: loadHighlights
};

function createNoteDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'note-dialog-overlay';
    dialog.innerHTML = `
        <div class="note-dialog">
            <h3>Edit Note</h3>
            <textarea placeholder="Enter your note here..."></textarea>
            <div class="note-dialog-buttons">
                <button class="cancel-btn">Cancel</button>
                <button class="save-btn">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
    return dialog;
}

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .note-dialog-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
    }

    .note-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 300px;
        max-width: 90%;
        z-index: 10001;
    }

    .note-dialog textarea {
        width: 100%;
        min-height: 100px;
        margin: 10px 0;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        font-family: inherit;
        font-size: 14px;
    }

    .note-dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .note-dialog button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .note-dialog .save-btn {
        background: #4CAF50;
        color: white;
    }

    .note-dialog .cancel-btn {
        background: #f5f5f5;
        color: #333;
    }

    .note-dialog button:hover {
        opacity: 0.9;
    }

    .web-annotator-highlight[data-note]:hover::after {
        content: attr(data-note);
        position: absolute;
        bottom: 100%;
        left: 0;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: pre-wrap;
        max-width: 200px;
        z-index: 10002;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
`;
document.head.appendChild(styleSheet);

const noteDialog = createNoteDialog();
let currentHighlight = null;

document.addEventListener('contextmenu', function(e) {
    const highlight = e.target.closest('.web-annotator-highlight');
    if (highlight) {
        e.preventDefault();
        currentHighlight = highlight;
        
        const textarea = noteDialog.querySelector('textarea');
        textarea.value = highlight.dataset.note || '';
        
        noteDialog.style.display = 'block';
        textarea.focus();
    }
});

noteDialog.querySelector('.save-btn').addEventListener('click', function() {
    if (currentHighlight) {
        const note = noteDialog.querySelector('textarea').value;
        currentHighlight.dataset.note = note;
        saveHighlight(currentHighlight);
        noteDialog.style.display = 'none';
    }
});

noteDialog.querySelector('.cancel-btn').addEventListener('click', function() {
    noteDialog.style.display = 'none';
});

noteDialog.addEventListener('click', function(e) {
    if (e.target === noteDialog) {
        noteDialog.style.display = 'none';
    }
});

document.addEventListener('keydown', function(e) {
    if (noteDialog.style.display === 'block') {
        if (e.key === 'Escape') {
            noteDialog.style.display = 'none';
        } else if (e.key === 'Enter' && e.ctrlKey) {
            noteDialog.querySelector('.save-btn').click();
        }
    }
});

chrome.storage.local.get('currentColor', function(data) {
    if (data.currentColor) {
        currentColor = data.currentColor;
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "setHighlightColor") {
        currentColor = request.color;
        chrome.storage.local.set({ currentColor: request.color });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "setHighlightColor") {
        currentColor = request.color;
        chrome.storage.local.set({ currentColor: request.color });
    }
});
