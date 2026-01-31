export const INITIAL_MOCK_MESSAGES = [
  {
    id: "1",
    role: "user",
    content: "Can you review this Node.js middleware for an express app? I'm worried about the error handling.",
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    content: "I'd be happy to review that. Please provide the code snippet. In the meantime, remember that robust Express middleware should always catch synchronous errors and pass asynchronous errors to the `next()` function to avoid hanging the request.",
    timestamp: new Date(),
  },
  {
    id: "3",
    role: "user",
    content: "```javascript\nconst authMiddleware = (req, res, next) => {\n  try {\n    const token = req.headers.authorization;\n    if (!token) throw new Error('No token');\n    next();\n  } catch (err) {\n    res.status(401).json({ error: err.message });\n  }\n};\n```",
    timestamp: new Date(),
  },
  {
    id: "4",
    role: "assistant",
    content: "The logic is clean for synchronous execution. However, if you plan to verify the token against a database (asynchronous), you must wrap it in an `async` function and handle the promise rejection. Would you like me to refactor this into an async-safe version?",
    timestamp: new Date(),
  },
  {
    id: "5",
    role: "user",
    content: "Yes, please. Also, can you show me how I would integrate this with a Redis-based rate limiter? I want to make sure the error handling covers connection timeouts to Redis as well.",
    timestamp: new Date(),
  },
  {
    id: "6",
    role: "assistant",
    content: "Great requirement. For Redis, we should use a `try-catch-finally` block or a dedicated error handler to ensure the app doesn't crash if the cache is down (fail-open strategy). \n\n### Refactored Async Middleware\n\n```javascript\nconst authMiddleware = async (req, res, next) => {\n  try {\n    const token = req.headers.authorization;\n    if (!token) {\n      return res.status(401).json({ error: 'Authentication required' });\n    }\n\n    // Simulate Async Database/JWT Verification\n    const user = await verifyToken(token);\n    req.user = user;\n    \n    next();\n  } catch (err) {\n    // Ensure we pass the error to the global Express error handler\n    next(err);\n  }\n};\n```\n\n### Redis Rate Limiter Integration\nI recommend using `ioredis` for better Promise support. Here is how you can wrap the logic to handle timeouts gracefully:",
    timestamp: new Date(),
  },
  {
    id: "7",
    role: "assistant",
    content: "```javascript\nconst rateLimiter = async (req, res, next) => {\n  try {\n    const requests = await redis.incr(req.ip);\n    \n    if (requests === 1) {\n      await redis.expire(req.ip, 60);\n    }\n\n    if (requests > 100) {\n      return res.status(429).json({ error: 'Too many requests' });\n    }\n\n    next();\n  } catch (err) {\n    console.error('Redis Error:', err);\n    // Fail open: allow the request if Redis is down\n    next();\n  }\n};\n```",
    timestamp: new Date(),
  },
  {
    id: "8",
    role: "user",
    content: "That looks solid. One last thing: how do I test this middleware effectively using Vitest or Jest without actually spinning up a Redis instance?",
    timestamp: new Date(),
  },
  {
    id: "9",
    role: "assistant",
    content: "For testing, you should use **Dependency Injection** or a **Mocking Library**. Since you're using Node.js, `ioredis-mock` is a fantastic drop-in replacement for unit tests. \n\nWould you like me to generate a test suite using Vitest that mocks the Redis connection and verifies the 429 status code?",
    timestamp: new Date(),
  }
];