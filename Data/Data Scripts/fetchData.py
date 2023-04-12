import aiohttp
import asyncio
import json as js
import time
import pandas as pd
import math
import os
import numpy as np
from dotenv import load_dotenv
load_dotenv()

apiKey = os.getenv('API_KEY')
chunks = 10000
start_time = time.time()
movie_url = "https://api.themoviedb.org/3/movie/{id}?api_key={apiKey}"
latest_movie_url = "https://api.themoviedb.org/3/movie/latest?api_key={apiKey}"
movie_credits_url = "https://api.themoviedb.org/3/movie/{id}/credits?api_key={apiKey}"
person_url = "https://api.themoviedb.org/3/person/{id}?api_key={apiKey}"
latest_person_url = "https://api.themoviedb.org/3/person/latest?api_key={apiKey}"
tv_url = "https://api.themoviedb.org/3/tv/{id}?api_key={apiKey}"
latest_tv_url = "https://api.themoviedb.org/3/tv/latest?api_key={apiKey}"
tv_episode_url = "https://api.themoviedb.org/3/tv/{tv_id}/season/{season}/episode/{episode}?api_key={apiKey}"
tv_episode_credits_url = "https://api.themoviedb.org/3/tv/{tv_id}/season/{season}/episode/{episode}/credits?api_key={apiKey}"


async def fetch(session, id, url):
    async with session.get(url.format(id=id, apiKey=apiKey)) as response:
        return await response.json()


async def fetchTVEpisode(session, url, season, episode, tv_id):
    async with session.get(url.format(apiKey=apiKey, season=season, episode=episode, tv_id=tv_id)) as response:
        data = await response.json()
        data.update({"tv_id": tv_id})
        return data


async def getMovieRelationships():
    df = pd.DataFrame()
    tasks = []
    async with aiohttp.ClientSession() as session:
        latest = (await fetch(session, 0, latest_movie_url)).get('id')
        for y in range(1, latest+1):
            tasks.append(fetch(session, y, movie_credits_url))
            if len(tasks) >= chunks:
                jsons = await asyncio.gather(*tasks)
                df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)
                tasks = []

    # # Filters out failed requests
    if 'success' in df.columns:
        df = df[df.success != False]
        df = df.drop(columns=['success', 'status_code', 'status_message'])

    df['id'] = df['id'].astype(dtype='int64')

    normalizeGroup(df, "movie_crew", "CREW_FOR")
    normalizeGroup(df, "movie_cast", "CAST_FOR")


async def getTVEpisodes():
    tv_df = pd.read_csv("tv_shows.csv")
    async with aiohttp.ClientSession() as session:
        df = pd.DataFrame()
        tasks = []
        for index, row in tv_df.iterrows():
            tv_show_id = row['id']

            fixed = js.loads(row['seasons'].replace(
                "'", '"').replace("None", "null"))
            for season in fixed:
                episode_count = season['episode_count']
                season_number = season['season_number']
                for x in range(1, episode_count+1):
                    tasks.append(
                        fetchTVEpisode(session=session, url=tv_episode_url, season=season_number, episode=x, tv_id=tv_show_id))
            if len(tasks) >= chunks:
                jsons = await asyncio.gather(*tasks)
                df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)
                tasks = []
        jsons = await asyncio.gather(*tasks)
        df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)

        # Filters " and ' from strings so we don't get errors on import
        df = df.applymap(lambda x: x.replace('"', '').replace(
            "'", '') if isinstance(x, str) else x)

        # Filters out failed requests
        if 'success' in df.columns:
            df = df[df.success != False]
            df = df.drop(columns=['success', 'status_code', 'status_message'])

        if "id" in df.columns:
            df['id'] = df['id'].astype(dtype='int64')
        df.to_csv('tv_episodes.csv', index=False)


