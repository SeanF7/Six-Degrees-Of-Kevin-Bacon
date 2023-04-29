import aiohttp
import asyncio
import json as js
import time
import pandas as pd
import os
from tqdm import tqdm
import re
from dotenv import load_dotenv
load_dotenv()

apiKey = os.getenv('API_KEY')
chunks = 100000
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

    jsons = await asyncio.gather(*tasks)
    df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)

    # # Filters out failed requests
    if 'success' in df.columns:
        df = df[df.success != False]
        df = df.drop(columns=['success', 'status_code', 'status_message'])

    df['id'] = df['id'].astype(dtype='int64')

    normalizeGroup(df, "crew", "CREW_FOR", "movie_id").to_csv(
        'movie_crew.csv', index=False)
    normalizeGroup(df, "cast", "CAST_FOR", "movie_id").to_csv(
        'movie_cast.csv', index=False)


async def getTVEpisodes():
    tv_df = pd.read_csv("tv_shows.csv")
    # tv_df['seasons'] = tv_df['seasons'].replace(
    #     "None", "null").replace("'", '"')
    async with aiohttp.ClientSession() as session:
        df = pd.DataFrame()
        tasks = []
        for index, row in tqdm(tv_df.iterrows(), total=len(tv_df)):
            tv_show_id = row['id']
            print(f"Fetching seasons for {tv_show_id}\n")
            # Write to file
            string = re.sub(r"^'|(?<=[^a-zA-Z])'|'(?=[^a-zA-Z])|'$", '"',
                            row['seasons'].replace("\"", "'")).replace("None", "null")
            fixed = js.loads(string)
            for season in fixed:
                episode_count = season['episode_count']
                season_number = season['season_number']
                for x in range(1, episode_count+1):
                    tasks.append(fetchTVEpisode(session=session, url=tv_episode_url,
                                 season=season_number, episode=x, tv_id=tv_show_id))
            if len(tasks) >= chunks:
                jsons = await asyncio.gather(*tasks)
                df = pd.concat([df, pd.read_json(jsons)], ignore_index=True)
                tasks = []
        jsons = await asyncio.gather(*tasks)
        df = pd.concat([df, pd.read_json(jsons)], ignore_index=True)

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
        for index, row in tqdm(tv_df.iterrows(), total=len(tv_df)):
            tasks.append(fetchTVEpisode(session=session, url=tv_episode_credits_url,
                                        season=row['season_number'], episode=row['episode_number'], tv_id=row['tv_id']))
            if len(tasks) >= chunks:
                jsons = await asyncio.gather(*tasks)
                df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)
                tasks = []

        jsons = await asyncio.gather(*tasks)
        df = pd.concat([df, pd.DataFrame(jsons)], ignore_index=True)
        # # Filters out failed requests
        if 'success' in df.columns:
            df = df[df.success != False]
            df = df.drop(columns=['success', 'status_code', 'status_message'])

        df['id'] = df['id'].astype(dtype='int64')

        normalizeGroup(df, "crew",  "CREW_FOR", "tv_episode_id").to_csv(
            'tv_crew.csv', index=False)
        pd.concat([normalizeGroup(df, "cast",  "CAST_FOR", "tv_episode_id"), normalizeGroup(df, "guest_stars",
                   "CAST_FOR", "tv_episode_id")], ignore_index=True).to_csv('tv_cast.csv', index=False)


async def getAllCSVS():
    # Gets the movies
    # await getData(movie_url, latest_movie_url, "movies.csv")
    # Gets the people
    # await getData(person_url, latest_person_url, "people.csv")
    # Gets TV shows
    await getData(tv_url, latest_tv_url, "tv_shows_test.csv")
    # Gets TV Episodes
    # await getTVEpisodes()
    # # Gets the movie relationships
    # await getMovieRelationships()
    # # Gets the TV relationships
    # await getTVRelationships()


def normalizeGroup(df, person_type, connection_type, id_type):
    exploded = df.explode(person_type).reset_index(drop=True)
    normalized_df = pd.json_normalize(exploded[person_type])
    normalized_df.insert(0, id_type, exploded['id'])
    normalized_df.insert(len(normalized_df.columns), ':TYPE', connection_type)

    if "adult" in normalized_df.columns:
        # Makes adult lowercase as import requires it
        normalized_df['adult'] = normalized_df['adult'].astype(dtype='string')
        normalized_df['adult'] = normalized_df['adult'].str.lower()

    # Filters " and ' from strings so we don't get errors on import
    normalized_df.applymap(lambda x: x.replace('"', '').replace(
        "'", '') if isinstance(x, str) else x)

    # Has to be done later to not screw up movie/tv id but we don't want to keep blank rows
    normalized_df.dropna(subset=['id'], inplace=True)
    return normalized_df


async def getData(url, latest_url, output_file):
    df = pd.DataFrame()
    tasks = []
    async with aiohttp.ClientSession() as session:
        latest = (await fetch(session, 0, latest_url)).get('id')
        latest = 3
        for y in tqdm(range(1, latest+1)):
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
    # Maybe store tv_id season and episode number in a separate file for later use in tv relationships
    df['seasons'].to_json('seasons.json')
    df.to_csv(output_file, index=False)


# Takes a list of JSON objects and returns a list of the values of the key
def filterJson(x, key):
    if isinstance(x, list):
        return [item[key] for item in x]


if __name__ == '__main__':
    loop = asyncio.get_event_loop_policy().get_event_loop()
    loop.run_until_complete(getAllCSVS())
    print("--- %s seconds ---" % (time.time() - start_time))
