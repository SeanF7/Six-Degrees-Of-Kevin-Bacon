import os
import aiohttp
import asyncio
import json
import csv
import re
import math


folder_path = '../Data/tv-shows'


def natural_sort(l):
    def convert(text): return int(text) if text.isdigit() else text.lower()

    def alphanum_key(key): return [convert(c)
                                   for c in re.split('([0-9]+)', key)]
    return sorted(l, key=alphanum_key)


def parseCSV():
    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(folder_path+'/'+f)])

    csvWrite = csv.writer(open("../Data/csv/tv_seasons.csv", "w",
                               newline='', encoding='utf-8'))
    for file in files:
        csvWrite.writerow(["tv_show_id", "season_count", "season_lengths"])
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            csvWrite.writerow(
                [jsonObj['id'], len(jsonObj['seasons']), [f["episode_count"] for f in jsonObj['seasons']]])


apiKey = "b83cef215ad08de7d230139e640032b6"


async def fetch(session, tv_id, season, episode):
    async with session.get(f"https://api.themoviedb.org/3/tv/{tv_id}/season/{season}/episode/{episode}?api_key={apiKey}") as response:
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
            with open(f"Data/tv-shows/shows_{start}_{end}.jsonl", "w") as out:
                for jsonFile in jsons:
                    if "success" not in jsonFile:
                        out.write(f"{json.dumps(jsonFile)}\n")

csvReader = csv.DictReader(open("../Data/csv/tv_seasons.csv"))
line_count = 0
for x in csvReader:
    for season_length in x["season_lengths"]:
        print(season_length)
        # for episode in x["season_lengths"][season-1]:
        #     print(episode)
    if int(x['tv_show_id']) == 2:
        exit()
