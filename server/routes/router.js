import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";
import { authenticateToken } from "../middleware/auth.js";
import { cacheMiddleware, invalidateUserCache, invalidatePublicCache } from "../middleware/cache.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {

  const { title, notes, isPublic = false } = req.body;
  
  if(!title || !Array.isArray(notes)){
    return res.status(400).json({ error: "Invalid payload" });
  }

  const newRecording = {
    title,
    notes,
    isPublic,
    userId: new ObjectId(req.user.userId),
    createdAt: new Date().toISOString(),
  };

  try{
    const collection = db.collection("recordings");
    const result = await collection.insertOne(newRecording);
    
    await invalidateUserCache(req.user.userId);
    if(isPublic){
      await invalidatePublicCache();
    }
    res.status(201).json({ insertedId: result.insertedId });

  }catch(error){
    console.error("Error saving recording:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/', authenticateToken, cacheMiddleware(600), async (req, res) => {
  try{
    const collection = db.collection("recordings");
    const results = await collection.find({
      userId: new ObjectId(req.user.userId)
    }).toArray();
    
    res.status(200).json(results);
  }catch(error){
    console.error("Error fetching recordings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/public', cacheMiddleware(600), async (req, res) => { 
  try{
    const collection = db.collection("recordings");
    const results = await collection.aggregate([
      { $match: { isPublic: true } },
      { $sort: { createdAt: -1 } },
      { $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }},
      { $unwind: "$user" },
      { $project: {
        title: 1,
        notes: 1,
        createdAt: 1,
        "user.username": 1,
        "user.name": 1,
        "user.profileImage": 1
      }}
    ]).toArray();
    
    res.status(200).json(results);
  }catch(error){
    console.error("Error fetching public recordings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try{
    const { isPublic } = req.body;
    const collection = db.collection("recordings");
    
    const existingRecording = await collection.findOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.user.userId)
    });

    if(!existingRecording){
      return res.status(404).json({ error: "Recording not found" });
    }

    const result = await collection.updateOne(
      {
        _id: new ObjectId(req.params.id),
        userId: new ObjectId(req.user.userId)
      },
      { $set: { isPublic } }
    );

    if(result.matchedCount === 0){
      return res.status(404).json({ error: "Recording not found" });
    }

    await invalidateUserCache(req.user.userId);

    if(existingRecording.isPublic || isPublic){
      await invalidatePublicCache();
    }

    console.log(`Recording ${req.params.id} updated: isPublic=${isPublic}`);
    res.json({ message: "Recording updated successfully" });

  }catch(error){
    console.error("Error updating recording:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try{
    const collection = db.collection("recordings");
    
    const existingRecording = await collection.findOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.user.userId)
    });

    if(!existingRecording){
      return res.status(404).json({ error: "Recording not found" });
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.user.userId)
    });

    if(result.deletedCount === 0){
      return res.status(404).json({ error: "Recording not found" });
    }

    await invalidateUserCache(req.user.userId);
    if(existingRecording.isPublic){
      await invalidatePublicCache();
    }

    console.log(`Recording ${req.params.id} deleted successfully`);
    res.json({ message: "Recording deleted successfully" });

  }catch(error){
    console.error("Error deleting recording:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
