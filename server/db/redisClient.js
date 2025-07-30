import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;
let isRedisConnected = false;

const initializeRedis = async () => {
  try{
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if(retries > 10){
            console.log('Redis: Max reconnection attempts reached');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
      isRedisConnected = true;
    });

    redisClient.on('disconnect', () => {
      console.log('Redis disconnected');
      isRedisConnected = false;
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    console.log('Continuing without Redis caching');
    redisClient = null;
    isRedisConnected = false;
  }
};

const safeRedisOperation = async (operation, fallback = null) => {
  if(!redisClient || !isRedisConnected){
    return fallback;
  }
  
  try{
    return await operation(redisClient);
  }catch(error){
    console.error('Redis operation failed:', error.message);
    return fallback;
  }
};

initializeRedis();

export { redisClient, isRedisConnected, safeRedisOperation };
export default redisClient;
