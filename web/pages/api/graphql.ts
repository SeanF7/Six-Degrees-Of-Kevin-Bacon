import { gql, ApolloServer } from "apollo-server-micro";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";

const typeDefs = gql`
  type Movie {
    title: String
    adult: Boolean
    budget: Int
    poster_path: String
    revenue: Int
    genres: [String]
    imdb_id: String
    movie_id: String
    production_companies: [Int]
    spoken_languages: [String]
    release_date: String
    status: String
    runtime: Int
    actors: [Person!]!
      @relationship(type: "CAST_FOR", properties: "cast", direction: IN)
    crew: [Person!]!
      @relationship(type: "CREW_FOR", properties: "crew", direction: IN)
  }

  type TvEpisode {
    air_date: String
    episode_id: String
    vote_average: Float
    show_id: Int
    title: String
    season: Int
    runtime: Int
    episode: Int
    vote_count: Int
    actors: [Person!]!
      @relationship(type: "CAST_FOR", properties: "cast", direction: IN)
    crew: [Person!]!
      @relationship(type: "CREW_FOR", properties: "crew", direction: IN)
    parent_show: [TvShow!]!
      @cypher(
        statement: "MATCH (tvShow:TvShow{tv_id:toString(this.tv_show_id)}) RETURN tvShow"
      )
  }

  type TvShow {
    name: String
    tv_id: Int
    poster_path: String
  }

  type Person {
    name: String
    adult: Boolean
    birthday: Date
    deathday: Date
    gender: Int
    imdb_id: String
    person_id: String
    popularity: Float
    image_path: String
    casted_for_movie: [Movie!]!
      @relationship(type: "CAST_FOR", properties: "cast", direction: OUT)
    casted_for_tvshow: [TvEpisode!]!
      @relationship(type: "CAST_FOR", properties: "cast", direction: OUT)
    crew_for_movie: [Movie!]!
      @relationship(type: "CREW_FOR", properties: "crew", direction: OUT)
    crew_for_tvshow: [TvEpisode!]!
      @relationship(type: "CREW_FOR", properties: "crew", direction: OUT)
  }

  interface cast @relationshipProperties {
    character: String
    credit_id: String
  }
  interface crew @relationshipProperties {
    department: String
    job: String
    credit_id: String
  }

  union Path = Person | Movie | TvEpisode

  type Query {
    shortestPath(first_person: String!, second_person: String!): [Path]
      @cypher(
        statement: """
        MATCH (p1:Person {person_id: $first_person}), (p2:Person {person_id: $second_person}), p = shortestPath((p1)-[*]-(p2))
        WITH NODES(p) AS nodes
        UNWIND nodes AS node
        RETURN node
        """
      )
  }

  type Query {
    shortestPath2(first_person: String!, second_person: String!): [cast]
      @cypher(
        statement: """
        MATCH (p1:Person {person_id: $first_person}), (p2:Person {person_id:$second_person}), p = shortestPath((p1)-[*]-(p2))
        WITH p
        WITH RELATIONSHIPS(p) as rels
        RETURN rels
        """
      )
  }

  type Query {
    suggestedNames(name: String!): [Person]
      @cypher(
        statement: """
        MATCH (p:Person)
        WHERE p.lowercase_name CONTAINS toLower($name)
        RETURN p
        ORDER BY p.popularity DESC
        LIMIT 5
        """
      )
  }
`;

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://studio.apollographql.com"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
  const apolloServer = new ApolloServer({
    schema: await neoSchema.getSchema(),
  });
  await apolloServer.start();
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
