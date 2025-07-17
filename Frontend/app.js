
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        addSweetForm: document.getElementById('addSweetForm'),
        sweetsTableBody: document.getElementById('sweetsTableBody'),
        searchName: document.getElementById('searchName'),
        searchCategory: document.getElementById('searchCategory'),
        minPrice: document.getElementById('minPrice'),
        maxPrice: document.getElementById('maxPrice'),
        applyFilters: document.getElementById('applyFilters'),
        resetFilters: document.getElementById('resetFilters'),
        sortBy: document.getElementById('sortBy'),
        refreshBtn: document.getElementById('refreshBtn'),
        purchaseBtn: document.getElementById('purchaseBtn'),
        purchaseId: document.getElementById('purchaseId'),
        purchaseQty: document.getElementById('purchaseQty'),
        restockBtn: document.getElementById('restockBtn'),
        restockId: document.getElementById('restockId'),
        restockQty: document.getElementById('restockQty'),
        totalItems: document.getElementById('totalItems'),
        inStock: document.getElementById('inStock'),
        lowStock: document.getElementById('lowStock'),
        outOfStock: document.getElementById('outOfStock'),
        inventorySummary: document.getElementById('inventorySummary'),
        pagination: document.getElementById('pagination'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        sweetModal: new bootstrap.Modal(document.getElementById('sweetModal')),
        confirmationModal: new bootstrap.Modal(document.getElementById('confirmationModal'))
    };

    // State variables
    let currentPage = 1;
    const itemsPerPage = 5;
    let allSweets = [];
    let filteredSweets = [];

    // Initialize the application
    function init() {
        fetchAndDisplaySweets();
        setupEventListeners();
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Form submission
        elements.addSweetForm.addEventListener('submit', handleAddSweet);

        // Filter controls
        elements.applyFilters.addEventListener('click', applyFilters);
        elements.resetFilters.addEventListener('click', resetFilters);
        elements.sortBy.addEventListener('change', handleSortChange);
        elements.refreshBtn.addEventListener('click', fetchAndDisplaySweets);

        // Quick actions
        elements.purchaseBtn.addEventListener('click', handlePurchase);
        elements.restockBtn.addEventListener('click', handleRestock);

        // Search inputs (debounced)
        elements.searchName.addEventListener('input', debounce(applyFilters, 300));
    }

    // Fetch and display all sweets
    async function fetchAndDisplaySweets() {
        showLoading(true);
        try {
            const response = await fetch('http://localhost:3000/sweets');
            if (!response.ok) throw new Error('Failed to fetch sweets');
            
            allSweets = await response.json();
            filteredSweets = [...allSweets];
            
            updateStats(allSweets);
            renderSweetsTable();
            renderPagination();
            
            showAlert('Inventory updated successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error fetching sweets. Please try again.', 'danger');
        } finally {
            showLoading(false);
        }
    }

    // Render sweets table with pagination
    function renderSweetsTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedSweets = filteredSweets.slice(startIndex, startIndex + itemsPerPage);
        
        if (paginatedSweets.length === 0) {
            elements.sweetsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="bi bi-emoji-frown fs-1"></i>
                        <p class="mt-2">No sweets found</p>
                    </td>
                </tr>
            `;
            return;
        }

        elements.sweetsTableBody.innerHTML = '';
        
        paginatedSweets.forEach(sweet => {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            
            // Determine quantity class
            let quantityClass = '';
            if (sweet.quantity === 0) {
                quantityClass = 'quantity-low';
            } else if (sweet.quantity < 5) {
                quantityClass = 'quantity-medium';
            } else {
                quantityClass = 'quantity-high';
            }

            row.innerHTML = `
                <td>${sweet.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="category-badge me-2" style="background-color: ${getCategoryColor(sweet.category)}"></div>
                        ${sweet.name}
                    </div>
                </td>
                <td>${capitalizeFirstLetter(sweet.category)}</td>
                <td>$${sweet.price.toFixed(2)}</td>
                <td class="${quantityClass}">
                    ${sweet.quantity} 
                    ${sweet.quantity === 0 ? '<span class="badge bg-danger ms-2">Out of Stock</span>' : ''}
                    ${sweet.quantity > 0 && sweet.quantity < 5 ? '<span class="badge bg-warning text-dark ms-2">Low Stock</span>' : ''}
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1 view-btn" data-id="${sweet.id}" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${sweet.id}" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            // Add event listeners to action buttons
            row.querySelector('.view-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showSweetDetails(sweet);
            });
            
            row.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showDeleteConfirmation(sweet.id, sweet.name);
            });
            
            // Add click event to show details
            row.addEventListener('click', () => showSweetDetails(sweet));
            
            elements.sweetsTableBody.appendChild(row);
        });

        // Update inventory summary
        elements.inventorySummary.textContent = `Showing ${filteredSweets.length} item${filteredSweets.length !== 1 ? 's' : ''}`;
    }

    // Render pagination controls
    function renderPagination() {
        elements.pagination.innerHTML = '';
        const pageCount = Math.ceil(filteredSweets.length / itemsPerPage);
        
        if (pageCount <= 1) return;
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderSweetsTable();
            }
        });
        elements.pagination.appendChild(prevLi);
        
        // Page numbers
        for (let i = 1; i <= pageCount; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                renderSweetsTable();
            });
            elements.pagination.appendChild(pageLi);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === pageCount ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < pageCount) {
                currentPage++;
                renderSweetsTable();
            }
        });
        elements.pagination.appendChild(nextLi);
    }

    // Update statistics cards
    function updateStats(sweets) {
        elements.totalItems.textContent = sweets.length;
        
        const inStock = sweets.filter(s => s.quantity >= 5).length;
        const lowStock = sweets.filter(s => s.quantity > 0 && s.quantity < 5).length;
        const outOfStock = sweets.filter(s => s.quantity === 0).length;
        
        elements.inStock.textContent = inStock;
        elements.lowStock.textContent = lowStock;
        elements.outOfStock.textContent = outOfStock;
    }

    // Handle add sweet form submission
    async function handleAddSweet(e) {
        e.preventDefault();
        
        const sweet = {
            id: parseInt(elements.addSweetForm.sweetId.value),
            name: elements.addSweetForm.sweetName.value.trim(),
            category: elements.addSweetForm.sweetCategory.value,
            price: parseFloat(elements.addSweetForm.sweetPrice.value),
            quantity: parseInt(elements.addSweetForm.sweetQuantity.value)
        };
        
        // Validation
        if (isNaN(sweet.id) || isNaN(sweet.price) || isNaN(sweet.quantity)) {
            showAlert('Please enter valid numbers for ID, Price, and Quantity', 'danger');
            return;
        }
        
        if (sweet.price <= 0 || sweet.quantity < 0) {
            showAlert('Price and Quantity must be positive numbers', 'danger');
            return;
        }
        
        showLoading(true);
        try {
            const response = await fetch('http://localhost:3000/sweets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sweet)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add sweet');
            }
            
            const addedSweet = await response.json();
            elements.addSweetForm.reset();
            await fetchAndDisplaySweets();
            
            showAlert(`Sweet "${addedSweet.name}" added successfully!`, 'success');
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    // Apply filters to the sweets list
    function applyFilters() {
        const nameFilter = elements.searchName.value.toLowerCase();
        const categoryFilter = elements.searchCategory.value;
        const minPriceFilter = elements.minPrice.value ? parseFloat(elements.minPrice.value) : null;
        const maxPriceFilter = elements.maxPrice.value ? parseFloat(elements.maxPrice.value) : null;
        
        filteredSweets = allSweets.filter(sweet => {
            const nameMatch = !nameFilter || sweet.name.toLowerCase().includes(nameFilter);
            const categoryMatch = !categoryFilter || sweet.category === categoryFilter;
            const minPriceMatch = !minPriceFilter || sweet.price >= minPriceFilter;
            const maxPriceMatch = !maxPriceFilter || sweet.price <= maxPriceFilter;
            
            return nameMatch && categoryMatch && minPriceMatch && maxPriceMatch;
        });
        
        currentPage = 1;
        renderSweetsTable();
        renderPagination();
    }

    // Reset all filters
    function resetFilters() {
        elements.searchName.value = '';
        elements.searchCategory.value = '';
        elements.minPrice.value = '';
        elements.maxPrice.value = '';
        
        filteredSweets = [...allSweets];
        currentPage = 1;
        renderSweetsTable();
        renderPagination();
    }

    // Handle sort change
    function handleSortChange() {
        const sortValue = elements.sortBy.value;
        
        if (sortValue) {
            filteredSweets.sort((a, b) => {
                if (sortValue === 'name' || sortValue === 'category') {
                    return a[sortValue].localeCompare(b[sortValue]);
                } else {
                    return a[sortValue] - b[sortValue];
                }
            });
        } else {
            filteredSweets = [...allSweets];
        }
        
        currentPage = 1;
        renderSweetsTable();
        renderPagination();
    }

    // Show sweet details in modal
    function showSweetDetails(sweet) {
        document.getElementById('sweetModalTitle').textContent = sweet.name;
        
        const categoryColor = getCategoryColor(sweet.category);
        
        const details = `
            <div class="row">
                <div class="col-md-4">
                    <div class="category-icon mb-3" style="background-color: ${categoryColor}">
                        <i class="bi ${getCategoryIcon(sweet.category)}"></i>
                    </div>
                </div>
                <div class="col-md-8">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between">
                            <span class="fw-bold">ID:</span>
                            <span>${sweet.id}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span class="fw-bold">Category:</span>
                            <span>${capitalizeFirstLetter(sweet.category)}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span class="fw-bold">Price:</span>
                            <span>$${sweet.price.toFixed(2)}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span class="fw-bold">Quantity in Stock:</span>
                            <span class="${sweet.quantity < 5 ? sweet.quantity === 0 ? 'text-danger' : 'text-warning' : 'text-success'}">
                                ${sweet.quantity}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        
        document.getElementById('sweetModalBody').innerHTML = details;
        elements.sweetModal.show();
    }

    // Show delete confirmation modal
    function showDeleteConfirmation(id, name) {
        document.getElementById('confirmationModalTitle').textContent = `Delete ${name}`;
        document.getElementById('confirmationModalBody').innerHTML = `
            <p>Are you sure you want to delete <strong>${name}</strong>?</p>
            <p class="text-danger">This action cannot be undone.</p>
        `;
        
        const confirmBtn = document.getElementById('confirmActionBtn');
        confirmBtn.textContent = 'Delete';
        confirmBtn.className = 'btn btn-danger';
        
        // Remove previous event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', async () => {
            elements.confirmationModal.hide();
            await deleteSweet(id);
        });
        
        elements.confirmationModal.show();
    }

    // Delete a sweet
    async function deleteSweet(id) {
        showLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/sweets/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete sweet');
            
            await fetchAndDisplaySweets();
            showAlert('Sweet deleted successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    // Handle purchase action
    async function handlePurchase() {
        const id = elements.purchaseId.value;
        const quantity = elements.purchaseQty.value || 1;
        
        if (!id) {
            showAlert('Please enter a Sweet ID', 'warning');
            return;
        }
        
        showLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/sweets/${id}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: parseInt(quantity) })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Purchase failed');
            }
            
            await fetchAndDisplaySweets();
            elements.purchaseId.value = '';
            elements.purchaseQty.value = 1;
            
            showAlert('Purchase successful!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    // Handle restock action
    async function handleRestock() {
        const id = elements.restockId.value;
        const quantity = elements.restockQty.value || 1;
        
        if (!id) {
            showAlert('Please enter a Sweet ID', 'warning');
            return;
        }
        
        showLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/sweets/${id}/restock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: parseInt(quantity) })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Restock failed');
            }
            
            await fetchAndDisplaySweets();
            elements.restockId.value = '';
            elements.restockQty.value = 1;
            
            showAlert('Restock successful!', 'success');
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }

    // Helper functions
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getCategoryColor(category) {
        const colors = {
            chocolate: '#6a11cb',
            candy: '#ff7675',
            pastry: '#fdcb6e',
            biscuit: '#a29bfe',
            other: '#00b894'
        };
        return colors[category] || '#6c757d';
    }

    function getCategoryIcon(category) {
        const icons = {
            chocolate: 'bi-cup-straw',
            candy: 'bi-candy',
            pastry: 'bi-cake',
            biscuit: 'bi-cookie',
            other: 'bi-gift'
        };
        return icons[category] || 'bi-box-seam';
    }

    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'danger' ? 'bi-exclamation-triangle' : 'bi-info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 3000);
    }

    function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        // Use classList to toggle visibility instead of inline styles
        if (show) {
            spinner.classList.add('d-flex');
            spinner.classList.remove('d-none');
        } else {
            spinner.classList.add('d-none');
            spinner.classList.remove('d-flex');
        }
    }
}

    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // Initialize the application
    init();
});