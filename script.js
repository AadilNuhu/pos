// Stock Management System
class StockManager {
    constructor() {
        this.stocks = JSON.parse(localStorage.getItem('stocks')) || [];
        this.sortStocksByDate(); // Sort by date by default
        this.totalStocks = this.calculateTotalStocks();
        this.totalStockValue = this.calculateTotalStockValue();
    }

    sortStocksByDate() {
        this.stocks.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    calculateTotalStocks() {
        return this.stocks.reduce((sum, stock) => sum + (stock.amount || 0), 0);
    }

    calculateTotalStockValue() {
        return this.stocks.reduce((sum, stock) => sum + ((stock.amount || 0) * (stock.price || 0)), 0);
    }

    addStock(stock) {
        if (!stock.name || !stock.amount || !stock.price || !stock.date) {
            throw new Error("All stock fields are required");
        }

        this.stocks.push(stock);
        this.sortStocksByDate(); // Re-sort after adding
        this.totalStocks += stock.amount;
        this.totalStockValue += stock.amount * stock.price;
        this.saveToLocalStorage();
    }

    updateStock(index, updatedStock) {
        if (index < 0 || index >= this.stocks.length) {
            throw new Error("Invalid stock index");
        }

        const oldStock = this.stocks[index];
        this.totalStocks = this.totalStocks - oldStock.amount + updatedStock.amount;
        this.totalStockValue = this.totalStockValue - (oldStock.amount * oldStock.price) + (updatedStock.amount * updatedStock.price);

        this.stocks[index] = updatedStock;
        this.sortStocksByDate(); // Re-sort after updating
        this.saveToLocalStorage();
    }

    deleteStock(index) {
        if (index < 0 || index >= this.stocks.length) {
            throw new Error("Invalid stock index");
        }

        const deletedStock = this.stocks[index];
        this.totalStocks -= deletedStock.amount;
        this.totalStockValue -= deletedStock.amount * deletedStock.price;

        this.stocks.splice(index, 1);
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem('stocks', JSON.stringify(this.stocks));
    }
}

// Sales Management System
class SalesManager {
    constructor() {
        this.sales = JSON.parse(localStorage.getItem('sales')) || [];
        this.totalSales = this.calculateTotalSales();
    }

    calculateTotalSales() {
        return this.sales.reduce((sum, sale) => sum + ((sale.quantity || 0) * (sale.price || 0)), 0);
    }

    addSale(sale) {
        if (!sale.stockName || !sale.quantity || !sale.price) {
            throw new Error("All sale fields are required");
        }

        this.sales.push(sale);
        this.totalSales += sale.quantity * sale.price;
        this.saveToLocalStorage();
    }

    deleteSale(index) {
        if (index < 0 || index >= this.sales.length) {
            throw new Error("Invalid sale index");
        }

        const deletedSale = this.sales[index];
        this.totalSales -= deletedSale.quantity * deletedSale.price;

        this.sales.splice(index, 1);
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem('sales', JSON.stringify(this.sales));
    }
}

// UI Controller
class UIController {
    static init() {
        this.stockManager = new StockManager();
        this.salesManager = new SalesManager();
        
        this.initStockForm();
        this.initViewStocksButton();
        this.renderStockList();
        this.initSalesForm();
        this.loadSales();
        this.initPrintButton();
        this.initBackButton();
    }

