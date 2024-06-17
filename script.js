document.addEventListener('DOMContentLoaded', () => {
    const keyInput = document.getElementById('key');
    const triggerInput = document.getElementById('trigger');
    const velocityInput = document.getElementById('velocity');
    const presetInput = document.getElementById('preset');
    const add12Button = document.getElementById('add12');
    const exportButton = document.getElementById('export');

    let currentCell = null;
    let cols = 12; // Initial number of columns

    function createGrid(instrument, rows, cols) {
        const instrumentDiv = document.getElementById(instrument);
        const indexRow = instrumentDiv.querySelector('.index-row');
        indexRow.innerHTML = '';

        for (let i = 1; i <= cols; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = i;
            indexRow.appendChild(cell);
        }

        const rowsDivs = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
        rowsDivs.forEach(row => {
            row.innerHTML = ''; // Clear the existing cells
            for (let i = 1; i <= cols; i++) {
                const cell = document.createElement('div');
                cell.classList.add('cell', 'red');
                cell.dataset.key = 0;
                cell.dataset.trigger = 0;
                cell.dataset.velocity = 0;
                cell.dataset.preset = 0;
                cell.textContent = '0';
                cell.addEventListener('click', () => {
                    currentCell = cell;
                    keyInput.value = cell.dataset.key;
                    triggerInput.value = cell.dataset.trigger;
                    velocityInput.value = cell.dataset.velocity;
                    presetInput.value = cell.dataset.preset;
                });
                row.appendChild(cell);
            }
        });
    }

    createGrid('drum', 6, cols);
    createGrid('bass', 1, cols);
    createGrid('synth', 4, cols);
    createGrid('lead', 1, cols);

    function updateCellColor(cell) {
        const key = parseInt(cell.dataset.key);
        const trigger = parseInt(cell.dataset.trigger);
        const velocity = parseInt(cell.dataset.velocity);

        if (key > 0 || trigger > 0) {
            cell.classList.remove('red');
            cell.classList.add('green');
            cell.style.backgroundColor = `rgba(0, 255, 0, ${0.2 + 0.2 * velocity})`;
        } else {
            cell.classList.remove('green');
            cell.classList.add('red');
            cell.style.backgroundColor = 'lightcoral';
        }

        cell.textContent = Math.max(key, trigger);
    }

    keyInput.addEventListener('input', () => {
        if (currentCell) {
            currentCell.dataset.key = keyInput.value;
            updateCellColor(currentCell);
        }
    });

    triggerInput.addEventListener('click', () => {
        if (currentCell) {
            currentCell.dataset.trigger = (parseInt(currentCell.dataset.trigger) + 1) % 2;
            updateCellColor(currentCell);
        }
    });

    velocityInput.addEventListener('click', () => {
        if (currentCell) {
            currentCell.dataset.velocity = (parseInt(currentCell.dataset.velocity) + 1) % 5;
            updateCellColor(currentCell);
        }
    });

    presetInput.addEventListener('click', () => {
        if (currentCell) {
            currentCell.dataset.preset = (parseInt(currentCell.dataset.preset) + 1) % 8;
            updateCellColor(currentCell);
        }
    });

    add12Button.addEventListener('click', () => {
        cols += 12;

        const instruments = ['drum', 'bass', 'synth', 'lead'];
        instruments.forEach(instrument => {
            const instrumentDiv = document.getElementById(instrument);
            const indexRow = instrumentDiv.querySelector('.index-row');

            // Add new index cells
            for (let i = indexRow.children.length + 1; i <= cols; i++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.textContent = i;
                indexRow.appendChild(cell);
            }

            const rows = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
            rows.forEach(row => {
                const existingCells = row.children.length;

                // Add new cells to each row
                for (let i = existingCells + 1; i <= cols; i++) {
                    const cell = document.createElement('div');
                    cell.classList.add('cell', 'red');
                    cell.dataset.key = 0;
                    cell.dataset.trigger = 0;
                    cell.dataset.velocity = 0;
                    cell.dataset.preset = 0;
                    cell.textContent = '0';
                    cell.addEventListener('click', () => {
                        currentCell = cell;
                        keyInput.value = cell.dataset.key;
                        triggerInput.value = cell.dataset.trigger;
                        velocityInput.value = cell.dataset.velocity;
                        presetInput.value = cell.dataset.preset;
                    });
                    row.appendChild(cell);
                }
            });
        });
    });

    exportButton.addEventListener('click', () => {
        const instruments = ['drum', 'bass', 'synth', 'lead'];
        const data = {};

        instruments.forEach(instrument => {
            const rows = [];
            const instrumentDiv = document.getElementById(instrument);
            const rowDivs = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
            rowDivs.forEach(row => {
                const cells = Array.from(row.querySelectorAll('.cell')).map(cell => {
                    const key = parseInt(cell.dataset.key);
                    const trigger = parseInt(cell.dataset.trigger);
                    const velocity = parseInt(cell.dataset.velocity);
                    const preset = parseInt(cell.dataset.preset);
                    return [Math.max(key, trigger), velocity, preset];
                });
                rows.push(cells);
            });
            data[instrument] = rows;
        });

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
