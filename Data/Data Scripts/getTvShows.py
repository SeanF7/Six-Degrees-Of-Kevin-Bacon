import os
import aiohttp
import asyncio
import json
import re
import pandas as pd
from tqdm import tqdm
from dotenv import load_dotenv
folder_path = '../Data/tv-shows'
load_dotenv()
apiKey = os.getenv('API_KEY')


def natural_sort(l):
    def convert(text):
        return int(text) if text.isdigit() else text.lower()

    def alphanum_key(key):
        return [convert(c) for c in re.split('([0-9]+)', key)]

    return sorted(l, key=alphanum_key)


async def fetch(session, tv_id, season, episode):
    async with session.get(f"https://api.themoviedb.org/3/tv/{tv_id}/season/{season}/episode/{episode}/credits?api_key={apiKey}") as response:
        returnVal = await response.json()
        returnVal.update(
            {"tv_id": tv_id, "season": season, "episode": episode})
        return returnVal


async def getShows():

    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(os.path.join(folder_path, f))])

    pnd = pd.concat(
        [pd.read_json(open(f"{folder_path}/{f}"), lines=True) for f in files])
    tasks = []
    file = open(f"../Data/tv-shows/shows/shows.jsonl", "a")
    async with aiohttp.ClientSession() as session:
        for index, row in tqdm(pnd.iterrows(), total=pnd.shape[0]):
            tv_show_id = row['id']
            for x in row['seasons']:
                episode_count = x['episode_count']
                season_number = x['season_number']
                for x in range(1, episode_count+1):
                    tasks.append(fetch(session, tv_show_id,
                                       season_number, x))

            if len(tasks) >= 100000:
                jsons = await asyncio.gather(*tasks)
                for jsonFile in jsons:
                    if "success" not in jsonFile:
                        file.write(f"{json.dumps(jsonFile)}\n")
                tasks = []

        jsons = await asyncio.gather(*tasks)
        for jsonFile in jsons:
            if "success" not in jsonFile:
                file.write(f"{json.dumps(jsonFile)}\n")


async def getCastAndCrew():
    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(os.path.join(folder_path, f))])

    pnd = pd.concat(
        [pd.read_json(open(f"{folder_path}/{f}"), lines=True) for f in files])
    tasks = []
    file = open(f"../Data/tv-shows/credits/credits.jsonl", "a")
    async with aiohttp.ClientSession() as session:
        for index, row in tqdm(pnd.iterrows(), total=pnd.shape[0]):
            tv_show_id = row['id']
            for x in row['seasons']:
                episode_count = x['episode_count']
                season_number = x['season_number']
                for x in range(1, episode_count+1):
                    tasks.append(fetch(session, tv_show_id,
                                       season_number, x))

            if len(tasks) >= 100000:
                jsons = await asyncio.gather(*tasks)
                for jsonFile in jsons:
                    if "success" not in jsonFile:
                        file.write(f"{json.dumps(jsonFile)}\n")
                tasks = []

        jsons = await asyncio.gather(*tasks)
        for jsonFile in jsons:
            if "success" not in jsonFile:
                file.write(f"{json.dumps(jsonFile)}\n")

# if __name__ == '__main__':
    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(getCastAndCrew())
