import pandas as pd
import json as js

testdf = pd.read_csv("tv_shows_test.csv")
seasdf = pd.DataFrame(testdf['seasons'])
print(seasdf.to_json(orient='records', convert_quotes=True))
