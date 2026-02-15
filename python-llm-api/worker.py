import os
import asyncio
import json
import redis.asyncio as redis
from services.inference import InferenceService
from dotenv import load_dotenv

load_dotenv()

# Configuration
REDIS_URL = os.getenv("REDIS_URL") or "redis://:redispassword123@localhost:6379"
REQ_QUEUE = "queue:requests"
RES_STREAM = "stream:results"

# Define the parameters for XREAD
# block = 0
# idle = 0
# count = 1
# streams = ["queue:requests"]
# offsets = [0]

async def start_worker():
    # 1. Initialize Redis and Inference
    r = redis.from_url(REDIS_URL, decode_responses=True)
    inference = InferenceService()

    # We use '$' to listen for NEW tasks only
    # '0' can be used to listen for previous enqueued tasks
    streams = {REQ_QUEUE: "0"} 
    print(f"Worker active. Monitoring {REQ_QUEUE} for LLM tasks...")

    while True:
        try:
            # Syntax fix: streams must be a dict
            # BLOCK=0 means wait forever
            results = await r.xread(streams=streams, block=0, count=1)

            if not results:
                continue

          
            # Redis Streams return structure: [[stream_name, [[msg_id, data_dict]]]]
            for stream_name, messages in results:
                for msg_id, task in messages:
                    # 1. Extract the DTO from Node.js
                    # Everything comes in as strings from Redis
                    corr_id = task.get("correlationId")
                    user_id = task.get("userId")
                    conv_id = task.get("conversationId") # The missing link for Node
                    user_msg = task.get("message")
                    room_id = task.get("roomId")
                    
                    # Context is a JSON string in our contract
                    context_raw = task.get("context", "[]")
                    context = json.loads(context_raw)

                    print(f"[*] Processing Task: {corr_id} | User: {user_id}")

                    # 2. Stream Generation
                    buffer = ""
                    try:
                        async for chunk in inference.stream_generate(user_msg):
                            # Reflect all IDs back so Node knows where to route the chunk
                            buffer += chunk
                            # Only send to Redis if we have a decent chunk or a newline
                            if len(buffer) > 20 or "\n" in chunk:
                                await r.xadd(
                                    RES_STREAM,
                                    {
                                        "correlationId": corr_id,
                                        "userId": user_id,
                                        "conversationId": conv_id,
                                        "roomId": room_id,
                                        "content": chunk,
                                        "status": "streaming"
                                    },
                                    maxlen=1000,
                                    approximate=True
                                )
                        
                        # 3. Finalize Stream
                        await r.xadd(
                            RES_STREAM,
                            {
                                "correlationId": corr_id, 
                                "userId": user_id, 
                                "conversationId": conv_id,
                                "roomId": room_id,
                                "status": "done"
                            },
                            maxlen=1000,
                            approximate=True
                        )

                        # 4. ONLY DELETE if processing finished successfully
                        await r.xdel(REQ_QUEUE, msg_id)
                        print(f"[+] Request {corr_id} processed and removed from queue.")

                    except Exception as ai_err:
                        if "429" in str(ai_err):
                            print("Rate limit hit! Cooling down for 10 seconds...")
                            # Put the task back or just wait
                            await asyncio.sleep(10) 
                        else:
                            print(f"AI Generation Error: {ai_err}")
                            await r.xadd(
                                RES_STREAM,
                                {
                                    "correlationId": corr_id,
                                    "userId": user_id,
                                    "conversationId": conv_id,
                                    "status": "error",
                                    "content": "The AI failed to generate a response."
                                }
                            )

                    # 4. Update cursor to the last processed message ID
                    streams[REQ_QUEUE] = msg_id

        except Exception as e:
            print(f"Worker Loop Error: {e}")
            await asyncio.sleep(2) # Backoff on connection errors


if __name__ == "__main__":
    try:
        asyncio.run(start_worker())
    except KeyboardInterrupt:
        print("Worker stopped.")


# while True:
#     try:
#         # Use BRPOP to get the task from the task queue
#         # _, task_data = await r.brpop("queue:requests")
#         # task = json.loads(task_data)

#         # Use XREAD to read from the stream
#         results = await r.xread(block=block, count=count, streams=streams)

#         # If there are results, process them
#         if results:
#             for result in results:
#                 task_data = result[1][0][1]
#                 task = loads(task_data)
        
        
#                 # Extract metadata
#                 corr_id = task.get("correlationId")
#                 user_id = task.get("userId") # Needed for Node to find the socket
#                 user_msg = task.get("message")

#                 # Stream from Gemini
#                 async for chunk in inference.stream_generate(user_msg):
#                     # XADD: Push chunk to the GLOBAL results stream
#                     # '*' lets Redis generate the auto-incrementing ID
#                     await r.xadd(
#                         "stream:results",
#                         {
#                             "correlationId": corr_id,
#                             "userId": user_id,
#                             "content": chunk,
#                             "status": "streaming"
#                         }
#                     )
                
#                 # Signal completion for this specific request
#                 await r.xadd(
#                     "stream:results",
#                     {"correlationId": corr_id, "userId": user_id, "status": "done"}
#                 )

# =============================================================================
#         # Set expiry on the result key so it doesn't leak memory
#         # await r.expire(result_key, 600) 

#     except Exception as e:
#         print(f"Worker Error: {e}")
#         await asyncio.sleep(1)


# async for chunk in inference.stream_generate(user_msg):
#     await r.xadd(
#         "stream:results",
#         {
#             "correlationId": corr_id,
#             "userId": user_id,
#             "content": chunk,
#             "status": "streaming"
#         }
#     )

# await r.xadd(
#     "stream:results",
#     {"correlationId": corr_id, "userId": user_id, "status": "done"}
# )

# # Update the cursor so we don't read the same message again
# streams["queue:requests"] = msg_id