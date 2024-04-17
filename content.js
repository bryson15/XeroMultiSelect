document.addEventListener('DOMContentLoaded', () => {

    const lineItemsContainer = document.querySelector(".x-grid3-body");

    function createHandlers(nthRow, nthColumn) {

        const aboveRowHeights = [];
        const belowRowHeights = [];

        for (var i = 0; i < lineItemsContainer.children.length; i++) {
            const lineItems = lineItemsContainer.children[i];
            const rect = lineItems.getBoundingClientRect();
            if (i + 1 < nthRow) { 
                aboveRowHeights.push(rect.bottom + window.scrollY);
            } 
            else if (i + 1 > nthRow) {
                belowRowHeights.push(rect.top + window.scrollY);
            }
        }

        const mouseMoveHandler = (e) => {
            const mouseYPos = e.clientY + window.scrollY;

            for (const i in aboveRowHeights) {
                const aboveRowHeight = aboveRowHeights[i];
                const lineItems = lineItemsContainer.children[i];
                const cell = lineItems.querySelector(`tr td:nth-child(${nthColumn}) div`)
                if (mouseYPos < aboveRowHeight) {
                    cell.classList.add("de-highlighted-cell");
                } else {
                    cell.classList.remove("de-highlighted-cell");
                }
            }

            for (const i in belowRowHeights) {
                const belowRowHeight = belowRowHeights[i];
                const lineItems = lineItemsContainer.children[nthRow + parseInt(i)];

                const cell = lineItems.querySelector(`tr td:nth-child(${nthColumn}) div`)
                if (mouseYPos > belowRowHeight) {
                    cell.classList.add("de-highlighted-cell");
                } else {
                    cell.classList.remove("de-highlighted-cell");
                }
            }
        };

        return mouseMoveHandler;
    }

    lineItemsContainer.addEventListener("mousedown", (e) => {
        let target;
        if (e.target.classList.contains("x-grid3-cell-inner")) {
            target = e.target;
        } else if (e.target.classList.contains("x-grid3-cell")) {
            target = e.target.firstElementChild;
        } else if (e.target.classList.contains("invoiceDescription")) {
            target = e.target.parentElement;
        } else {
            return;
        }

        e.preventDefault();
        document.body.classList.add('no-select');
        const nthColumn = target.parentElement.cellIndex + 1;
        const row = target.closest('div.x-grid3-row');
        if (!row) return;
        const nthRow = Array.prototype.indexOf.call(row.parentElement.children, row) + 1;
        target.classList.add("de-selected-cell");

        const mouseMoveHandler = createHandlers(nthRow, nthColumn);

        lineItemsContainer.addEventListener('mousemove', mouseMoveHandler);

        window.addEventListener('mouseup', () => {
            lineItemsContainer.removeEventListener('mousemove', mouseMoveHandler);
            document.body.classList.remove('no-select');
            target.classList.remove("de-selected-cell");

            const focusListener = (focusEvent) => {

                const dropdownButton = focusEvent.target.nextElementSibling;
                const preventDefault = (e) => {
                    e.preventDefault(); 
                }

                if (dropdownButton) {
                    dropdownButton.addEventListener("mousedown", preventDefault);
                }

                const blurHandler = () => { 
                    const focusValue = focusEvent.target.value;
                    let selectedText = "";
                    const allSelected = document.querySelectorAll(".x-combo-selected");
                    allSelected.forEach((selected) => {
                        const selectedChild = selected.firstElementChild;
                        if (selectedChild && selectedText === "") {
                            selected.classList.remove("x-combo-selected");
                            selectedText = selectedChild.innerHTML;

                        } else {
                            selectedText = selected.innerHTML;
                        }
                    });
                    if (allSelected.length === 0) {
                        selectedText = focusValue;
                    }

                    const focusListener = (ef) => {
                        if (ef.target.classList.contains("x-form-text") || ef.target.classList.contains("x-form-textarea")) {

                            document.removeEventListener('focus', focusListener, true);

                            if (ef.target.classList.contains("x-form-text") && !ef.target.classList.contains("x-form-num-field")) {                  
                                if (input === "") {
                                    ef.target.value = "";
                        
                                } else if (selectedText !== "") {
                                    //ENCODE
                                    console.log("------ ENCODE ------");
                                    console.log(selectedText);
                                    ef.target.value = selectedText;
                                    //ef.target.value = selectedText.replace(/&/g, '&amp;');
                                }
                            } else if (input !== "&nbsp;") {
                                ef.target.value = input;
                            } 
                            document.querySelector(".x-grid3-cell-inner").click();
                        }
                        ef.target.blur();
                        
                        setTimeout(() => { ef.target.blur(); document.body.click() } , 100);
                    }

                    const highlightedCells = lineItemsContainer.querySelectorAll("div.de-highlighted-cell");

                    if (highlightedCells.length !== 0) {
                        document.addEventListener('focus', focusListener, true);
                        target.click();
                    }

                    highlightedCells.forEach((highlightedCell) => {

                        document.addEventListener('focus', focusListener, true);

                        if (target.innerHTML === "&nbsp;") {
                            if (input !== "&nbsp;") {
                                highlightedCell.innerText = "";
                            }
                         
                        } else if (input !== "&nbsp;") {

                            console.log("------- DECODE --------");
                            highlightedCell.innerText = target.innerHTML;
                            //highlightedCell.innerText = target.innerHTML.replace(/&amp;/g, '&');
                            
                        }
                        highlightedCell.click();
                    })

                    for (const lineItem of lineItemsContainer.children) {
                        const cell = lineItem.querySelector(`table tbody tr td:nth-child(${nthColumn}) div`);
                        if (cell) {
                            cell.classList.remove("de-highlighted-cell");
                        }
                        if (dropdownButton) {
                            dropdownButton.removeEventListener("mousedown", preventDefault);
                        }
                    }

                    focusEvent.target.removeEventListener('input', inputHandler);
                }

                var input = "&nbsp;";
                var inputTarget = null;

                const inputHandler = (e) => {
                    const highlightedCells = lineItemsContainer.querySelectorAll("div.de-highlighted-cell");
                    highlightedCells.forEach((highlightedCell) => {
                        highlightedCell.innerText = e.target.value;
                        input = e.target.value;
                        inputTarget = e.target;
                        console.log("input");
                    })
                }
    
                focusEvent.target.addEventListener('blur', blurHandler, { once: true });
                focusEvent.target.addEventListener('input', inputHandler);
    
                document.removeEventListener('focus', focusListener, true);
            };
    
            document.addEventListener('focus', focusListener, true);

            target.click();
        }, { once: true });
    });
});