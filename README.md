Here’s a **clean and minimal README.md** tailored to your `STEINWAY` repo:

````markdown
# STEINWAY 🎹

Full-stack piano recorder app built with **React (TypeScript)** frontend and **Express + MongoDB + Redis** backend.

---

## 🚀 Setup Instructions

### 1. Clone the Repo
```bash
git clone https://github.com/TsarIM/STEINWAY.git
cd STEINWAY
````

### 2. Frontend

```bash
cd frontend
npx create-react-app . --template typescript
npm install react-router-dom @react-oauth/google
npm start
```

### 3. Backend

```bash
cd backend
npm init -y
npm install express cors express-session dotenv
npm install mongodb redis
npm install jsonwebtoken multer
npm start
```

### 4. Redis (Mac)

```bash
brew install redis
brew services start redis   # start
brew services stop redis    # stop
```

### 5. MongoDB

* Use MongoDB locally or [MongoDB Atlas](https://www.mongodb.com/atlas).
* Add `.env` file in `backend`:

```env
PORT=5050
MONGO_URI=your_mongo_uri
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=your_secret
```

### 6. Run the App

* Start Redis
* Start MongoDB
* Run backend: `npm start`
* Run frontend: `npm start`

Open: [http://localhost:3000](http://localhost:3000)

```

Do you want me to also add **basic folder structure (frontend/backend)** to show where each command should be run?
```
