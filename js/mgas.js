// MGA Management
class MGAsManager {
    constructor() {
        this.mgas = [];
        this.editingMGA = null;
    }

    async loadMGAs() {
        try {
            this.mgas = await window.db.getMGAs();
            this.renderMGAsTable();
        } catch (error) {
            console.error('Error loading MGAs:', error);
            window.app.showNotification('Error loading MGAs', 'error');
        }
    }

    renderMGAsTable() {
        const tbody = document.getElementById('mgasTableBody');
        if (!tbody) return;
        
        if (this.mgas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                            <svg style="width: 3rem; height: 3rem; margin-bottom: 1rem; color: var(--gray-300);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <h3>No MGAs found</h3>
                            <p>Start by adding your first MGA</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.mgas.map(mga => `
            <tr>
                <td><strong>${mga.name}</strong></td>
                <td>${mga.code}</td>
                <td>${mga.contactPerson}</td>
                <td>${mga.email}</td>
                <td>${mga.phone}</td>
                <td>${mga.city}, ${mga.state}</td>
                <td>
                    <span class="status-badge ${mga.isActive ? 'active' : 'cancelled'}">
                        ${mga.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="window.mgasManager.editMGA('${mga.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" onclick="window.mgasManager.deleteMGA('${mga.id}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openMGAModal(mgaId = null) {
        this.editingMGA = mgaId ? this.mgas.find(m => m.id === mgaId) : null;
        
        const modal = document.getElementById('mgaModal');
        const title = document.getElementById('mgaModalTitle');
        const submitText = document.getElementById('mgaSubmitText');
        const form = document.getElementById('mgaForm');
        
        title.textContent = this.editingMGA ? 'Edit MGA' : 'Add New MGA';
        submitText.textContent = this.editingMGA ? 'Update MGA' : 'Create MGA';
        
        if (this.editingMGA) {
            this.populateMGAForm(this.editingMGA);
        } else {
            form.reset();
        }
        
        modal.classList.add('active');
    }

    closeMGAModal() {
        const modal = document.getElementById('mgaModal');
        modal.classList.remove('active');
        this.editingMGA = null;
    }

    populateMGAForm(mga) {
        document.getElementById('mgaName').value = mga.name;
        document.getElementById('mgaCode').value = mga.code;
        document.getElementById('contactPerson').value = mga.contactPerson;
        document.getElementById('mgaEmail').value = mga.email;
        document.getElementById('mgaPhone').value = mga.phone;
        document.getElementById('mgaAddress').value = mga.address;
        document.getElementById('mgaCity').value = mga.city;
        document.getElementById('mgaState').value = mga.state;
        document.getElementById('mgaZipCode').value = mga.zipCode;
    }

    async saveMGA(formData) {
        try {
            const mgaData = {
                name: formData.get('name'),
                code: formData.get('code'),
                contactPerson: formData.get('contactPerson'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode')
            };

            if (this.editingMGA) {
                await window.db.updateMGA(this.editingMGA.id, mgaData);
                window.app.showNotification('MGA updated successfully');
            } else {
                await window.db.createMGA(mgaData);
                window.app.showNotification('MGA created successfully');
            }

            this.closeMGAModal();
            await this.loadMGAs();
        } catch (error) {
            console.error('Error saving MGA:', error);
            window.app.showNotification('Error saving MGA', 'error');
        }
    }

    editMGA(mgaId) {
        this.openMGAModal(mgaId);
    }

    async deleteMGA(mgaId) {
        if (!confirm('Are you sure you want to delete this MGA?')) {
            return;
        }

        try {
            await window.db.deleteMGA(mgaId);
            window.app.showNotification('MGA deleted successfully');
            await this.loadMGAs();
        } catch (error) {
            console.error('Error deleting MGA:', error);
            window.app.showNotification('Error deleting MGA', 'error');
        }
    }
}

// Global functions
function openMGAModal() {
    window.mgasManager.openMGAModal();
}

function closeMGAModal() {
    window.mgasManager.closeMGAModal();
}

// MGA form submission
document.getElementById('mgaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await window.mgasManager.saveMGA(formData);
});

// Initialize MGAs manager
window.mgasManager = new MGAsManager();