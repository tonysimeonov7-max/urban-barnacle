# 🇧🇬 Bulgarian Dictionary Website

A modern web application that fetches and displays Bulgarian language dictionary data from the HuggingFace Datasets API.

## Features

- **Real-time Data Fetching**: Pulls data directly from the HuggingFace `vislupus/alpaca-bulgarian-dictionary` dataset
- **Search Functionality**: Search through dictionary entries by word or definition
- **Pagination**: Browse through entries efficiently (100 items per page)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Statistics**: View total dictionary entries and current page information
- **Clean UI**: Modern, user-friendly interface with a Bulgarian flag theme

## Tech Stack

**Backend:**
- Node.js
- Express.js
- CORS enabled for frontend communication

**Frontend:**
- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript (ES6+)

**Data Source:**
- HuggingFace Datasets API
- Dataset: [vislupus/alpaca-bulgarian-dictionary](https://huggingface.co/datasets/vislupus/alpaca-bulgarian-dictionary)

## Project Structure

```
urban-barnacle/
├── index.html          # Frontend - Main HTML page
├── app.js              # Frontend - JavaScript logic
├── styles.css          # Frontend - Styling
├── .gitignore          # Git ignore rules
├── README.md           # This file
└── backend/
    ├── server.js       # Express backend server
    ├── package.json    # Backend dependencies
    └── node_modules/   # Backend dependencies folder
```

## Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Start the Server

```bash
npm start
```

The website will be available at `http://localhost:3000`

### Features in Action:

1. **Browse Dictionary**: The page loads with the first 100 entries from the Bulgarian dictionary
2. **Search**: Use the search bar to find words or definitions
3. **Navigate**: Use Previous/Next buttons to browse through pages
4. **View Statistics**: See total entries and current page range

## API Endpoints

### GET `/api/dictionary`
Fetches dictionary entries from HuggingFace API

**Query Parameters:**
- `offset`: Starting position (default: 0)
- `length`: Number of entries to fetch (default: 100)

**Example:**
```bash
curl http://localhost:3000/api/dictionary?offset=0&length=100
```

### GET `/api/stats`
Returns statistics about the dictionary

**Example:**
```bash
curl http://localhost:3000/api/stats
```

## How It Works

1. **Server-side Fetching**: The Express backend connects to HuggingFace's Datasets API to ensure proper CORS handling
2. **Data Processing**: Dictionary entries are parsed and formatted for display
3. **Frontend Display**: JavaScript dynamically renders the table with search and pagination features
4. **Static Files**: Frontend files (HTML, CSS, JS) are served from the root directory

## Configuration

The application uses the following defaults:
- **Port**: 3000 (can be changed via PORT environment variable)
- **Items per page**: 100
- **Dataset**: vislupus/alpaca-bulgarian-dictionary
- **Split**: train

To change the port:
```bash
PORT=8080 npm start
```

## Browser Support

- Chrome/Edge: ✅ Full compatibility
- Firefox: ✅ Full compatibility
- Safari: ✅ Full compatibility
- Mobile browsers: ✅ Full compatibility

## Troubleshooting

### "Cannot find module" errors
```bash
cd backend
npm install
```

### Port already in use
```bash
PORT=3001 npm start
```

### Not connecting to HuggingFace API
- Check internet connection
- Verify HuggingFace API is accessible
- Check server logs for detailed error messages

## License

MIT
