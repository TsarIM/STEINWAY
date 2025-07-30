# STEINWAY 🎹
Full-stack piano recorder app built with **React (TypeScript)** frontend and **Express + MongoDB + Redis** backend.

## Setup Instructions
```bash
git clone https://github.com/TsarIM/STEINWAY.git
cd STEINWAY

# Frontend
cd frontend
npx create-react-app . --template typescript
npm install react-router-dom @react-oauth/google
npm start

# Backend
cd ../backend
npm init -y
npm install express cors express-session dotenv
npm install mongodb redis
npm install jsonwebtoken multer

# Create .env file in backend
cat <<EOF > .env
PORT=5050
MONGO_URI=your_mongodb_connection_string
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=your_secret_key
EOF

npm start

# Redis (Mac)
brew install redis
brew services start redis   # Start Redis
brew services stop redis    # Stop Redis
