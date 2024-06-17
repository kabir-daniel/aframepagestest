document.addEventListener('DOMContentLoaded', () => {
    const keyInput = document.getElementById('key');
    const triggerInput = document.getElementById('trigger');
    const velocityInput = document.getElementById('velocity');
    const presetInput = document.getElementById('preset');
    const add12Button = document.getElementById('add12');
    const exportButton = document.getElementById('export');
    const saveButton = document.getElementById('save');
    const loadButton = document.getElementById('load');
    const loadFileInput = document.getElementById('loadFile');
    const songNameInput = document.getElementById('songName');
    const copyButton = document.getElementById('copy');
    const pasteButton = document.getElementById('paste');
    const deselectButton = document.getElementById('deselect');

    let currentCell = null;
    let cols = 12; // Initial number of columns
    let selectionStartIndex = null;
    let selectionEndIndex = null;
    let copiedData = [];

    function createGrid(instrument, rows, cols) {
        const instrumentDiv = document.getElementById(instrument);
        const indexRow = instrumentDiv.querySelector('.index-row');
        indexRow.innerHTML = '';

        for (let i = 1; i <= cols; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = i;
            cell.addEventListener('click', () => handleIndexClick(instrument, i));
            indexRow.appendChild(cell);
        }

        const rowsDivs = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
        rowsDivs.forEach(row => {
            const existingCells = row.children.length;
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
            const greenValue = 0.5 + (0.5 * velocity / 4); // Calculate green value based on velocity
            cell.style.backgroundColor = `rgba(0, 255, 0, ${greenValue})`;
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
            triggerInput.value = currentCell.dataset.trigger; // Update displayed value
            updateCellColor(currentCell);
        }
    });

    velocityInput.addEventListener('click', () => {
        if (currentCell) {
            currentCell.dataset.velocity = (parseInt(currentCell.dataset.velocity) + 1) % 5;
            velocityInput.value = currentCell.dataset.velocity; // Update displayed value
            updateCellColor(currentCell);
        }
    });

    presetInput.addEventListener('click', () => {
        if (currentCell) {
            currentCell.dataset.preset = (parseInt(currentCell.dataset.preset) + 1) % 8;
            presetInput.value = currentCell.dataset.preset; // Update displayed value
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
                cell.addEventListener('click', () => handleIndexClick(instrument, i));
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
        let exportText = '';

        instruments.forEach(instrument => {
            exportText += `${instrument}\n`;
            const instrumentDiv = document.getElementById(instrument);
            const rowDivs = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
            rowDivs.forEach(row => {
                const rowData = Array.from(row.querySelectorAll('.cell')).map(cell => {
                    const key = parseInt(cell.dataset.key);
                    const trigger = parseInt(cell.dataset.trigger);
                    const velocity = parseInt(cell.dataset.velocity);
                    const preset = parseInt(cell.dataset.preset);
                    return `[${Math.max(key, trigger)},${velocity},${preset}]`;
                }).join(',');
                exportText += `${rowData}\n`;
            });
        });

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    saveButton.addEventListener('click', () => {
        const songName = songNameInput.value.trim();
        if (!songName) {
            alert('Please enter a song name.');
            return;
        }

        const instruments = ['drum', 'bass', 'synth', 'lead'];
        let saveData = {};

        instruments.forEach(instrument => {
            saveData[instrument] = [];
            const instrumentDiv = document.getElementById(instrument);
            const rowDivs = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
            rowDivs.forEach(row => {
                const rowData = Array.from(row.querySelectorAll('.cell')).map(cell => ({
                    key: parseInt(cell.dataset.key),
                    trigger: parseInt(cell.dataset.trigger),
                    velocity: parseInt(cell.dataset.velocity),
                    preset: parseInt(cell.dataset.preset)
                }));
                saveData[instrument].push(rowData);
            });
        });

        const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${songName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    loadButton.addEventListener('click', () => {
        loadFileInput.click();
    });

    loadFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);

            Object.keys(data).forEach(instrument => {
                const instrumentDiv = document.getElementById(instrument);
                const rowDivs = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);

                rowDivs.forEach((row, rowIndex) => {
                    const rowData = data[instrument][rowIndex];
                    row.querySelectorAll('.cell').forEach((cell, cellIndex) => {
                        const cellData = rowData[cellIndex];
                        cell.dataset.key = cellData.key;
                        cell.dataset.trigger = cellData.trigger;
                        cell.dataset.velocity = cellData.velocity;
                        cell.dataset.preset = cellData.preset;
                        updateCellColor(cell);
                    });
                });
            });
        };
        reader.readAsText(file);
    });

    function handleIndexClick(instrument, index) {
        const instrumentDiv = document.getElementById(instrument);
        const indexRow = instrumentDiv.querySelector('.index-row');
        const cells = Array.from(indexRow.children);
        const currentCell = cells[index - 1];

        if (!selectionStartIndex) {
            selectionStartIndex = index;
            currentCell.style.backgroundColor = 'darkgoldenrod';
        } else if (!selectionEndIndex) {
            selectionEndIndex = index;
            const start = Math.min(selectionStartIndex, selectionEndIndex);
            const end = Math.max(selectionStartIndex, selectionEndIndex);

            for (let i = start - 1; i < end; i++) {
                cells[i].style.backgroundColor = 'darkgoldenrod';
            }

            selectCells(instrument, start, end);
        }
    }

    function selectCells(instrument, start, end) {
        const instrumentDiv = document.getElementById(instrument);
        const rows = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
        
        rows.forEach(row => {
            for (let i = start - 1; i < end; i++) {
                row.children[i].classList.add('selected');
            }
        });
    }

    deselectButton.addEventListener('click', () => {
        const instruments = ['drum', 'bass', 'synth', 'lead'];
        instruments.forEach(instrument => {
            const instrumentDiv = document.getElementById(instrument);
            const indexRow = instrumentDiv.querySelector('.index-row');
            const cells = Array.from(indexRow.children);

            cells.forEach(cell => {
                cell.style.backgroundColor = '#444';
            });

            const rows = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
            rows.forEach(row => {
                Array.from(row.children).forEach(cell => {
                    cell.classList.remove('selected');
                });
            });
        });

        selectionStartIndex = null;
        selectionEndIndex = null;
    });

    copyButton.addEventListener('click', () => {
        if (!selectionStartIndex || !selectionEndIndex) return;

        const instruments = ['drum', 'bass', 'synth', 'lead'];
        const instrument = instruments.find(inst => {
            const instrumentDiv = document.getElementById(inst);
            return instrumentDiv.querySelector('.index-row .cell:nth-child(' + selectionStartIndex + ')').style.backgroundColor === 'darkgoldenrod';
        });

        if (!instrument) return;

        const instrumentDiv = document.getElementById(instrument);
        const rows = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
        const start = Math.min(selectionStartIndex, selectionEndIndex) - 1;
        const end = Math.max(selectionStartIndex, selectionEndIndex);

        copiedData = [];

        rows.forEach(row => {
            const rowData = Array.from(row.children).slice(start, end).map(cell => ({
                key: parseInt(cell.dataset.key),
                trigger: parseInt(cell.dataset.trigger),
                velocity: parseInt(cell.dataset.velocity),
                preset: parseInt(cell.dataset.preset)
            }));
            copiedData.push(rowData);
        });
    });

    pasteButton.addEventListener('click', () => {
        if (!selectionStartIndex || copiedData.length === 0) return;

        const instruments = ['drum', 'bass', 'synth', 'lead'];
        const instrument = instruments.find(inst => {
            const instrumentDiv = document.getElementById(inst);
            return instrumentDiv.querySelector('.index-row .cell:nth-child(' + selectionStartIndex + ')').style.backgroundColor === 'darkgoldenrod';
        });

        if (!instrument) return;

        const instrumentDiv = document.getElementById(instrument);
        const rows = instrumentDiv.querySelectorAll(`.row[data-instrument="${instrument}"]`);
        const start = selectionStartIndex - 1;

        rows.forEach((row, rowIndex) => {
            const rowData = copiedData[rowIndex];
            rowData.forEach((data, dataIndex) => {
                const cell = row.children[start + dataIndex];
                cell.dataset.key = data.key;
                cell.dataset.trigger = data.trigger;
                cell.dataset.velocity = data.velocity;
                cell.dataset.preset = data.preset;
                updateCellColor(cell);
            });
        });
    });

    // Add event listeners for keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (currentCell) {
            if (event.key === 'q') {
                triggerInput.click();
            } else if (event.key === 'w') {
                velocityInput.click();
            } else if (event.key === 'e') {
                presetInput.click();
            }
        }
    });
});
