// Bond Management
class BondsManager {
    constructor() {
        this.bonds = [];
        this.mgas = [];
        this.filteredBonds = [];
        this.editingBond = null;
    }

    async loadBonds() {
        try {
            this.bonds = await window.db.getBonds();
            this.mgas = await window.db.getMGAs();
            this.filterBonds();
            this.populateMGASelect();
        } catch (error) {
            console.error('Error loading bonds:', error);
            window.app.showNotification('Error loading bonds', 'error');
        }
    }

    filterBonds() {
        const searchTerm = document.getElementById('bondSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('bondStatusFilter')?.value || 'all';
        
        this.filteredBonds = this.bonds.filter(bond => {
            const matchesSearch = !searchTerm || 
                bond.bondNumber.toLowerCase().includes(searchTerm) ||
                bond.principal.toLowerCase().includes(searchTerm) ||
                bond.obligee.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusFilter === 'all' || bond.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        this.renderBondsTable();
    }

    renderBondsTable() {
        const tbody = document.getElementById('bondsTableBody');
        if (!tbody) return;
        
        if (this.filteredBonds.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                            <svg style="width: 3rem; height: 3rem; margin-bottom: 1rem; color: var(--gray-300);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <h3>No bonds found</h3>
                            <p>Try adjusting your search criteria</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.filteredBonds.map(bond => `
            <tr>
                <td><strong>${bond.bondNumber}</strong></td>
                <td>${bond.principal}</td>
                <td>${bond.obligee}</td>
                <td>$${bond.bondAmount.toLocaleString()}</td>
                <td>$${bond.premium.toLocaleString()}</td>
                <td>
                    <span class="status-badge ${bond.status}">${bond.status}</span>
                </td>
                <td>${this.getMGAName(bond.mgaId)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="window.bondsManager.editBond('${bond.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" onclick="window.bondsManager.deleteBond('${bond.id}')" title="Delete">
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

    getMGAName(mgaId) {
        const mga = this.mgas.find(m => m.id === mgaId);
        return mga ? mga.name : 'Unknown MGA';
    }

    populateMGASelect() {
        const select = document.getElementById('mgaSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select MGA</option>' +
            this.mgas.map(mga => `<option value="${mga.id}">${mga.name}</option>`).join('');
    }

    openBondModal(bondId = null) {
        this.editingBond = bondId ? this.bonds.find(b => b.id === bondId) : null;
        
        const modal = document.getElementById('bondModal');
        const title = document.getElementById('bondModalTitle');
        const submitText = document.getElementById('bondSubmitText');
        const form = document.getElementById('bondForm');
        
        title.textContent = this.editingBond ? 'Edit Bond' : 'Add New Bond';
        submitText.textContent = this.editingBond ? 'Update Bond' : 'Create Bond';
        
        if (this.editingBond) {
            this.populateBondForm(this.editingBond);
        } else {
            form.reset();
        }
        
        modal.classList.add('active');
    }

    closeBondModal() {
        const modal = document.getElementById('bondModal');
        modal.classList.remove('active');
        this.editingBond = null;
    }

    populateBondForm(bond) {
        document.getElementById('bondNumber').value = bond.bondNumber;
        document.getElementById('mgaSelect').value = bond.mgaId;
        document.getElementById('principal').value = bond.principal;
        document.getElementById('obligee').value = bond.obligee;
        document.getElementById('bondAmount').value = bond.bondAmount;
        document.getElementById('premium').value = bond.premium;
        document.getElementById('effectiveDate').value = bond.effectiveDate;
        document.getElementById('expirationDate').value = bond.expirationDate;
        document.getElementById('bondStatus').value = bond.status;
    }

    async saveBond(formData) {
        try {
            const bondData = {
                bondNumber: formData.get('bondNumber'),
                mgaId: formData.get('mgaId'),
                principal: formData.get('principal'),
                obligee: formData.get('obligee'),
                bondAmount: parseFloat(formData.get('bondAmount')),
                premium: parseFloat(formData.get('premium')),
                effectiveDate: formData.get('effectiveDate'),
                expirationDate: formData.get('expirationDate'),
                status: formData.get('status')
            };

            if (this.editingBond) {
                await window.db.updateBond(this.editingBond.id, bondData);
                window.app.showNotification('Bond updated successfully');
            } else {
                await window.db.createBond(bondData);
                window.app.showNotification('Bond created successfully');
            }

            this.closeBondModal();
            await this.loadBonds();
        } catch (error) {
            console.error('Error saving bond:', error);
            window.app.showNotification('Error saving bond', 'error');
        }
    }

    editBond(bondId) {
        this.openBondModal(bondId);
    }

    async deleteBond(bondId) {
        if (!confirm('Are you sure you want to delete this bond?')) {
            return;
        }

        try {
            await window.db.deleteBond(bondId);
            window.app.showNotification('Bond deleted successfully');
            await this.loadBonds();
        } catch (error) {
            console.error('Error deleting bond:', error);
            window.app.showNotification('Error deleting bond', 'error');
        }
    }
}

// Global functions
function openBondModal() {
    window.bondsManager.openBondModal();
}

function closeBondModal() {
    window.bondsManager.closeBondModal();
}

function filterBonds() {
    window.bondsManager.filterBonds();
}

// Bond form submission
document.getElementById('bondForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await window.bondsManager.saveBond(formData);
});

// Initialize bonds manager
window.bondsManager = new BondsManager();