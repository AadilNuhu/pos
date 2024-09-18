document.addEventListener('DOMContentLoaded', () => {
    const stockForm = document.getElementById('stock-form');
    const totalStocksDisplay = document.getElementById('total-stocks');
    const viewStocksBtn = document.getElementById('view-stocks-btn');

    // Initialize stocks from localStorage or as an empty array
    let stocks = JSON.parse(localStorage.getItem('stocks')) || [];
    let totalStocks = stocks.reduce((sum, stock) => sum + stock.amount, 0);

    // Display total stocks on load (only if on index.html)
    if (totalStocksDisplay) {
        totalStocksDisplay.textContent = totalStocks;
    }

    // Handle stock submission (only if on index.html)
    if (stockForm) {
        stockForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const stockName = document.getElementById('stock-name').value;
            const stockAmount = parseInt(document.getElementById('stock-amount').value);
            const stockPrice = parseFloat(document.getElementById('stock-price').value);

            // Ensure all fields are valid before adding
            if (stockName && stockAmount > 0 && !isNaN(stockPrice)) {
                // Add new stock to the array
                stocks.push({ name: stockName, amount: stockAmount, price: stockPrice });
                totalStocks += stockAmount;

                // Update localStorage
                localStorage.setItem('stocks', JSON.stringify(stocks));

                // Update total stocks display
                if (totalStocksDisplay) {
                    totalStocksDisplay.textContent = totalStocks;
                }
                stockForm.reset();
            } else {
                alert("Please fill in all fields correctly.");
            }
        });
    }

    // View stocks button functionality (only if on index.html)
    if (viewStocksBtn) {
        viewStocksBtn.addEventListener('click', () => {
            window.location.href = 'stocks.html';
        });
    }

    // Stock listing on stocks.html (only if on stocks.html)
    if (document.getElementById('stock-list')) {
        const stockList = document.getElementById('stock-list');

        function renderStocks() {
            stockList.innerHTML = '';
            stocks.forEach((stock, index) => {
                if (stock && stock.name && stock.amount !== undefined && stock.price !== undefined) {
                    const stockListItem = document.createElement('li');
                    stockListItem.textContent = `${stock.name}: ${stock.amount} (Price: ₵${stock.price ? stock.price.toFixed(2) : 'N/A'})`;

                    const updateButton = document.createElement('button');
                    updateButton.textContent = 'Update';
                    updateButton.className = 'action-button update-button'; // Add classes
                    updateButton.onclick = () => updateStock(index);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'action-button delete-button'; // Add classes
                    deleteButton.onclick = () => deleteStock(index);

                    stockListItem.appendChild(updateButton);
                    stockListItem.appendChild(deleteButton);
                    stockList.appendChild(stockListItem);
                }
            });
        }

        renderStocks();

        function updateStock(index) {
            const newAmount = prompt("Enter new amount for " + stocks[index].name, stocks[index].amount);
            const newPrice = prompt("Enter new price for " + stocks[index].name, stocks[index].price);

            if (newAmount !== null && !isNaN(newAmount) && newPrice !== null && !isNaN(newPrice)) {
                const amount = parseInt(newAmount);
                const price = parseFloat(newPrice);

                totalStocks = totalStocks - stocks[index].amount + amount; // Update total stocks
                stocks[index].amount = amount; // Update the amount
                stocks[index].price = price; // Update the price
                localStorage.setItem('stocks', JSON.stringify(stocks)); // Save updated stocks

                // Update total stocks display only if on index.html
                if (totalStocksDisplay) {
                    totalStocksDisplay.textContent = totalStocks; // Update display
                }
                renderStocks(); // Re-render stock list
            }
        }

        function deleteStock(index) {
            totalStocks -= stocks[index].amount; // Update total stocks
            stocks.splice(index, 1); // Remove the stock from the array
            localStorage.setItem('stocks', JSON.stringify(stocks)); // Save updated stocks

            // Update total stocks display only if on index.html
            if (totalStocksDisplay) {
                totalStocksDisplay.textContent = totalStocks; // Update display
            }
            renderStocks(); // Re-render stock list
        }
    }

    // Print stocks functionality (only if on stocks.html)
    if (document.getElementById('print-btn')) {
        document.getElementById('print-btn').addEventListener('click', () => {
            // Create a printable content
            let printContent = '<h1>Stock List</h1><ul>';
            stocks.forEach(stock => {
                printContent += `<li>${stock.name}: ${stock.amount} (Price: ₵${stock.price ? stock.price.toFixed(2) : 'N/A'})</li>`;
            });
            printContent += `</ul><h2>Total Stocks: ${totalStocks}</h2>`;

            // Open a new window for printing
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Print Stocks</title>');
            printWindow.document.write('<style>body { font-family: Arial; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        });
    }

    // Back button functionality (only if on stocks.html)
    if (document.getElementById('back-btn')) {
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});



document.addEventListener('DOMContentLoaded', () => {
    const salesForm = document.getElementById('salesForm');
    const salesList = document.getElementById('salesList');
    const totalSalesSpan = document.getElementById('totalSales');
    
    let totalSales = 0;

    // Load existing sales from localStorage
    const loadSales = () => {
        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        sales.forEach(item => {
            addSaleToList(item.stockName, item.quantity, item.price);
        });
    };

    // Add sale to the list and update total sales
    const addSaleToList = (stockName, quantity, price) => {
        const total = quantity * price;
        totalSales += total;

        // Create a new list item
        const newListItem = document.createElement('li');
        newListItem.innerHTML = `${stockName}: Quantity ${quantity}, Price ₵${price.toFixed(2)}, Total ₵${total.toFixed(2)} 
            <button class="deleteBtn">Delete</button>`;
        salesList.appendChild(newListItem);

        // Update the total sales displayed
        totalSalesSpan.textContent = totalSales.toFixed(2);

        // Add delete functionality
        newListItem.querySelector('.deleteBtn').addEventListener('click', () => {
            deleteSale(stockName, quantity, price, newListItem);
        });
    };

    const deleteSale = (stockName, quantity, price, listItem) => {
        const total = quantity * price;
        totalSales -= total;

        // Remove from the displayed list
        salesList.removeChild(listItem);

        // Update the total sales displayed
        totalSalesSpan.textContent = totalSales.toFixed(2);

        // Update localStorage
        let sales = JSON.parse(localStorage.getItem('sales')) || [];
        sales = sales.filter(item => !(item.stockName === stockName && item.quantity === quantity && item.price === price));
        localStorage.setItem('sales', JSON.stringify(sales));
    };

    salesForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const stockName = document.getElementById('stockName').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const price = parseFloat(document.getElementById('price').value);

        // Add to localStorage
        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        sales.push({ stockName, quantity, price });
        localStorage.setItem('sales', JSON.stringify(sales));

        // Add to the list and update total sales
        addSaleToList(stockName, quantity, price);

        // Clear the form
        salesForm.reset();
    });

    // Load sales on page load
    loadSales();
});