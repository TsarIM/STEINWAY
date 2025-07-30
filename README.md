I see the problem now—you mean a **single markdown file with multiple code blocks inside it**, not multiple separate responses.

Here's the **fixed single `README.md`** (you copy once → paste once → fully formatted with multiple fenced blocks):

````markdown
# STEINWAY 🎹

Full-stack piano recorder app with React (TypeScript) frontend and Express + MongoDB + Redis backend.

---

## 1. Clone the Repository

```bash
git clone https://github.com/TsarIM/STEINWAY.git
cd STEINWAY
````

## 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 3. Backend Setup

```bash
cd ../backend
npm install
```

### Create `.env` in `backend/`

```env
PORT=5050
MONGO_URI=your_mongodb_uri
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=your_secret
```

### Start Backend

```bash
npm start
```

## 4. Redis Setup (Mac)

```bash
brew install redis
brew services start redis   # Start
brew services stop redis    # Stop
```

## 5. Run the App

* Start Redis
* Start MongoDB
* Run backend (`npm start` in backend folder)
* Run frontend (`npm start` in frontend folder)

Open: [http://localhost:3000](http://localhost:3000)

```

This is **one complete Markdown file** with multiple code blocks → paste this directly into your repo’s `README.md`.
```
