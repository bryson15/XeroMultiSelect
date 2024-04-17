document.addEventListener('DOMContentLoaded', () => {
    const lineItemsContainer = document.querySelector(".x-grid3-body");

    function getRowHeights(nthRow) {
        const rowHeights = { above: [], below: [] };
        lineItemsContainer.children.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const height = rect.top + window.scrollY;
            if (index < nthRow - 1) {
                rowHeights.above.push(height);
            } else if (index > nthRow - 1) {
                rowHeights.below.push(height);
            }
        });
        return rowHeights;
    }

    function createMouseMoveHandler(rowHeights, nthColumn) {
        return (e) => {
            const mouseYPos = e.clientY + window.scrollY;
            rowHeights.above.forEach((height, i) => {
                toggleCellHighlight(lineItemsContainer.children[i], nthColumn, mouseYPos < height);
            });
            rowHeights.below.forEach((height, i) => {
                toggleCellHighlight(lineItemsContainer.children[nthRow + i], nthColumn, mouseYPos > height);
            });
        };
    }

    function toggleCellHighlight(item, nthColumn, highlight) {
        const cell = item.querySelector(`tr td:nth-child(${nthColumn}) div`);
        if (cell) {
            cell.classList.toggle("de-highlighted-cell", highlight);
        }
    }

    function handleMouseDown(e) {
        const target = getEventTarget(e);
        if (!target) return;

        e.preventDefault();
        document.body.classList.add('no-select');
        const nthColumn = target.parentElement.cellIndex + 1;
        const row = target.closest('div.x-grid3-row');
        if (!row) return;

        const nthRow = Array.from(row.parentElement.children).indexOf(row) + 1;
        target.classList.add("de-selected-cell");
        
        const rowHeights = getRowHeights(nthRow);
        const mouseMoveHandler = createMouseMoveHandler(rowHeights, nthColumn);
        setupMouseMoveCleanup(mouseMoveHandler, target);
    }

    function getEventTarget(e) {
        if (e.target.classList.contains("x-grid3-cell-inner")) {
            return e.target;
        } else if (e.target.classList.contains("x-grid3-cell")) {
            return e.target.firstElementChild;
        } else if (e.target.closest('.invoiceDescription')) {
            return e.target.closest('.invoiceDescription');
        }
        return null;
    }

    function setupMouseMoveCleanup(mouseMoveHandler, target) {
        lineItemsContainer.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', () => {
            lineItemsContainer.removeEventListener('mousemove', mouseMoveHandler);
            document.body.classList.remove('no-select');
            target.classList.remove("de-selected-cell");
            handleCleanup(target);
        }, { once: true });
    }

    function handleCleanup(target) {
        const highlightedCells = lineItemsContainer.querySelectorAll("div.de-highlighted-cell");
        highlightedCells.forEach(cell => {
            cell.classList.remove("de-highlighted-cell");
            // additional cleanup actions can be performed here
        });
        // other cleanup operations can be included here if necessary
    }

    lineItemsContainer.addEventListener("mousedown", handleMouseDown);
});
