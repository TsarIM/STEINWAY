import { safeRedisOperation, isRedisConnected } from '../db/redisClient.js';

const generateCacheKey = (req) => {
    const userId = req.user?.userId || 'anonymous';
    const path = req.path;
    const query = JSON.stringify(req.query);
    return `api_cache:${req.baseUrl}${path}:${userId}:${query}`;
};

export const cacheMiddleware = (ttl = 300) => { 
    return async (req, res, next) => {

        if(req.method !== 'GET'){
            return next();
        }

        if(!isRedisConnected){
            return next();
        }

        try{
            const cacheKey = generateCacheKey(req);
            const cachedData = await safeRedisOperation(
                async (client) => await client.get(cacheKey),
                null
            );

            if(cachedData){
                console.log(`Cache hit for key: ${cacheKey}`);
                return res.json(JSON.parse(cachedData));
            }

            console.log(`Cache miss for key: ${cacheKey}`);
            const originalJson = res.json;

            res.json = function(data){
                if(req.method === 'GET' && res.statusCode >= 200 && res.statusCode < 300){
                    safeRedisOperation(
                        async (client) => await client.setEx(cacheKey, ttl, JSON.stringify(data)),
                        null
                    ).catch(err => console.error('Cache set error:', err.message));
                }
                return originalJson.call(this, data);
            };
            next();
        }catch(error){
            console.error('Cache middleware error:', error.message);
            next();
        }
    };
};

export const invalidateCache = async (patterns) => {
    if(!isRedisConnected){
        console.log('Redis not available - skipping cache invalidation');
        return;
    }

    try{
        for(const pattern of patterns){
            const keys = await safeRedisOperation(
                async (client) => await client.keys(pattern),
                []
            );
            if(keys && keys.length > 0){
                await safeRedisOperation(
                    async (client) => await client.del(keys),
                    null
                );
                console.log(`Invalidated ${keys.length} cache entries for pattern: ${pattern}`);
            }
        }
    }catch (error){
        console.error('Cache invalidation error:', error.message);
    }
};

export const invalidateUserCache = async (userId) => {
    // const patterns = [
    //     `api_cache:/api/recordings/:${userId}:*`,
    //     `api_cache:/api/recordings/public:*:*`,
    //     `api_cache:/api/users/profile:${userId}:*`
    // ];
    const patterns = [
        `api_cache:/api/recordings/:${userId}:*`
    ];
    await invalidateCache(patterns);
};

export const invalidatePublicCache = async () => {
    const patterns = [
        `api_cache:/api/recordings/public:*:*`
    ];
    await invalidateCache(patterns);
};

export const invalidateProfileCache = async (userId) => {
    const patterns = [
        `api_cache:/api/users/profile:${userId}:*`,
        `api_cache:/api/recordings/public:*:*`,
        `api_cache:/api/recordings/:${userId}:*`
    ];
    await invalidateCache(patterns);
};
