import os
import asyncio
import json
import redis.asyncio as redis
from services.inference import InferenceService
from dotenv import load_dotenv

load_dotenv()

# Configuration
REDIS_URL = os.getenv("REDIS_URL") or "redis://:redispassword123@localhost:6379"
REQUEST_QUEUE = "queue:requests"
RESULT_QUEUE = "queue:results"

# Define the parameters for XREAD
block = 0
idle = 0
count = 1
streams = ["queue:requests"]
offsets = [0]

async def start_worker():
    # 1. Initialize Redis and Inference
    r = redis.from_url(REDIS_URL, decode_responses=True)
    inference = InferenceService()
    print("Worker active. Listening for LLM tasks...")

    # We use '$' to listen for NEW tasks only
    streams = {"queue:requests": "$"} 
    
    print("Worker active. Listening for LLM tasks via Streams...")

    while True:
        try:
            # Syntax fix: streams must be a dict
            # BLOCK=0 means wait forever
            results = await r.xread(streams=streams, block=0, count=1)

            if results:
                # Redis Streams return structure: [[stream_name, [[msg_id, data_dict]]]]
                for stream_name, messages in results:
                    for msg_id, task in messages:
                        corr_id = task.get("correlationId")
                        user_id = task.get("userId")
                        user_msg = task.get("message")

                        print(f"Processing: {corr_id}")

                        async for chunk in inference.stream_generate(user_msg):
                            await r.xadd(
                                "stream:results",
                                {
                                    "correlationId": corr_id,
                                    "userId": user_id,
                                    "content": chunk,
                                    "status": "streaming"
                                }
                            )
                        
                        await r.xadd(
                            "stream:results",
                            {"correlationId": corr_id, "userId": user_id, "status": "done"}
                        )
                        
                        # Update the cursor so we don't read the same message again
                        streams["queue:requests"] = msg_id

        except Exception as e:
            print(f"Worker Error: {e}")
            await asyncio.sleep(1)

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


    #         # Set expiry on the result key so it doesn't leak memory
    #         # await r.expire(result_key, 600) 

    #     except Exception as e:
    #         print(f"Worker Error: {e}")
    #         await asyncio.sleep(1)

if __name__ == "__main__":
    try:
        asyncio.run(start_worker())
    except KeyboardInterrupt:
        print("Worker stopped.")