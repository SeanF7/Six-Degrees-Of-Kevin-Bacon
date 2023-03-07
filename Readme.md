# WIP 
## Requirements
Node 16. Node 18 does not work and will have to look into why.
## Neo4j
### Commands
Load Data Command 
This command still needs work as all of the arrays are imported as strings as the default to list commands seem to break it.
Changing to admin import using this command
Issues in file is " can cause issues and some deathdates are inputted wrong.
There is still issues with this command should find out how to remove --ignore-extra-columns=true --skip-duplicate-nodes --skip-bad-relationships
ID is Type string but should probably be int. Causes passing of variables to be a bit weird but not a huge issue

```
neo4j-admin database import full --nodes=import/movies.csv --nodes=import/tv_episodes.csv --nodes=import/people.csv --relationships=import/crew_movies.csv --relationships=import/cast_movies.csv --relationships=import/tv_cast.csv --relationships=import/tv_crew.csv neo4j --overwrite-destination --ignore-extra-columns=true --skip-duplicate-nodes --skip-bad-relationships
```

Add property so lowercase name searches are faster
```
CALL apoc.periodic.iterate(
'MATCH (p:Person) RETURN p',
'SET p.lowercase_name = toLower(p.name)',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total;
```

Don't forgot to create indexes and constraints
```
CREATE TEXT INDEX person_index FOR (p:Person) ON (p.lowercase_name);
CREATE CONSTRAINT person_id FOR (p:Person) REQUIRE p.person_id IS UNIQUE;
CREATE CONSTRAINT movie_id FOR (m:Movie) REQUIRE m.movie_id IS UNIQUE;
CREATE CONSTRAINT episode_id FOR (t:TvShow) REQUIRE t.episode_id IS UNIQUE;

```