    static initStockForm() {
        const stockForm = document.getElementById('stock-form');
        if (!stockForm) return;

        this.updateStockDisplays();

        stockForm.addEventListener('submit', (event) => {
            event.preventDefault();

            try {
                const stockName = document.getElementById('stock-name').value.trim();
                const stockAmount = parseInt(document.getElementById('stock-amount').value);
                const stockPrice = parseFloat(document.getElementById('stock-price').value);
                const stockDate = document.getElementById('stock-date').value;

                if (!stockName || isNaN(stockAmount)) {
                    throw new Error("Please enter a valid stock name and amount");
                }

                if (isNaN(stockPrice) || stockPrice <= 0) {
                    throw new Error("Please enter a valid price");
                }

                if (!stockDate) {
                    throw new Error("Please select a date");
                }

                this.stockManager.addStock({
                    name: stockName,
                    amount: stockAmount,
                    price: stockPrice,
                    date: stockDate
                });

                this.updateStockDisplays();
                stockForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    static updateStockDisplays() {
        const totalStocksDisplay = document.getElementById('total-stocks');
        const totalPriceDisplay = document.getElementById('total-price');

        if (totalStocksDisplay) {
            totalStocksDisplay.textContent = this.stockManager.totalStocks;
        }
        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = this.stockManager.totalStockValue.toFixed(2);
        }
    }

    static initViewStocksButton() {
        const viewStocksBtn = document.getElementById('view-stocks-btn');
        if (viewStocksBtn) {
            viewStocksBtn.addEventListener('click', () => {
                window.location.href = 'stocks.html';
            });
        }
    }

    static renderStockList() {
        const stockList = document.getElementById('stock-list');
        if (!stockList) return;

        stockList.innerHTML = '';
        this.stockManager.stocks.forEach((stock, index) => {
            const stockListItem = document.createElement('li');
            const itemTotal = (stock.price * stock.amount) || 0;
            
            stockListItem.innerHTML = `
                <div class="stock-info">
                    <span class="stock-name">${stock.name}</span>
                    <span class="stock-details">
                        Quantity: ${stock.amount} | 
                        Price: cedis ${stock.price.toFixed(2)} | 
                        Date: ${stock.date} | 
                        Total: cedis ${itemTotal.toFixed(2)}
                    </span>
                </div>
                <div class="stock-actions">
                    <button class="action-button update-button">Update</button>
                    <button class="action-button delete-button">Delete</button>
                </div>
            `;

            stockListItem.querySelector('.update-button').addEventListener('click', () => this.handleUpdateStock(index));
            stockListItem.querySelector('.delete-button').addEventListener('click', () => this.handleDeleteStock(index));
            
            stockList.appendChild(stockListItem);
        });
    }

    static handleUpdateStock(index) {
        const stock = this.stockManager.stocks[index];
        
        const newAmount = prompt("Enter new amount:", stock.amount);
        const newPrice = prompt("Enter new price:", stock.price);
        const newDate = prompt("Enter new date (YYYY-MM-DD):", stock.date);

        if (newAmount !== null && newPrice !== null && newDate !== null) {
            try {
                const amount = parseInt(newAmount);
                const price = parseFloat(newPrice);
                
                if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
                if (isNaN(price) || price <= 0) throw new Error("Invalid price");
                if (!newDate) throw new Error("Date is required");

                this.stockManager.updateStock(index, {
                    name: stock.name,
                    amount: amount,
                    price: price,
                    date: newDate
                });

                this.renderStockList();
                this.updateStockDisplays();
            } catch (error) {
                alert(error.message);
            }
        }
    }

    static handleDeleteStock(index) {
        if (confirm("Are you sure you want to delete this stock?")) {
            this.stockManager.deleteStock(index);
            this.renderStockList();
            this.updateStockDisplays();
        }
    }

    static initSalesForm() {
        const salesForm = document.getElementById('salesForm');
        if (!salesForm) return;

        salesForm.addEventListener('submit', (event) => {
            event.preventDefault();

            try {
                const stockName = document.getElementById('stockName').value.trim();
                const quantity = parseInt(document.getElementById('quantity').value);
                const price = parseFloat(document.getElementById('price').value);

                if (!stockName || isNaN(quantity) || quantity <= 0) {
                    throw new Error("Please enter valid stock name and quantity");
                }

                if (isNaN(price) || price <= 0) {
                    throw new Error("Please enter a valid price");
                }

                this.salesManager.addSale({ stockName, quantity, price });
                this.addSaleToList(stockName, quantity, price);
                salesForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    static loadSales() {
        const salesList = document.getElementById('salesList');
        if (!salesList) return;

        this.salesManager.sales.forEach(sale => {
            this.addSaleToList(sale.stockName, sale.quantity, sale.price);
        });
    }

    static addSaleToList(stockName, quantity, price) {
        const salesList = document.getElementById('salesList');
        const totalSalesSpan = document.getElementById('totalSales');
        if (!salesList || !totalSalesSpan) return;

        const total = quantity * price;
        const newListItem = document.createElement('li');
        
        newListItem.innerHTML = `
            ${stockName}: Quantity ${quantity}, Price cedis ${price.toFixed(2)}, Total cedis ${total.toFixed(2)}
            <button class="deleteBtn">Delete</button>
        `;
        
        salesList.appendChild(newListItem);
        totalSalesSpan.textContent = this.salesManager.totalSales.toFixed(2);

        newListItem.querySelector('.deleteBtn').addEventListener('click', () => {
            this.deleteSale(stockName, quantity, price, newListItem);
        });
    }

    static deleteSale(stockName, quantity, price, listItem) {
        const salesList = document.getElementById('salesList');
        const totalSalesSpan = document.getElementById('totalSales');
        if (!salesList || !totalSalesSpan) return;

        const index = this.salesManager.sales.findIndex(sale => 
            sale.stockName === stockName && 
            sale.quantity === quantity && 
            sale.price === price
        );

        if (index !== -1) {
            this.salesManager.deleteSale(index);
            salesList.removeChild(listItem);
            totalSalesSpan.textContent = this.salesManager.totalSales.toFixed(2);
        }
    }

    static initPrintButton() {
        const printBtn = document.getElementById('print-btn');
        if (!printBtn) return;

        printBtn.addEventListener('click', () => {
            // Generate PDF content
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.text('Stock Report', 105, 15, { align: 'center' });
            
            // Add date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
            
            // Add table headers
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Name', 15, 35);
            doc.text('Quantity', 60, 35);
            doc.text('Price (cedis)', 90, 35);
            doc.text('Date', 125, 35);
            doc.text('Total (cedis)', 160, 35);
            
            // Add stock items
            doc.setFont(undefined, 'normal');
            let y = 45;
            this.stockManager.stocks.forEach(stock => {
                const itemTotal = (stock.price * stock.amount) || 0;
                
                doc.text(stock.name, 15, y);
                doc.text(stock.amount.toString(), 60, y);
                doc.text(`cedis ${stock.price.toFixed(2)}`, 90, y);
                doc.text(stock.date, 125, y);
                doc.text(`cedis ${itemTotal.toFixed(2)}`, 160, y);
                
                y += 10;
                
                // Add new page if we're running out of space
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
            });
            
            // Add totals
            doc.setFont(undefined, 'bold');
            y += 15;
            doc.text(`Total Stocks: ${this.stockManager.totalStocks}`, 15, y);
            doc.text(`Total Value: cedis ${this.stockManager.totalStockValue.toFixed(2)}`, 120, y);
            
            // Save the PDF
            doc.save(`Stock_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    }

    static initBackButton() {
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load jsPDF library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
        UIController.init();
    };
    document.head.appendChild(script);
});