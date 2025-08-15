// storage.js
import fs from 'fs/promises';
import path from 'path';

class NoticeStorage {
    constructor() {
        this.dataFile = path.join(process.cwd(), 'notices_data.json');
        this.data = {
            notices: [],
            lastUpdate: null,
            version: '1.0.0'
        };
        this.init();
    }

    async init() {
        try {
            // Try to load existing data
            const fileContent = await fs.readFile(this.dataFile, 'utf8');
            this.data = JSON.parse(fileContent);
            console.log('✅ Storage loaded successfully!');
        } catch (error) {
            // If file doesn't exist or is invalid, start with empty data
            console.log('📝 Creating new storage file...');
            await this.saveData();
        }
    }

    async saveData() {
        try {
            await fs.writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('❌ Error saving data:', error);
        }
    }

    // Get all saved notices
    getAllNotices() {
        return this.data.notices || [];
    }

    // Check if a notice exists
    noticeExists(title, link) {
        return this.data.notices.some(notice =>
            notice.title === title && notice.link === link
        );
    }

    // Add a new notice
    async addNotice(notice) {
        if (!this.noticeExists(notice.title, notice.link)) {
            const newNotice = {
                id: this.data.notices.length + 1,
                ...notice,
                created_at: new Date().toISOString()
            };
            this.data.notices.push(newNotice);
            this.data.lastUpdate = new Date().toISOString();
            await this.saveData();
            return newNotice.id;
        }
        return null;
    }

    // Add multiple notices
    async addNotices(notices) {
        let addedCount = 0;
        for (const notice of notices) {
            if (!this.noticeExists(notice.title, notice.link)) {
                const newNotice = {
                    id: this.data.notices.length + 1,
                    ...notice,
                    created_at: new Date().toISOString()
                };
                this.data.notices.push(newNotice);
                addedCount++;
            }
        }

        if (addedCount > 0) {
            this.data.lastUpdate = new Date().toISOString();
            await this.saveData();
        }

        return addedCount;
    }

    // Get notice count
    getNoticeCount() {
        return this.data.notices.length;
    }

    // Get last update time
    getLastUpdateTime() {
        return this.data.lastUpdate;
    }

    // Clear all notices
    async clearAllNotices() {
        const count = this.data.notices.length;
        this.data.notices = [];
        this.data.lastUpdate = null;
        await this.saveData();
        return count;
    }

    // Get storage info
    getStorageInfo() {
        return {
            file: this.dataFile,
            noticeCount: this.data.notices.length,
            lastUpdate: this.data.lastUpdate,
            version: this.data.version
        };
    }

    // Backup data
    async backup() {
        const backupFile = path.join(process.cwd(), `notices_backup_${Date.now()}.json`);
        await fs.writeFile(backupFile, JSON.stringify(this.data, null, 2));
        return backupFile;
    }

    // Restore from backup
    async restore(backupFile) {
        try {
            const backupData = await fs.readFile(backupFile, 'utf8');
            this.data = JSON.parse(backupData);
            await this.saveData();
            return true;
        } catch (error) {
            console.error('❌ Error restoring backup:', error);
            return false;
        }
    }
}

// Create and export a singleton instance
const noticeStorage = new NoticeStorage();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Saving data before shutdown...');
    await noticeStorage.saveData();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Saving data before shutdown...');
    await noticeStorage.saveData();
    process.exit(0);
});

export default noticeStorage;