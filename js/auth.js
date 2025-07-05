// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check for saved session
        const savedUser = localStorage.getItem('suretyapp_currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        }
    }

    async login(email, password) {
        try {
            const user = await window.db.getUserByEmail(email);
            
            if (user && user.password === password) { // In production, compare hashed passwords
                this.currentUser = user;
                localStorage.setItem('suretyapp_currentUser', JSON.stringify(user));
                
                // Update last login
                await window.db.updateUser(user.id, {
                    lastLogin: new Date().toISOString()
                });
                
                this.updateUI();
                this.showMainApp();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('suretyapp_currentUser');
        this.showLoginPage();
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const rolePermissions = {
            admin: ['read', 'write', 'delete', 'manage_users', 'manage_mgas', 'audit'],
            ops: ['read', 'write', 'manage_bonds', 'manage_cases'],
            user: ['read']
        };
        
        return rolePermissions[this.currentUser.role]?.includes(permission) || false;
    }

    updateUI() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = 
                `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            document.getElementById('userRole').textContent = this.currentUser.role;
            document.getElementById('welcomeUserName').textContent = this.currentUser.firstName;
            
            // Update navigation based on permissions
            this.updateNavigation();
        }
    }

    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const page = link.dataset.page;
            const requiredPermissions = {
                'mgas': 'manage_mgas',
                'users': 'manage_users',
                'audit': 'audit',
                'security': 'manage_users'
            };
            
            if (requiredPermissions[page] && !this.hasPermission(requiredPermissions[page])) {
                link.parentElement.style.display = 'none';
            } else {
                link.parentElement.style.display = 'block';
            }
        });
    }

    showLoginPage() {
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('mainApp').classList.remove('active');
    }

    showMainApp() {
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('mainApp').classList.add('active');
        
        // Load dashboard by default
        window.app.showPage('dashboard');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const submitButton = e.target.querySelector('button[type="submit"]');
    const buttonText = document.getElementById('loginButtonText');
    const spinner = document.getElementById('loginSpinner');
    
    // Show loading state
    submitButton.disabled = true;
    buttonText.style.display = 'none';
    spinner.style.display = 'block';
    errorDiv.style.display = 'none';
    
    try {
        const success = await window.auth.login(email, password);
        
        if (!success) {
            errorDiv.textContent = 'Invalid credentials. Please try again.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'An error occurred during login. Please try again.';
        errorDiv.style.display = 'block';
    } finally {
        // Reset loading state
        submitButton.disabled = false;
        buttonText.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Logout function
function logout() {
    window.auth.logout();
}

// Create global auth instance
window.auth = new AuthManager();