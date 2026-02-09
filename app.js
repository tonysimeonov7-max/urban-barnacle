// State management
let currentOffset = 0;
const itemsPerPage = 100;
let allData = [];
let filteredData = [];
let totalRows = 0;

// DOM elements
const dictionaryBody = document.getElementById('dictionaryBody');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn2 = document.getElementById('prevBtn2');
const nextBtn2 = document.getElementById('nextBtn2');
const pageInfo = document.getElementById('pageInfo');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const statsText = document.getElementById('statsText');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadDictionary();
    loadStatistics();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    prevBtn.addEventListener('click', previousPage);
    nextBtn.addEventListener('click', nextPage);
    prevBtn2.addEventListener('click', previousPage);
    nextBtn2.addEventListener('click', nextPage);
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// Load dictionary data
async function loadDictionary() {
    showSpinner(true);
    hideError();

    try {
        const response = await fetch(`/api/dictionary?offset=${currentOffset}&length=${itemsPerPage}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch dictionary data');
        }

        const result = await response.json();
        allData = result.rows || [];
        filteredData = [...allData];
        
        renderTable();
        updatePaginationButtons();
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to load dictionary: ${error.message}`);
    } finally {
        showSpinner(false);
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        totalRows = data.totalRows;
        updateStatistics();
    } catch (error) {
        console.error('Error loading stats:', error);
        statsText.textContent = 'Could not load statistics';
    }
}

// Update statistics display
function updateStatistics() {
    const endIndex = Math.min(currentOffset + itemsPerPage, totalRows);
    if (totalRows !== 'Unknown') {
        statsText.textContent = `Total entries: ${totalRows.toLocaleString()} | Showing ${currentOffset + 1}-${endIndex}`;
    } else {
        statsText.textContent = `Showing entries ${currentOffset + 1}-${endIndex}`;
    }
}

// Render dictionary table
function renderTable() {
    dictionaryBody.innerHTML = '';

    if (filteredData.length === 0) {
        dictionaryBody.innerHTML = '<tr><td colspan="4" class="empty-state">No entries found</td></tr>';
        return;
    }

    filteredData.forEach((entry, index) => {
        const row = createTableRow(entry, index);
        dictionaryBody.appendChild(row);
    });
}

// Create a single table row
function createTableRow(entry, index) {
    const row = document.createElement('tr');
    
    // Extract data from the entry object
    const rowObj = entry.row || entry;
    
    // Handle different possible data structures
    let word = '';
    let definition = '';
    let extra = '';
    
    if (typeof rowObj === 'object') {
        // Try different possible key names for word
        word = rowObj.word || rowObj.bulgarian || rowObj.bg || rowObj.text || JSON.stringify(rowObj).substring(0, 50);
        
        // Try different possible key names for definition
        definition = rowObj.definition || rowObj.english || rowObj.en || rowObj.meaning || '';
        
        // Try additional info
        extra = rowObj.example || rowObj.part_of_speech || rowObj.pos || rowObj.note || '';
    } else {
        word = String(rowObj);
    }

    const displayIndex = currentOffset + index + 1;

    row.innerHTML = `
        <td class="col-index">${displayIndex}</td>
        <td class="col-word">${escapeHtml(String(word))}</td>
        <td class="col-definition">${escapeHtml(String(definition))}</td>
        <td class="col-extra">${escapeHtml(String(extra)) || '—'}</td>
    `;

    return row;
}

// Perform search
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        filteredData = [...allData];
    } else {
        filteredData = allData.filter(entry => {
            const rowObj = entry.row || entry;
            const word = String(rowObj.word || rowObj.bulgarian || rowObj.bg || '').toLowerCase();
            const definition = String(rowObj.definition || rowObj.english || rowObj.en || '').toLowerCase();
            
            return word.includes(query) || definition.includes(query);
        });
    }

    currentOffset = 0;
    renderTable();
    updatePaginationButtons();
}

// Pagination functions
function previousPage() {
    if (currentOffset >= itemsPerPage) {
        currentOffset -= itemsPerPage;
        loadDictionary();
    }
}

function nextPage() {
    currentOffset += itemsPerPage;
    loadDictionary();
}

// Update pagination button states
function updatePaginationButtons() {
    const canGoPrevious = currentOffset > 0;
    const canGoNext = currentOffset + itemsPerPage < totalRows || totalRows === 'Unknown';

    prevBtn.disabled = !canGoPrevious;
    nextBtn.disabled = !canGoNext;
    prevBtn2.disabled = !canGoPrevious;
    nextBtn2.disabled = !canGoNext;

    pageInfo.textContent = `Page ${Math.floor(currentOffset / itemsPerPage) + 1}`;
}

// Utility functions
function showSpinner(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
