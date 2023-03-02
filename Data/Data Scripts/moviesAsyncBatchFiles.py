import aiohttp
import asyncio
import json as js
import time
import math
from dotenv import load_dotenv
load_dotenv()

apiKey = os.getenv('API_KEY')
start_time = time.time()


async def fetch(session, x):
    async with session.get(f"https://api.themoviedb.org/3/tv/{x}/aggregate_credits?api_key={apiKey}") as response:
        return await response.json()


async def main():
    chunks = 100000
    request_amount = 219373
    for x in range(1, math.ceil(request_amount/chunks)+1):
        tasks = []
        start = (x-1)*chunks+1
        end = (x)*chunks if x != math.ceil(request_amount /
                                           chunks) else (x-1)*chunks + request_amount % chunks
        async with aiohttp.ClientSession() as session:
            for y in range(start, end+1):
                tasks.append(fetch(session, y))
            jsons = await asyncio.gather(*tasks)
            with open(f"Data/tv-shows/credits/credits_{start}_{end}.jsonl", "w") as out:
                for json in jsons:
                    if "success" not in json:
                        out.write(f"{js.dumps(json)}\n")

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    print("--- %s seconds ---" % (time.time() - start_time))
