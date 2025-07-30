# STEINWAY 🎹

Full-stack piano recorder app with React (TypeScript) frontend and Express + MongoDB + Redis backend.

## How to Run

```bash
# Clone the repo
git clone https://github.com/TsarIM/STEINWAY.git
cd STEINWAY

# --- Frontend ---
cd frontend
npm install
npm start

# --- Backend ---
cd ../backend
npm install

# Create .env file
PORT=5050
MONGO_URI=your_mongodb_uri
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=your_secret

npm start

# --- Redis (Mac) ---
brew install redis
brew services start redis
