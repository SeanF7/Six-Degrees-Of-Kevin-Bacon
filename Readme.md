# Six Degrees Of Kevin Bacon

## What is it?

This project is for a website that will show the path between 2 people using movies and tv shows that they have in common.

![GIF of the website working](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzA1NWU2M2Q1ZmViYTdmNTlmM2VkOGRlNGEyZmQzMDc5ZGIxNjA2YiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/0DwO4LW3um0tirIQRP/giphy.gif)

## Neo4j

This project uses Neo4j as it's database. In total the database works out to 7 million nodes with 33 million connections. The commands for loading and setting up the database can be found below. APOC Must be installed in the database for the queries to work.

### Commands

#### Config file

dbms.cypher.forbid_exhaustive_shortestpath = true in neo4j config

#### Loading Data

``` Command Line
neo4j-admin database import full --nodes=import/movies_header.csv,import/movies.csv --nodes=import/tv_episodes_header.csv,import/tv_episodes.csv --nodes=import/tv_shows_header.csv,import/tv_shows.csv --nodes=import/people_header.csv,import/people.csv --relationships=import/crew_movies_header.csv,import/crew_movies.csv --relationships=import/cast_movies_header.csv,import/cast_movies.csv --relationships=import/tv_cast_header.csv,import/tv_cast.csv --relationships=import/tv_crew_header.csv,import/tv_crew.csv --overwrite-destination --ignore-extra-columns=true --skip-duplicate-nodes --skip-bad-relationships --id-type=integer
```

#### Cypher Commands

Add property so lowercase name searches are faster

``` Cypher
CALL apoc.periodic.iterate(
'MATCH (p:Person) RETURN p',
'SET p.lowercase_name = toLower(p.name)',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total;
```

Don't forgot to create indexes and constraints

``` Cypher
CREATE TEXT INDEX person_index FOR (p:Person) ON (p.lowercase_name);
CREATE CONSTRAINT person_id FOR (p:Person) REQUIRE p.person_id IS UNIQUE;
CREATE CONSTRAINT movie_id FOR (m:Movie) REQUIRE m.movie_id IS UNIQUE;
CREATE CONSTRAINT episode_id FOR (t:TvEpisode) REQUIRE t.episode_id IS UNIQUE;
CREATE CONSTRAINT show_index FOR (tv:TvShow) REQUIRE (tv.tv_id) IS UNIQUE;
```

### Queries

Finds path and returns tv shows connected with it

``` Cypher
MATCH (p1:Person {person_id: "429"}), (p2:Person {person_id: "1566455"}), p = shortestPath((p1)-[*]-(p2))
WITH NODES(p) AS nodes
UNWIND nodes AS node
WITH node,nodes
WHERE "TvEpisode" IN LABELS(node)
MATCH (tv:TvShow{tv_id:toString(node.tv_show_id)})
RETURN tv,nodes
```

``` Cypher
Find path with filter
MATCH
  (KevinB:Person {person_id: '500'}),
  (Al:Person {person_id: '505710'}),
  p = shortestPath((KevinB)-[*]-(Al))
WHERE all(r IN [x in nodes(p) where x:Person] WHERE r.gender = 1 OR r.person_id = "500")
RETURN p
```

Find all Paths with filter

``` Cypher
MATCH (p1:Person{person_id:"1136406"}), (p2:Person {person_id:"505710"})
CALL apoc.algo.allSimplePaths(p1,p2,"CAST_FOR|CREW_FOR",3) YIELD path as p
WHERE all(r IN [x in nodes(p) where x:Movie] WHERE NOT r.budget = 0)
RETURN p
```

Finds all paths and returns sum of revenue

``` Cypher
MATCH (p1:Person{person_id:1136406}), (p2:Person {person_id:505710})
CALL apoc.algo.allSimplePaths(p1,p2,"CAST_FOR|CREW_FOR",4) YIELD path as p
RETURN p, apoc.coll.sum([movie in [x in nodes(p) where x:Movie] | movie.revenue]) as rev_sum
ORDER BY rev_sum DESC
LIMIT 10
```
