# WIP 
## Neo4j
### Commands
Load Data Command
```
// Delete Everything
:auto MATCH (n)
CALL {
  WITH n
  DETACH DELETE n
} IN TRANSACTIONS;
CALL apoc.schema.assert({
  Person: ["name"]
}, {
  Person: ["person_id"],
  Movie: ["movie_id"],
  TV_Show: ["episode_id"]
});

// Load Movies
CALL apoc.periodic.iterate(
'LOAD CSV WITH HEADERS FROM "file:///movies.csv" AS movie RETURN movie','
  CREATE (m:Movie{movie_id: toInteger(movie.movie_id),imdb_id:        movie.imdb_id,adult:movie.adult,genres:movie.genres,production_companies:movie.production_companies,release_date:movie.release_date,budget:movie.budget, revenue:movie.revenue,status:movie.status,spoken_languages:movie.spoken_languages,runtime:movie.runtime,title: movie.title})',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total;

// Load TV Shows
CALL apoc.periodic.iterate(
'LOAD CSV WITH HEADERS FROM "file:///tv_episodes.csv" AS tv_show RETURN tv_show','
  CREATE (t:TV_Show{episode_id:toInteger(tv_show.episode_id),tv_show_id: toInteger(tv_show.tv_id),season: toInteger(tv_show.season),episode: toInteger(tv_show.episode),air_date:tv_show.air_date,name:tv_show.name,runtime:tv_show.runtime,vote_average: toInteger(tv_show.vote_average),vote_count: toInteger(tv_show.vote_count)})',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total;

// Load People
CALL apoc.periodic.iterate(
'LOAD CSV WITH HEADERS FROM "file:///people.csv" as person RETURN person','
CREATE (p:Person{person_id: toInteger(person.person_id),imdb_id: person.imdb_id,adult:person.adult,popularity:person.popularity,name:person.name,birthday:person.birthday,deathyday:person.deathday,gender:person.gender,place_of_birth:person.place_of_birth})',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total;

// Create Relationships

// Create Movies Cast
CALL apoc.periodic.iterate(
'LOAD CSV WITH HEADERS FROM "file:///cast_movies.csv" as cast RETURN cast','
MATCH (m:Movie{movie_id: toInteger(cast.movie_id)})
MATCH (p:Person{person_id: toInteger(cast.person_id)})
CREATE (p)-[r:CASTED_FOR]->(m)
SET r.credit_id = cast.credit_id',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total;

// Create Movies Crew
CALL apoc.periodic.iterate(
'LOAD CSV WITH HEADERS FROM "file:///crew_movies.csv" as crew RETURN crew','
MATCH (m:Movie{movie_id: toInteger(crew.movie_id)})
MATCH (p:Person{person_id: toInteger(crew.person_id)})
CREATE (p)-[r:CREW_FOR]->(m)
SET r.credit_id = crew.credit_id, r.department = crew.department, r.job = crew.job',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total;

// Create TV Crew
CALL apoc.periodic.iterate(
'LOAD CSV WITH HEADERS FROM "file:///tv_crew.csv" as crew RETURN crew','
MATCH (tv:TV_Show{episode_id: toInteger(crew.episode_id)})
MATCH (p:Person{person_id: toInteger(crew.person_id)})
CREATE (p)-[r:CREW_FOR]->(tv)
SET r.credit_id = crew.credit_id,r.department = crew.department, r.job = crew.job',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total;

// Create TV Cast
CALL apoc.periodic.iterate(
'LOAD CSV WITH HEADERS FROM "file:///tv_cast.csv" as cast RETURN cast','
MATCH (tv:TV_Show{episode_id: toInteger(cast.episode_id)})
MATCH (p:Person{person_id: toInteger(cast.person_id)})
CREATE (p)-[r:CASTED_FOR]->(tv)
SET r.credit_id = cast.credit_id',
{batchSize:10000, parallel:True}) YIELD batches, total
RETURN batches, total
```