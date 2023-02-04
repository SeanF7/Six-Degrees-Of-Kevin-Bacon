print(pnd["seasons"][0][0]["episode_count"])
for x in pnd["seasons"]:
    for y in x:
        print(y["episode_count"])
    exit()