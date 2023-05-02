import pandas as pd
import json
import csv
import os
import re
import time

start_time = time.time()


def natural_sort(l):
    def convert(text): return int(text) if text.isdigit() else text.lower()

    def alphanum_key(key): return [convert(c)
                                   for c in re.split('([0-9]+)', key)]
    return sorted(l, key=alphanum_key)


def get_people_csv():
    folder_path = '../people'
    files = natural_sort([f for f in os.listdir(
        folder_path) if os.path.isfile(folder_path+'/'+f)])

    df = pd.concat((pd.read_json(f"{folder_path}/{f}", lines=True)
                   for f in files), ignore_index=True)

    # Fixes dates
    df['birthday'] = pd.to_datetime(
        df["birthday"], format="%Y-%m-%d", errors='coerce')
    df['deathday'] = pd.to_datetime(
        df["deathday"], format="%Y-%m-%d", errors='coerce')

    # Makes adult lowercase
    df['adult'] = df['adult'].astype(dtype='string')
    df['adult'] = df['adult'].str.lower()
    df.to_csv('file.csv', header=False)


get_people_csv()
print(time.time() - start_time)
