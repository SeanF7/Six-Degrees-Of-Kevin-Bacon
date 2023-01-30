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


folder_path = 'Data/movies/cast'
files = natural_sort(os.listdir(folder_path))
for count, file in enumerate(files):
    jsonObj = pd.read_json(path_or_buf=f"{folder_path}/{file}", lines=True)
    print(jsonObj.to_string())
