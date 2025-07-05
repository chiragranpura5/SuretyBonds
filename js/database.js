// SQLite Database Implementation
class Database {
    constructor() {
        this.dbName = 'suretyapp.db';
        this.init();
    }

    async init() {
        // Initialize sample data if not exists
        if (!localStorage.getItem('suretyapp_initialized')) {
            await this.initializeSampleData();
            localStorage.setItem('suretyapp_initialized', 'true');
        }
    }

    // Helper methods for localStorage (simulating SQLite)
    getTable(tableName) {
        try {
            const data = localStorage.getItem(`suretyapp_${tableName}`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${tableName}:`, error);
            return [];
        }
    }

    saveTable(tableName, data) {
        try {
            localStorage.setItem(`suretyapp_${tableName}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${tableName}:`, error);
            return false;
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Users
    async getUsers() {
        return this.getTable('users');
    }

    async createUser(userData) {
        const users = this.getTable('users');
        const newUser = {
            id: this.generateId(),
            ...userData,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        users.push(newUser);
        this.saveTable('users', users);
        return newUser;
    }

    async updateUser(id, updates) {
        const users = this.getTable('users');
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        
        users[index] = { ...users[index], ...updates };
        this.saveTable('users', users);
        return users[index];
    }

    async deleteUser(id) {
        const users = this.getTable('users');
        const filtered = users.filter(u => u.id !== id);
        this.saveTable('users', filtered);
        return filtered.length < users.length;
    }

    async getUserByEmail(email) {
        const users = this.getTable('users');
        return users.find(u => u.email === email && u.isActive);
    }

    // Bonds
    async getBonds() {
        return this.getTable('bonds');
    }

    async createBond(bondData) {
        const bonds = this.getTable('bonds');
        const newBond = {
            id: this.generateId(),
            ...bondData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        bonds.push(newBond);
        this.saveTable('bonds', bonds);
        return newBond;
    }

    async updateBond(id, updates) {
        const bonds = this.getTable('bonds');
        const index = bonds.findIndex(b => b.id === id);
        if (index === -1) return null;
        
        bonds[index] = { 
            ...bonds[index], 
            ...updates, 
            updatedAt: new Date().toISOString() 
        };
        this.saveTable('bonds', bonds);
        return bonds[index];
    }

    async deleteBond(id) {
        const bonds = this.getTable('bonds');
        const filtered = bonds.filter(b => b.id !== id);
        this.saveTable('bonds', filtered);
        return filtered.length < bonds.length;
    }

    // MGAs
    async getMGAs() {
        return this.getTable('mgas');
    }

    async createMGA(mgaData) {
        const mgas = this.getTable('mgas');
        const newMGA = {
            id: this.generateId(),
            ...mgaData,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        mgas.push(newMGA);
        this.saveTable('mgas', mgas);
        return newMGA;
    }

    async updateMGA(id, updates) {
        const mgas = this.getTable('mgas');
        const index = mgas.findIndex(m => m.id === id);
        if (index === -1) return null;
        
        mgas[index] = { ...mgas[index], ...updates };
        this.saveTable('mgas', mgas);
        return mgas[index];
    }

    async deleteMGA(id) {
        const mgas = this.getTable('mgas');
        const filtered = mgas.filter(m => m.id !== id);
        this.saveTable('mgas', filtered);
        return filtered.length < mgas.length;
    }

    // Cases
    async getCases() {
        return this.getTable('cases');
    }

    async createCase(caseData) {
        const cases = this.getTable('cases');
        const newCase = {
            id: this.generateId(),
            ...caseData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        cases.push(newCase);
        this.saveTable('cases', cases);
        return newCase;
    }

    // Documents
    async getDocuments() {
        return this.getTable('documents');
    }

    async createDocument(docData) {
        const documents = this.getTable('documents');
        const newDoc = {
            id: this.generateId(),
            ...docData,
            uploadedAt: new Date().toISOString()
        };
        documents.push(newDoc);
        this.saveTable('documents', documents);
        return newDoc;
    }

    // Audit Logs
    async getAuditLogs() {
        return this.getTable('auditLogs');
    }

    async createAuditLog(logData) {
        const logs = this.getTable('auditLogs');
        const newLog = {
            id: this.generateId(),
            ...logData,
            timestamp: new Date().toISOString()
        };
        logs.push(newLog);
        this.saveTable('auditLogs', logs);
        return newLog;
    }

    // Contacts
    async getContacts() {
        return this.getTable('contacts');
    }

    async createContact(contactData) {
        const contacts = this.getTable('contacts');
        const newContact = {
            id: this.generateId(),
            ...contactData,
            createdAt: new Date().toISOString()
        };
        contacts.push(newContact);
        this.saveTable('contacts', contacts);
        return newContact;
    }

    // Initialize sample data
    async initializeSampleData() {
        // Create sample users
        const users = [
            {
                email: 'admin@suretyapp.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                password: 'password' // In production, this would be hashed
            },
            {
                email: 'ops@suretyapp.com',
                firstName: 'Operations',
                lastName: 'Manager',
                role: 'ops',
                password: 'password'
            },
            {
                email: 'user@suretyapp.com',
                firstName: 'Regular',
                lastName: 'User',
                role: 'user',
                password: 'password'
            }
        ];

        for (const user of users) {
            await this.createUser(user);
        }

        // Create sample MGAs
        const mgas = [
            {
                name: 'Liberty Mutual',
                code: 'LM001',
                contactPerson: 'John Smith',
                email: 'john.smith@libertymutual.com',
                phone: '555-0123',
                address: '123 Insurance Way',
                city: 'Boston',
                state: 'MA',
                zipCode: '02101'
            },
            {
                name: 'Travelers Insurance',
                code: 'TI002',
                contactPerson: 'Jane Doe',
                email: 'jane.doe@travelers.com',
                phone: '555-0124',
                address: '456 Coverage Ave',
                city: 'Hartford',
                state: 'CT',
                zipCode: '06101'
            },
            {
                name: 'Zurich North America',
                code: 'ZNA003',
                contactPerson: 'Mike Johnson',
                email: 'mike.johnson@zurich.com',
                phone: '555-0125',
                address: '789 Surety Blvd',
                city: 'New York',
                state: 'NY',
                zipCode: '10001'
            }
        ];

        for (const mga of mgas) {
            await this.createMGA(mga);
        }

        // Create sample bonds
        const mgaList = await this.getMGAs();
        const bonds = [
            {
                bondNumber: 'SB-2024-001',
                principal: 'ABC Construction Co.',
                obligee: 'City of Springfield',
                bondAmount: 100000,
                premium: 2500,
                effectiveDate: '2024-01-01',
                expirationDate: '2024-12-31',
                status: 'active',
                mgaId: mgaList[0].id
            },
            {
                bondNumber: 'SB-2024-002',
                principal: 'XYZ Contractors',
                obligee: 'State of California',
                bondAmount: 250000,
                premium: 5000,
                effectiveDate: '2024-02-01',
                expirationDate: '2025-01-31',
                status: 'active',
                mgaId: mgaList[1].id
            },
            {
                bondNumber: 'SB-2024-003',
                principal: 'DEF Builders LLC',
                obligee: 'County of Orange',
                bondAmount: 75000,
                premium: 1875,
                effectiveDate: '2024-03-01',
                expirationDate: '2024-12-31',
                status: 'pending',
                mgaId: mgaList[2].id
            },
            {
                bondNumber: 'SB-2023-045',
                principal: 'GHI Development',
                obligee: 'City of Miami',
                bondAmount: 500000,
                premium: 12500,
                effectiveDate: '2023-06-01',
                expirationDate: '2023-12-31',
                status: 'expired',
                mgaId: mgaList[0].id
            }
        ];

        for (const bond of bonds) {
            await this.createBond(bond);
        }

        // Create sample cases
        const bondList = await this.getBonds();
        const cases = [
            {
                caseNumber: 'CASE-2024-001',
                bondId: bondList[0].id,
                title: 'Payment Dispute',
                description: 'Principal claims payment was made but obligee disputes',
                status: 'open',
                priority: 'high',
                assignedTo: 'ops@suretyapp.com'
            },
            {
                caseNumber: 'CASE-2024-002',
                bondId: bondList[1].id,
                title: 'Performance Issue',
                description: 'Work not completed according to specifications',
                status: 'pending',
                priority: 'medium',
                assignedTo: 'admin@suretyapp.com'
            }
        ];

        for (const caseData of cases) {
            await this.createCase(caseData);
        }

        console.log('Sample data initialized successfully');
    }
}

// Create global database instance
window.db = new Database();