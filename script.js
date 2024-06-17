const instruments = {
    drum: 6,
    bass: 1,
    synth: 4,
    lead: 1
};

const gridColumns = 12;
let selectedCell = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeGrids();
    addEventListeners();
});

function initializeGrids() {
    for (let instrument in instruments) {
        const grid = document.getElementById(instrument);
        const indexRow = grid.querySelector('.index-row');
        for (let i = 1; i <= gridColumns; i++) {
            const indexCell = document.createElement('div');
            indexCell.textContent = i;
            indexRow.appendChild(indexCell);
        }
        for (let i = 0; i < instruments[instrument]; i++) {
            const row = grid.querySelectorAll('.row')[i + 1];
            for (let j = 0; j < gridColumns; j++) {
                const cell = document.createElement('div');
                cell.dataset.key = 0;
                cell.dataset.trigger = 0;
                cell.dataset.velocity = 0;
                cell.dataset.preset = 0;
                updateCellDisplay(cell);
                cell.addEventListener('click', () => selectCell(cell));
                row.appendChild(cell);
            }
        }
    }
}

function addEventListeners() {
    document.getElementById('trigger').addEventListener('click', () => incrementValue('trigger', 2));
    document.getElementById('velocity').addEventListener('click', () => incrementValue('velocity', 5));
    document.getElementById('preset').addEventListener('click', () => incrementValue('preset', 8));
    document.getElementById('add-12').addEventListener('click', add12);
    document.getElementById('export').addEventListener('click', exportData);
    document.getElementById('key').addEventListener('input', updateSelectedCell);
}

function selectCell(cell) {
    selectedCell = cell;
    document.getElementById('key').value = cell.dataset.key;
    document.getElementById('trigger').value = cell.dataset.trigger;
    document.getElementById('velocity').value = cell.dataset.velocity;
    document.getElementById('preset').value = cell.dataset.preset;
}

function updateSelectedCell() {
    if (!selectedCell) return;
    selectedCell.dataset.key = document.getElementById('key').value;
    selectedCell.dataset.trigger = document.getElementById('trigger').value;
    selectedCell.dataset.velocity = document.getElementById('velocity').value;
    selectedCell.dataset.preset = document.getElementById('preset').value;
    updateCellDisplay(selectedCell);
}

function incrementValue(field, max) {
    if (!selectedCell) return;
    let value = parseInt(selectedCell.dataset[field]);
    value = (value + 1) % max;
    selectedCell.dataset[field] = value;
    document.getElementById(field).value = value;
    updateCellDisplay(selectedCell);
}

function updateCellDisplay(cell) {
    const key = parseInt(cell.dataset.key);
    const trigger = parseInt(cell.dataset.trigger);
    const velocity = parseInt(cell.dataset.velocity);
    const displayValue = Math.max(key, trigger);
    cell.textContent = displayValue;

    if (displayValue > 0) {
        const greenIntensity = 51 * velocity;
        cell.style.backgroundColor = `rgb(0, ${greenIntensity}, 0)`;
    } else {
        cell.style.backgroundColor = 'red';
    }
}

function add12() {
    for (let instrument in instruments) {
        const grid = document.getElementById(instrument);
        const rows = grid.querySelectorAll('.row');
        rows.forEach(row => {
            for (let i = 0; i < 12; i++) {
                const cell = document.createElement('div');
                cell.dataset.key = 0;
                cell.dataset.trigger = 0;
                cell.dataset.velocity = 0;
                cell.dataset.preset = 0;
                updateCellDisplay(cell);
                cell.addEventListener('click', () => selectCell(cell));
                row.appendChild(cell);
            }
        });
    }
}

function exportData() {
    const data = {};
    for (let instrument in instruments) {
        const grid = document.getElementById(instrument);
        data[instrument] = [];
        const rows = grid.querySelectorAll('.row');
        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll('div').forEach(cell => {
                const key = parseInt(cell.dataset.key);
                const trigger = parseInt(cell.dataset.trigger);
                const velocity = parseInt(cell.dataset.velocity);
                const preset = parseInt(cell.dataset.preset);
                rowData.push([Math.max(key, trigger), velocity, preset]);
            });
            data[instrument].push(rowData);
        });
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.txt';
    a.click();
    URL.revokeObjectURL(url);
}
