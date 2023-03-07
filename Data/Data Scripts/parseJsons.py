import json
import csv
import os
import re
import pandas as pd


def natural_sort(l):
    def convert(text): return int(text) if text.isdigit() else text.lower()

    def alphanum_key(key): return [convert(c)
                                   for c in re.split('([0-9]+)', key)]
    return sorted(l, key=alphanum_key)


def get_movies_csv():
    folder_path = '../json/movies'
    csvWrite = csv.writer(open("../csv/Nodes/movies.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["movie_id", "imdb_id", "adult", "title", "genres", "production_companies", "release_date", "budget", "revenue", "status", "spoken_languages", "runtime", ":LABEL"])
    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(folder_path+'/'+f)])
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            csvWrite.writerow(
                [jsonObj['id'], jsonObj['imdb_id'], jsonObj['adult'], jsonObj['title'], [genre['id'] for genre in jsonObj['genres']], [company['id'] for company in jsonObj['production_companies']],
                 jsonObj['release_date'], jsonObj['budget'], jsonObj['revenue'], jsonObj['status'], [
                     languages['iso_639_1'] for languages in jsonObj['spoken_languages']],
                 jsonObj['runtime'], "Movie"])


def get_movie_cast_csv():
    folder_path = '../json/movies/cast'
    csvWrite = csv.writer(open("../csv/Relationships/cast_movies.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["movie_id", "person_id", "character", "credit_id", ":TYPE"])
    files = natural_sort(os.listdir(folder_path))
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            for person in jsonObj['cast']:
                csvWrite.writerow(
                    [jsonObj['id'], person['id'], person['character'], person['credit_id'], "CAST_FOR"])


def get_movie_crew_csv():
    folder_path = '../json/movies/cast'
    csvWrite = csv.writer(open("../csv/Relationships/crew_movies.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["movie_id", "person_id", "department", "job", "credit_id", ":TYPE"])
    files = natural_sort(os.listdir(folder_path))
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            for person in jsonObj['crew']:
                csvWrite.writerow(
                    [jsonObj['id'], person['id'], person['department'], person['job'], person['credit_id'], "CREW_FOR"])


def get_tv_shows_csv():
    csvWrite = csv.writer(open("../csv/Nodes/tv_episodes.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["episode_id", "show_id", "season", "episode", "air_date", "name", "runtime", "vote_average", "vote_count", ":LABEL"])
    for line in open("../json/tv-shows/shows/shows.jsonl", "r").readlines():
        jsonObj = json.loads(line)
        csvWrite.writerow([jsonObj["id"], jsonObj["tv_id"], jsonObj["season"],
                           jsonObj["episode"], jsonObj["air_date"],
                           jsonObj["name"], jsonObj["runtime"],
                           jsonObj["vote_average"], jsonObj["vote_count"], "TvShow"])


def get_tv_show_cast_csv():

    csvWrite = csv.writer(open("../csv/Relationships/tv_cast.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["episode_id", "person_id", "credit_id", "character", ":TYPE"])
    for line in open("../json/tv-shows/credits/credits.jsonl", "r").readlines():
        jsonObj = json.loads(line)
        for cast_member in jsonObj["cast"]:
            csvWrite.writerow(
                [jsonObj["id"], cast_member["id"], cast_member["credit_id"], cast_member["character"], "CAST_FOR"])


def get_tv_show_crew_csv():

    csvWrite = csv.writer(open("../csv/Relationships/tv_crew.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["episode_id", "tv_id", "season", "episode", "person_id",  "job", "department", "credit_id", ":TYPE"])
    for line in open("../json/tv-shows/credits/credits.jsonl", "r").readlines():
        jsonObj = json.loads(line)
        for crew_member in jsonObj["crew"]:
            csvWrite.writerow([jsonObj["id"], jsonObj["tv_id"], jsonObj["season"],
                               jsonObj["episode"], crew_member["id"],
                               crew_member["job"], crew_member["department"],
                               crew_member["credit_id"], "CREW_FOR"])


def get_people_csv():
    folder_path = '../json/people'
    csvWrite = csv.writer(open("../csv/Nodes/people.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["person_id", "imdb_id", "adult", "popularity", "name", "birthday", "deathday", "gender", "place_of_birth", "image_path", ":LABEL"])
    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(folder_path+'/'+f)])
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            csvWrite.writerow(
                [jsonObj['id'], jsonObj['imdb_id'], jsonObj['adult'], jsonObj['popularity'],
                 jsonObj['name'], jsonObj['birthday'], jsonObj['deathday'], jsonObj['gender'], jsonObj['place_of_birth'], jsonObj["profile_path"], "Person"])


get_people_csv()
