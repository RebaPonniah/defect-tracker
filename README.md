# Defect Tracker

A simple defect/bug ticket tracker with a Node.js + Express backend and MySQL database.

## Project Structure

```
defect-tracker/
├── server.js          # Express API server
├── schema.sql         # Database setup
├── package.json
├── .env.example       # Copy to .env and fill in your values
├── .gitignore
└── public/
    └── index.html     # Frontend UI
```

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up the database
```bash
# Run the schema against your MySQL instance
mysql -u root -p < schema.sql
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Open http://localhost:3001 in your browser.

---

## Deploy to Railway

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/defect-tracker
git push -u origin main
```

### 2. Create Railway project
1. Go to [railway.com](https://railway.com) → New Project → Deploy from GitHub repo
2. Select your repository → Deploy Now

### 3. Add MySQL database
1. In your Railway project canvas, click **New** → **Database** → **MySQL**
2. Railway provisions the database and exposes these variables automatically:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

### 4. Set environment variables
In your Node service → **Variables** tab, add:
```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
```

### 5. Run the schema on Railway
In your MySQL service on Railway, open the **Query** tab and paste the contents of `schema.sql`.

Railway will auto-deploy on every push to `main` from this point on.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tickets` | List all tickets. Query params: `status`, `priority`, `q` |
| POST | `/api/tickets` | Create a new ticket |
| PATCH | `/api/tickets/:id` | Update a ticket |
| DELETE | `/api/tickets/:id` | Delete a ticket |
