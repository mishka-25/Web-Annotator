# Web Annotator Chrome Extension

## Overview
Web Annotator is a Chrome extension that allows users to highlight text on any webpage and add notes to their highlights. It's designed to help users study, research, and collaborate by marking important information and adding personal annotations.

## Features
- Text highlighting with multiple color options
- Add and edit notes to highlighted text
- Persistent storage of highlights and notes
- Color customization
- Keyboard shortcuts for quick note editing
- Hover tooltips to view notes
- Works on any webpage
- Automatic highlight restoration when revisiting pages

## Installation
1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage
### Highlighting Text
1. Select any text on a webpage
2. Choose a highlight color from the extension popup
3. The selected text will be highlighted in the chosen color

### Adding/Editing Notes
1. Right-click on any highlighted text
2. Enter your note in the dialog box
3. Click "Save" or press Ctrl+Enter to save the note
4. Press Esc to cancel

### Changing Colors
1. Click the extension icon in the toolbar
2. Select from preset colors: (or choose from the color picker)
   - Yellow (default)
   - Light Green
   - Light Blue
   - Pink

### Keyboard Shortcuts
- `Ctrl + Enter`: Save note
- `Esc`: Cancel note editing

## Technical Details
### Files Structure

web-annotator/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
└── README.md


### Technologies Used
- JavaScript (ES6+)
- Chrome Extension APIs
- HTML5
- CSS3

### Key Components
1. **Content Script (`content.js`)**
   - Handles text selection and highlighting
   - Manages note dialog interactions
   - Saves and loads highlights
   - Handles DOM mutations

2. **Popup Interface (`popup.html`, `popup.js`)**
   - Color selection interface
   - User instructions
   - Color state management

3. **Storage**
   - Uses Chrome's local storage API
   - Stores highlights, notes, and color preferences
   - Persists data between sessions

## Features in Detail
### Highlight Storage
- Highlights are stored per URL
- Each highlight contains:
  - Selected text
  - Color
  - Note content
  - Timestamp
  - Page context

### Note System
- Modal dialog interface
- Rich text input
- Automatic positioning
- Click-outside closing
- Keyboard shortcut support

### Color Management
- Preset color options
- Color persistence
- Real-time color updates
- Visual color indicators

## Browser Compatibility
- Chrome 88+
- Chromium-based browsers (Edge, Opera, etc.)

## Development
### Local Development
1. Make changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Test changes on various websites

### Debugging
- Use `console.log()` statements for debugging
- Access stored data through Chrome's developer tools
- Use the built-in debugging function: `window.debugAnnotations.showStorage()`

## Future Enhancements
- Export/Import highlights
- Highlight organization and categorization
- Search through highlights
- Collaboration features
- Multiple highlight styles

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


## Author
Mishka Singla
24116052
