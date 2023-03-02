import { gql, ApolloServer } from "apollo-server-micro";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
// https://graphql.org/learn/queries/#using-variables-inside-fragments
const typeDefs = gql`
  type Movie {
    title: String
    adult: Boolean
    budget: Int
    revenue: Int
    genres: [String]
    imdb_id: String
    movie_id: Int
    production_companies: [Int]
    spoken_languages: [String]
    release_date: String
    status: String
    runtime: Int
    actors: [Person!]! @relationship(type: "CASTED_FOR", direction: IN)
    crew: [Person!]! @relationship(type: "CREW_FOR", direction: IN)
  }

  type TVShow {
    air_date: String
    episode_id: Int
    vote_average: Float
    name: String
    season: Int
    runtime: Int
    episode: Int
    vote_count: Int
    actors: [Person!]! @relationship(type: "CASTED_FOR", direction: IN)
    crew: [Person!]! @relationship(type: "CREW_FOR", direction: IN)
  }

  type Person {
    name: String
    adult: Boolean
    birthday: String
    deathday: String
    gender: Int
    imdb_id: String
    person_id: Int
    popularity: Float
    casted_for_movie: [Movie!]!
      @relationship(type: "CASTED_FOR", direction: OUT)
    casted_for_tvshow: [TVShow!]!
      @relationship(type: "CASTED_FOR", direction: OUT)
    crew_for_movie: [Movie!]! @relationship(type: "CREW_FOR", direction: OUT)
    crew_for_tvshow: [TVShow!]! @relationship(type: "CREW_FOR", direction: OUT)
  }

  type Connection {
    first_person: Person
    second_person: Person
    path: [Person]
  }
`;

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const resolvers = {};

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

  const neoSchema = new Neo4jGraphQL({ typeDefs, driver, resolvers });
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
