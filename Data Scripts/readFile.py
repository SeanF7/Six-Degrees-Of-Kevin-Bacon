import json
import csv
import os
import re


def natural_sort(l):
    def convert(text): return int(text) if text.isdigit() else text.lower()

    def alphanum_key(key): return [convert(c)
                                   for c in re.split('([0-9]+)', key)]
    return sorted(l, key=alphanum_key)


def get_movie_cast_csv():
    folder_path = '../Data/movies/cast'
    csvWrite = csv.writer(open("../Data/csv/cast.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(["movie_id", "person_id", "character", "credit_id"])
    files = natural_sort(os.listdir(folder_path))
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            for person in jsonObj['cast']:
                csvWrite.writerow(
                    [jsonObj['id'], person['id'], person['character'], person['credit_id']])


def get_movie_crew_csv():
    folder_path = '../Data/movies/cast'
    csvWrite = csv.writer(open("../Data/csv/crew.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["movie_id", "person_id", "department", "job", "credit_id"])
    files = natural_sort(os.listdir(folder_path))
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            for person in jsonObj['crew']:
                csvWrite.writerow(
                    [jsonObj['id'], person['id'], person['department'], person['job'], person['credit_id']])


def get_movies_csv():
    folder_path = '../Data/movies'
    csvWrite = csv.writer(open("../Data/csv/movies.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["movie_id", "imdb_id", "adult", "title", "genres", "production_companies", "release_date", "budget", "revenue", "status", "spoken_languages", "runtime"])
    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(folder_path+'/'+f)])
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            csvWrite.writerow(
                [jsonObj['id'], jsonObj['imdb_id'], jsonObj['adult'], jsonObj['title'], [genre['id'] for genre in jsonObj['genres']], [company['id'] for company in jsonObj['production_companies']],
                 jsonObj['release_date'], jsonObj['budget'], jsonObj['revenue'], jsonObj['status'], [
                     languages['iso_639_1'] for languages in jsonObj['spoken_languages']],
                 jsonObj['runtime']])


def get_tv_shows_csv():
    folder_path = '../Data/people'
    csvWrite = csv.writer(open("../Data/csv/people.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["tv_show_id", "imdb_id", "adult", "title", "genres", "production_companies", "release_date", "budget", "revenue", "status", "spoken_languages", "runtime"])
    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(folder_path+'/'+f)])
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            csvWrite.writerow(
                [jsonObj['id'], jsonObj['imdb_id'], jsonObj['adult'], jsonObj['title'], [genre['id'] for genre in jsonObj['genres']], [company['id'] for company in jsonObj['production_companies']],
                 jsonObj['release_date'], jsonObj['budget'], jsonObj['revenue'], jsonObj['status'], [
                     languages['iso_639_1'] for languages in jsonObj['spoken_languages']],
                 jsonObj['runtime']])
            exit()


def get_people_csv():
    folder_path = '../Data/people'
    csvWrite = csv.writer(open("../Data/csv/people.csv", "w",
                               newline='', encoding='utf-8'))
    csvWrite.writerow(
        ["person_id", "imdb_id", "adult", "popularity", "name", "birthday", "deathday", "gender", "place_of_birth"])
    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(folder_path+'/'+f)])
    for file in files:
        for line in open(f"{folder_path}/{file}", "r").readlines():
            jsonObj = json.loads(line)
            csvWrite.writerow(
                [jsonObj['id'], jsonObj['imdb_id'], jsonObj['adult'], jsonObj['popularity'],
                 jsonObj['name'], jsonObj['birthday'], jsonObj['deathday'], jsonObj['gender'], jsonObj['place_of_birth']])


get_people_csv()
