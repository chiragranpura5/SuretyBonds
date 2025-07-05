// Main Application Controller
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.sidebarOpen = false;
        this.init();
    }

    init() {
        // Initialize event listeners
        this.initEventListeners();
        
        // Load initial data if authenticated
        if (window.auth.isAuthenticated()) {
            this.loadDashboardData();
        }
    }

    initEventListeners() {
        // Mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-menu-btn')) {
                this.toggleSidebar();
            }
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                this.sidebarOpen && 
                !e.target.closest('.sidebar') && 
                !e.target.closest('.mobile-menu-btn')) {
                this.toggleSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                this.sidebarOpen = false;
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('sidebar');
        
        if (this.sidebarOpen) {
            sidebar.classList.add('open');
        } else {
            sidebar.classList.remove('open');
        }
    }

    showPage(pageName) {
        // Update current page
        this.currentPage = pageName;
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        pageTitle.textContent = this.getPageTitle(pageName);
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });
        
        // Show page content
        document.querySelectorAll('.page-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${pageName}Content`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Load page-specific data
        this.loadPageData(pageName);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 1024 && this.sidebarOpen) {
            this.toggleSidebar();
        }
    }

    getPageTitle(pageName) {
        const titles = {
            dashboard: 'Dashboard',
            bonds: 'Bond Management',
            mgas: 'MGA Management',
            cases: 'Case Management',
            documents: 'Document Upload',
            bordereau: 'Bordereau Upload',
            contacts: 'Search Contacts',
            history: 'View History',
            users: 'User Management',
            audit: 'Audit Log',
            security: 'Security Management'
        };
        return titles[pageName] || 'Dashboard';
    }

    async loadPageData(pageName) {
        switch (pageName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'bonds':
                await window.bondsManager.loadBonds();
                break;
            case 'mgas':
                await window.mgasManager.loadMGAs();
                break;
            // Add other page loaders as needed
        }
    }

    async loadDashboardData() {
        try {
            const [bonds, cases, mgas, users] = await Promise.all([
                window.db.getBonds(),
                window.db.getCases(),
                window.db.getMGAs(),
                window.db.getUsers()
            ]);

            // Calculate statistics
            const activeBonds = bonds.filter(b => b.status === 'active');
            const openCases = cases.filter(c => c.status === 'open');
            const totalPremium = bonds.reduce((sum, bond) => sum + bond.premium, 0);

            const stats = {
                totalBonds: bonds.length,
                activeBonds: activeBonds.length,
                totalPremium: totalPremium,
                openCases: openCases.length,
                totalMGAs: mgas.length,
                totalUsers: users.length
            };

            this.renderStats(stats);
            this.renderRecentActivity(bonds, cases);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    renderStats(stats) {
        const statsGrid = document.getElementById('statsGrid');
        
        const statCards = [
            {
                title: 'Total Bonds',
                value: stats.totalBonds,
                icon: 'shield',
                color: 'blue'
            },
            {
                title: 'Active Bonds',
                value: stats.activeBonds,
                icon: 'trending-up',
                color: 'green'
            },
            {
                title: 'Total Premium',
                value: `$${stats.totalPremium.toLocaleString()}`,
                icon: 'dollar-sign',
                color: 'yellow'
            },
            {
                title: 'Open Cases',
                value: stats.openCases,
                icon: 'alert-circle',
                color: 'red'
            },
            {
                title: 'Total MGAs',
                value: stats.totalMGAs,
                icon: 'users',
                color: 'purple'
            },
            {
                title: 'Total Users',
                value: stats.totalUsers,
                icon: 'users',
                color: 'indigo'
            }
        ];

        statsGrid.innerHTML = statCards.map(card => `
            <div class="stat-card">
                <div class="stat-info">
                    <h3>${card.title}</h3>
                    <p>${card.value}</p>
                </div>
                <div class="stat-icon ${card.color}">
                    ${this.getIconSVG(card.icon)}
                </div>
            </div>
        `).join('');
    }

    renderRecentActivity(bonds, cases) {
        const activityList = document.getElementById('recentActivity');
        
        const activities = [
            ...bonds.slice(-3).map(b => ({
                type: 'bond',
                title: `Bond ${b.bondNumber} created`,
                time: b.createdAt,
                icon: 'shield'
            })),
            ...cases.slice(-3).map(c => ({
                type: 'case',
                title: `Case ${c.caseNumber} opened`,
                time: c.createdAt,
                icon: 'file-text'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        if (activities.length === 0) {
            activityList.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 2rem;">No recent activity</p>';
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    ${this.getIconSVG(activity.icon)}
                </div>
                <div class="activity-details">
                    <p>${activity.title}</p>
                    <span>${new Date(activity.time).toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }

    getIconSVG(iconName) {
        const icons = {
            'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>',
            'dollar-sign': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
            'alert-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>'
        };
        return icons[iconName] || icons['shield'];
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconMap = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon ${type}">
                    ${iconMap[type]}
                </div>
                <div class="notification-text">
                    <p>${message}</p>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Global functions for navigation
function showPage(pageName) {
    window.app.showPage(pageName);
}

function toggleSidebar() {
    window.app.toggleSidebar();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});