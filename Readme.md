# WIP 
## Requirements
Node 16. Node 18 does not work and will have to look into why.
## Neo4j
### Commands
Load Data Command 
This command still needs work as all of the arrays are imported as strings as the default to list commands seem to break it.
The files also require manual tweaking as things like dates aren't consistent 
Changing to admin import using this command
Issues in file is " can cause issues and some deathdates are inputted wrong.
There is still issues with this command should find out how to remove --ignore-extra-columns=true --skip-duplicate-nodes --skip-bad-relationships
ID is Type string but should probably be int. Causes passing of variables to be a bit weird but not a huge issue

Adult is not working as it should be false and true but instead it is False and True. All that really matters is the true one though.
Lots of cleanup in regards to the graphql typings on filtering for better completion is still needed.

dbms.cypher.forbid_exhaustive_shortestpath = true in neo4j config

```
neo4j-admin database import full --nodes=import/movies_header.csv,import/movies.csv --nodes=import/tv_episodes_header.csv,import/tv_episodes.csv --nodes=import/tv_shows_header.csv,import/tv_shows.csv --nodes=import/people_header.csv,import/people.csv --relationships=import/crew_movies_header.csv,import/crew_movies.csv --relationships=import/cast_movies_header.csv,import/cast_movies.csv --relationships=import/tv_cast_header.csv,import/tv_cast.csv --relationships=import/tv_crew_header.csv,import/tv_crew.csv --overwrite-destination --ignore-extra-columns=true --skip-duplicate-nodes --skip-bad-relationships --id-type=integer
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
CREATE CONSTRAINT episode_id FOR (t:TvEpisode) REQUIRE t.episode_id IS UNIQUE;
CREATE CONSTRAINT show_index FOR (tv:TvShow) REQUIRE (tv.tv_id) IS UNIQUE;
```

Finds path and returns tv shows connected with it
MATCH (p1:Person {person_id: "429"}), (p2:Person {person_id: "1566455"}), p = shortestPath((p1)-[*]-(p2))
WITH NODES(p) AS nodes
UNWIND nodes AS node
WITH node,nodes
WHERE "TvEpisode" IN LABELS(node)
MATCH (tv:TvShow{tv_id:toString(node.tv_show_id)})
RETURN tv,nodes

Find path with filter
MATCH
  (KevinB:Person {person_id: '500'}),
  (Al:Person {person_id: '505710'}),
  p = shortestPath((KevinB)-[*]-(Al))
WHERE all(r IN [x in nodes(p) where x:Person] WHERE r.gender = 1 OR r.person_id = "500")
RETURN p

Find all Paths with filter

MATCH (p1:Person{person_id:"1136406"}), (p2:Person {person_id:"505710"})
CALL apoc.algo.allSimplePaths(p1,p2,"CAST_FOR|CREW_FOR",3) YIELD path as p
WHERE all(r IN [x in nodes(p) where x:Movie] WHERE NOT r.budget = 0)
RETURN p