async def getTVRelationships():
    tv_df = pd.read_csv("tv_episodes.csv")
    async with aiohttp.ClientSession() as session:
        df = pd.DataFrame()
        tasks = []
        for index, row in tv_df.iterrows():
            tasks.append(fetch(session, row['id'], tv_episode_credits_url))

            if len(tasks) >= chunks:
                jsons = await asyncio.gather(*tasks)
                df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)
                tasks = []

        jsons = await asyncio.gather(*tasks)
        df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)
        print(df)

        # # Filters " and ' from strings so we don't get errors on import
        # df = df.applymap(lambda x: x.replace('"', '').replace(
        #     "'", '') if isinstance(x, str) else x)

        # # Filters out failed requests
        # if 'success' in df.columns:
        #     df = df[df.success != False]
        #     df = df.drop(columns=['success', 'status_code', 'status_message'])

        # if "id" in df.columns:
        #     df['id'] = df['id'].astype(dtype='int64')
        # df.to_csv('tv_cast.csv', index=False)


async def getNodes():
    # Gets the movies
    # await getData(movie_url, latest_movie_url, "movies.csv")
    # # Gets the people
    # await getData(person_url, latest_person_url, "people.csv")
    # Gets TV shows
    # await getData(tv_url, latest_tv_url, "tv_shows.csv")
    # Gets TV Episodes
    await getTVEpisodes()


def normalizeGroup(df, file_name, type):

    exploded = df.explode('cast').reset_index(drop=True)
    normalized_df = pd.json_normalize(exploded['cast'])
    normalized_df.insert(0, 'movie_id', exploded['id'])
    normalized_df.insert(len(normalized_df.columns), ':TYPE', type)

    if "adult" in normalized_df.columns:
        # Makes adult lowercase as import requires it
        normalized_df['adult'] = normalized_df['adult'].astype(dtype='string')
        normalized_df['adult'] = normalized_df['adult'].str.lower()

    # Filters " and ' from strings so we don't get errors on import
    normalized_df = normalized_df.applymap(lambda x: x.replace('"', '').replace(
        "'", '') if isinstance(x, str) else x)

    normalized_df.to_csv(file_name, index=False)


async def getData(url, latest_url, output_file):
    df = pd.DataFrame()
    tasks = []
    async with aiohttp.ClientSession() as session:
        # latest = (await fetch(session, 0, latest_url)).get('id')
        latest = 10
        for y in range(1, latest+1):
            tasks.append(fetch(session, y, url))
            if len(tasks) >= chunks:
                jsons = await asyncio.gather(*tasks)
                df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)
                tasks = []
        jsons = await asyncio.gather(*tasks)
        df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)
    if url == person_url:
        # Fixes dates
        df['birthday'] = pd.to_datetime(
            df["birthday"], format="%Y-%m-%d", errors='coerce')
        df['deathday'] = pd.to_datetime(
            df["deathday"], format="%Y-%m-%d", errors='coerce')

    if url == movie_url:
        # Get the id out of the genre JSON
        df['genres'] = df['genres'].apply(filterJson, key='id')
        df['production_companies'] = df['production_companies'].apply(
            filterJson, key='id')
        df['spoken_languages'] = df['spoken_languages'].apply(
            filterJson, key='iso_639_1')
        df['production_countries'] = df['production_countries'].apply(
            filterJson, key='iso_3166_1')

    if "adult" in df.columns:
        # Makes adult lowercase as import requires it
        df['adult'] = df['adult'].astype(dtype='string')
        df['adult'] = df['adult'].str.lower()

    # Filters " and ' from strings so we don't get errors on import
    df = df.applymap(lambda x: x.replace('"', '').replace(
        "'", '') if isinstance(x, str) else x)

    # Filters out failed requests
    if 'success' in df.columns:
        df = df[df.success != False]
        df = df.drop(columns=['success', 'status_code', 'status_message'])

    if "id" in df.columns:
        df['id'] = df['id'].astype(dtype='int64')
    df.to_csv(output_file, index=False)


# Takes a list of JSON objects and returns a list of the values of the key
def filterJson(x, key):
    if isinstance(x, list):
        return [item[key] for item in x]


if __name__ == '__main__':
    loop = asyncio.get_event_loop_policy().get_event_loop()
    # loop.run_until_complete(getData(movie_url, 10, "test.csv", chunks=10))
    loop.run_until_complete(getTVRelationships())
    print("--- %s seconds ---" % (time.time() - start_time))
