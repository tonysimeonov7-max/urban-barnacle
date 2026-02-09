// HuggingFace API configuration - called directly from the browser (no backend needed)
const HUGGINGFACE_API_URL = 'https://datasets-server.huggingface.co/rows';

// Dataset definitions with field mappings and column headers
const DATASETS = {
    alpaca: {
        name: 'vislupus/alpaca-bulgarian-dictionary',
        config: 'default',
        split: 'train',
        columns: [
            { key: 'input', header: 'Дума (Word)', className: 'col-word' },
            { key: 'instruction', header: 'Въпрос (Question)', className: 'col-definition' },
            { key: 'output', header: 'Отговор (Answer)', className: 'col-extra' }
        ]
    },
    bogko: {
        name: 'thebogko/bulgarian-dictionary-2024',
        config: 'default',
        split: 'train',
        columns: [
            { key: 'word', header: 'Дума (Word)', className: 'col-word' },
            { key: 'tag', header: 'Етикет (Tag)', className: 'col-definition' }
        ]
    }
};

let currentDatasetKey = 'alpaca';

// State management
let currentOffset = 0;
const itemsPerPage = 100;
let allData = [];
let filteredData = [];
let totalRows = 0;

// DOM elements
const dictionaryBody = document.getElementById('dictionaryBody');
const dictionaryHead = document.getElementById('dictionaryHead');
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
const datasetSelect = document.getElementById('datasetSelect');

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

    datasetSelect.addEventListener('change', () => {
        currentDatasetKey = datasetSelect.value;
        currentOffset = 0;
        totalRows = 0;
        allData = [];
        filteredData = [];
        searchInput.value = '';
        updateTableHeaders();
        loadDictionary();
        loadStatistics();
    });
}

// Update table headers based on current dataset
function updateTableHeaders() {
    const ds = DATASETS[currentDatasetKey];
    const headerRow = dictionaryHead.querySelector('tr');
    let html = '<th class="col-index">#</th>';
    ds.columns.forEach(col => {
        html += `<th class="${col.className}">${col.header}</th>`;
    });
    headerRow.innerHTML = html;
}

// Load dictionary data directly from HuggingFace
async function loadDictionary() {
    showSpinner(true);
    hideError();

    const ds = DATASETS[currentDatasetKey];
    try {
        const url = `${HUGGINGFACE_API_URL}?dataset=${encodeURIComponent(ds.name)}&config=${ds.config}&split=${ds.split}&offset=${currentOffset}&length=${itemsPerPage}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch dictionary data');
        }

        const result = await response.json();
        allData = result.rows || [];
        filteredData = [...allData];
        
        // Update totalRows from the response if available
        if (result.num_rows_total) {
            totalRows = result.num_rows_total;
            updateStatistics();
        }

        renderTable();
        updatePaginationButtons();
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to load dictionary: ${error.message}`);
    } finally {
        showSpinner(false);
    }
}

// Load statistics directly from HuggingFace
async function loadStatistics() {
    const ds = DATASETS[currentDatasetKey];
    try {
        const url = `${HUGGINGFACE_API_URL}?dataset=${encodeURIComponent(ds.name)}&config=${ds.config}&split=${ds.split}&offset=0&length=1`;
        const response = await fetch(url);
        const data = await response.json();
        totalRows = data.num_rows_total || 'Unknown';
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
        const colCount = DATASETS[currentDatasetKey].columns.length + 1;
        dictionaryBody.innerHTML = `<tr><td colspan="${colCount}" class="empty-state">No entries found</td></tr>`;
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
    const rowObj = entry.row || entry;
    const ds = DATASETS[currentDatasetKey];
    const displayIndex = currentOffset + index + 1;

    let html = `<td class="col-index">${displayIndex}</td>`;
    ds.columns.forEach(col => {
        const value = rowObj[col.key] || '';
        html += `<td class="${col.className}">${escapeHtml(String(value))}</td>`;
    });
    row.innerHTML = html;

    return row;
}

// Perform search
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const ds = DATASETS[currentDatasetKey];

    if (!query) {
        filteredData = [...allData];
    } else {
        filteredData = allData.filter(entry => {
            const rowObj = entry.row || entry;
            return ds.columns.some(col => {
                return String(rowObj[col.key] || '').toLowerCase().includes(query);
            });
        });
    }

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
