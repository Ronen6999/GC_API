# Guru Charan College Notices API

A Node.js API that scrapes notices from Guru Charan College website and provides change detection functionality with persistent JSON file storage.

## Features

- 🔍 **Web Scraping**: Extracts notices from the college website
- 🔄 **Change Detection**: Only returns new notifications
- 📊 **Persistent Storage**: JSON file-based storage for reliable data persistence
- 🚀 **Vercel Ready**: Optimized for serverless deployment
- 📈 **Health Monitoring**: Built-in health check and storage stats
- 🛡️ **Data Integrity**: Prevents duplicate entries with smart comparison
- 💾 **Backup System**: Automatic backup functionality

## Storage Schema

```json
{
  "notices": [
    {
      "id": 1,
      "title": "Notice Title",
      "link": "https://gurucharancollege.ac.in/notice.pdf",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "lastUpdate": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## API Endpoints

### 1. Get New Notices
```http
GET /api/notices
```

**Response:**
```json
{
  "status": "success",
  "total_count": 10,
  "saved_count": 8,
  "new_count": 2,
  "has_updates": true,
  "last_update": "2024-01-15T10:30:00.000Z",
  "message": "Found 2 new notification(s)",
  "data": [
    {
      "id": 1,
      "title": "New Notice Title",
      "link": "https://gurucharancollege.ac.in/notice.pdf",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Get All Saved Notices
```http
GET /api/notices/all
```

### 3. Reset Saved Data
```http
POST /api/notices/reset
```

### 4. Storage Statistics
```http
GET /api/stats
```

### 5. Create Backup
```http
POST /api/backup
```

### 6. Health Check
```http
GET /api/health
```

### 7. API Info
```http
GET /
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the API:**
   - Main endpoint: `http://localhost:3000/api/notices`
   - Health check: `http://localhost:3000/api/health`
   - Storage stats: `http://localhost:3000/api/stats`

## Storage Features

### ✅ **Persistent Storage**
- Data persists between server restarts
- JSON file: `notices_data.json`
- Automatic file creation and management

### 🔒 **Data Integrity**
- Smart duplicate detection by title and link
- Automatic data validation
- Graceful error handling

### 📊 **Performance**
- Fast in-memory operations
- Efficient file I/O
- Minimal resource usage

### 💾 **Backup System**
- Automatic backup creation
- Timestamped backup files
- Easy restore functionality

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm deployment settings

### Option 2: Using GitHub Integration

1. **Push your code to GitHub**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Deploy:**
   - Vercel will automatically deploy on every push to main branch

### Option 3: Direct Upload

1. **Zip your project files**
2. **Upload to Vercel dashboard**
3. **Deploy**

## Storage Management

### Local Storage Operations

```bash
# View storage file
ls -la notices_data.json

# Check file size
du -h notices_data.json

# View storage content
cat notices_data.json | jq '.'

# Get notice count
cat notices_data.json | jq '.notices | length'
```

### Backup Management

```bash
# Create backup via API
curl -X POST http://localhost:3000/api/backup

# Manual backup
cp notices_data.json notices_backup_$(date +%Y%m%d_%H%M%S).json

# Restore from backup
cp notices_backup_20240115_103000.json notices_data.json
```

## Important Notes

### ✅ **JSON Storage Advantages**
- **Zero Dependencies**: No native compilation required
- **Human Readable**: Easy to inspect and debug
- **Cross Platform**: Works on all operating systems
- **Lightweight**: Minimal resource usage
- **Portable**: Easy to backup and restore

### 🔄 **Serverless Considerations**
- **Read-only in production**: Vercel serverless functions are read-only
- **Local development**: Full read/write access locally
- **Alternative storage**: For production, consider:
  - **Vercel KV** (Redis)
  - **Vercel Postgres**
  - **MongoDB Atlas**
  - **Supabase**

### 📊 **Usage Recommendations**
- **Polling**: Check every 5-15 minutes for new notices
- **Backup**: Use `/api/backup` endpoint regularly
- **Monitoring**: Use `/api/stats` to monitor storage health
- **Rate Limiting**: Be mindful of the college website's resources

## Environment Variables

No environment variables are required for basic functionality. The API will work out of the box.

## Troubleshooting

### Common Issues

1. **Storage File Errors:**
   - Check file permissions for `notices_data.json`
   - Ensure write access to project directory
   - Delete corrupted file to start fresh

2. **Timeout Errors:**
   - Increase `maxDuration` in vercel.json
   - Optimize scraping logic

3. **Memory Issues:**
   - Monitor storage file size
   - Implement data cleanup if needed

4. **Duplicate Data:**
   - Storage handles duplicates automatically
   - Check comparison logic is working

### Support

If you encounter issues:
1. Check the health endpoint: `/api/health`
2. Check storage stats: `/api/stats`
3. Review Vercel function logs
4. Test locally first

## License

ISC License