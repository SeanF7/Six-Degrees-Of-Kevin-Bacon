import os
import json
import csv
import re


folder_path = '../Data/tv-shows'


def natural_sort(l):
    def convert(text): return int(text) if text.isdigit() else text.lower()

    def alphanum_key(key): return [convert(c)
                                   for c in re.split('([0-9]+)', key)]
    return sorted(l, key=alphanum_key)


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
