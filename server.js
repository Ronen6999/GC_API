// server.js
import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import noticeStorage from "./storage.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Function to find new notices by comparing current with saved
function findNewNotices(currentNotices, savedNotices) {
    const newNotices = [];

    for (const currentNotice of currentNotices) {
        const isNew = !savedNotices.some(savedNotice =>
            savedNotice.title === currentNotice.title &&
            savedNotice.link === currentNotice.link
        );

        if (isNew) {
            newNotices.push(currentNotice);
        }
    }

    return newNotices;
}

// Main notices endpoint
app.get("/api/notices", async (req, res) => {
    try {
        const url = "https://gurucharancollege.ac.in";
        const { data: html } = await axios.get(url);

        const $ = cheerio.load(html);
        const currentNotices = [];

        $("ul.list-group li").each((_, li) => {
            const title = $(li).find("strong").text().trim() || $(li).text().trim();
            const href = $(li).find("a").attr("href");

            if (title && href) {
                currentNotices.push({
                    title,
                    link: new URL(href, url).href,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Get saved notices from storage
        const savedNotices = await noticeStorage.getAllNotices();

        // Find new notices
        const newNotices = findNewNotices(currentNotices, savedNotices);

        // If there are new notices, add them to storage
        if (newNotices.length > 0) {
            await noticeStorage.addNotices(newNotices);
        }

        // Get updated stats from storage
        const savedCount = await noticeStorage.getNoticeCount();
        const lastUpdate = await noticeStorage.getLastUpdateTime();

        // Prepare response
        const response = {
            status: "success",
            total_count: currentNotices.length,
            saved_count: savedCount,
            new_count: newNotices.length,
            has_updates: newNotices.length > 0,
            last_update: lastUpdate,
            message: newNotices.length > 0
                ? `Found ${newNotices.length} new notification(s)`
                : "No new updates available",
            data: newNotices.length > 0 ? newNotices : []
        };

        res.json(response);

    } catch (err) {
        console.error("Scraping error:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// Get all saved notices
app.get("/api/notices/all", async (req, res) => {
    try {
        const savedNotices = await noticeStorage.getAllNotices();
        const lastUpdate = await noticeStorage.getLastUpdateTime();

        res.json({
            status: "success",
            count: savedNotices.length,
            last_update: lastUpdate,
            data: savedNotices
        });
    } catch (err) {
        console.error("Error reading saved notices:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// Reset saved data
app.post("/api/notices/reset", async (req, res) => {
    try {
        const deletedCount = await noticeStorage.clearAllNotices();
        res.json({
            status: "success",
            message: `Cleared ${deletedCount} notices from storage`
        });
    } catch (err) {
        console.error("Error resetting notices:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// Storage stats endpoint
app.get("/api/stats", async (req, res) => {
    try {
        const storageInfo = await noticeStorage.getStorageInfo();

        res.json({
            status: "success",
            total_notices: storageInfo.noticeCount,
            last_update: storageInfo.lastUpdate,
            storage_file: "notices_data.json",
            storage_version: storageInfo.version
        });
    } catch (err) {
        console.error("Error getting stats:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// Backup endpoint
app.post("/api/backup", async (req, res) => {
    try {
        const backupFile = await noticeStorage.backup();
        res.json({
            status: "success",
            message: "Backup created successfully",
            backup_file: backupFile
        });
    } catch (err) {
        console.error("Error creating backup:", err);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const count = await noticeStorage.getNoticeCount();
        const storageInfo = await noticeStorage.getStorageInfo();

        res.json({
            status: "success",
            message: "API is running",
            timestamp: new Date().toISOString(),
            saved_notices_count: count,
            storage_status: "connected",
            storage_file: storageInfo.file
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Storage connection failed",
            error: err.message
        });
    }
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Guru Charan College Notices API",
        version: "2.1.0",
        features: [
            "Web scraping with change detection",
            "JSON file-based persistent storage",
            "RESTful API endpoints",
            "Automatic backup functionality"
        ],
        endpoints: {
            "GET /api/notices": "Get new notices",
            "GET /api/notices/all": "Get all saved notices",
            "POST /api/notices/reset": "Reset saved data",
            "GET /api/stats": "Storage statistics",
            "POST /api/backup": "Create backup",
            "GET /api/health": "Health check"
        },
        status: "running"
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
        console.log(`📝 API endpoints:`);
        console.log(`   GET  /api/notices - Get new notices`);
        console.log(`   GET  /api/notices/all - Get all saved notices`);
        console.log(`   POST /api/notices/reset - Reset saved data`);
        console.log(`   GET  /api/stats - Storage statistics`);
        console.log(`   POST /api/backup - Create backup`);
        console.log(`   GET  /api/health - Health check`);
        console.log(`📊 Storage: notices_data.json`);
    });
}

// Export for Vercel
export default app;
