document.addEventListener('DOMContentLoaded', function() {
    const tracks = {
        drum: { rows: 6, data: [] },
        bass: { rows: 1, data: [] },
        keys: { rows: 4, data: [] },
        lead: { rows: 1, data: [] }
    };

    function createTrack(track, rows) {
        const trackElement = document.getElementById(`${track}-track`);
        const grid = document.createElement('div');
        grid.classList.add('grid');
        grid.setAttribute('data-track', track);

        for (let i = 0; i < rows * 12; i++) {
            const cell = document.createElement('div');
            cell.setAttribute('data-index', i);
            cell.textContent = '0';
            cell.addEventListener('click', () => handleCellClick(track, i, cell));
            grid.appendChild(cell);
        }

        trackElement.appendChild(grid);
        initializeTrackData(track, rows);
    }

    function initializeTrackData(track, rows) {
        tracks[track].data = Array(rows).fill(null).map(() => Array(12).fill([0, 0, 0]));
    }

    function handleCellClick(track, index, cell) {
        const row = Math.floor(index / 12);
        const col = index % 12;
        const cellData = tracks[track].data[row][col];
        const [trigger, velocity, preset] = cellData;

        document.getElementById('trigger').value = trigger;
        document.getElementById('velocity').value = velocity;
        document.getElementById('preset').value = preset;

        document.getElementById('trigger').onchange = (e) => updateCellData(track, row, col, 'trigger', e.target.value, cell);
        document.getElementById('velocity').onchange = (e) => updateCellData(track, row, col, 'velocity', e.target.value, cell);
        document.getElementById('preset').onchange = (e) => updateCellData(track, row, col, 'preset', e.target.value, cell);
    }

    function updateCellData(track, row, col, field, value, cell) {
        let cellData = tracks[track].data[row][col];
        if (field === 'trigger') {
            value = (track === 'drum' ? (cellData[0] === 0 ? 1 : 0) : value);
            cellData[0] = value;
        } else if (field === 'velocity') {
            cellData[1] = (parseInt(value) + 1) % 5;
        } else if (field === 'preset') {
            cellData[2] = (parseInt(value) + 1) % 8;
        }
        tracks[track].data[row][col] = cellData;
        updateCellDisplay(cell, cellData[0]);
    }

    function updateCellDisplay(cell, trigger) {
        cell.textContent = trigger;
        cell.classList.toggle('active', trigger !== 0);
    }

    document.getElementById('add-12').addEventListener('click', () => {
        for (const track in tracks) {
            const trackElement = document.querySelector(`[data-track=${track}]`);
            const rows = tracks[track].rows;
            const currentCols = tracks[track].data[0].length;

            for (let i = 0; i < rows; i++) {
                for (let j = currentCols; j < currentCols + 12; j++) {
                    const cell = document.createElement('div');
                    cell.setAttribute('data-index', j);
                    cell.textContent = '0';
                    cell.addEventListener('click', () => handleCellClick(track, j, cell));
                    trackElement.querySelector('.grid').appendChild(cell);
                }
                tracks[track].data[i] = [...tracks[track].data[i], ...Array(12).fill([0, 0, 0])];
            }
            trackElement.querySelector('.grid').style.gridTemplateColumns = `repeat(${currentCols + 12}, 30px)`;
        }
    });

    document.getElementById('export').addEventListener('click', () => {
        let exportData = '';
        for (const track in tracks) {
            exportData += `${track}\n`;
            for (const row of tracks[track].data) {
                exportData += JSON.stringify(row) + '\n';
            }
        }
        const blob = new Blob([exportData], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'track-data.txt';
        link.click();
    });

    for (const track in tracks) {
        createTrack(track, tracks[track].rows);
    }
});

