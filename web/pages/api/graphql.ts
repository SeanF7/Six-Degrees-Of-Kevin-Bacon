import { gql, ApolloServer } from "apollo-server-micro";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";

interface PathArgs {
  first_person_id: String;
  second_person_id: String;
}

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

  type PersonWithRelationships {
    person: Person
    relationship: Relationship
    endPoint: MovieOrTvEpisode
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

  type castObj implements cast {
    character: String
    credit_id: String
  }

  type crewObj implements crew {
    department: String
    credit_id: String
    job: String
  }

  union Relationship = castObj | crewObj
  union MovieOrTvEpisode = Movie | TvEpisode
  union Path = Person | Movie | TvEpisode | castObj | crewObj

  type Query {
    find_path(
      first_person_id: String!
      second_person_id: String!
    ): [PersonWithRelationships]
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

const resolvers = {
  Query: {
    find_path(_parent: any, _args: PathArgs, _context: any, _resolveInfo: any) {
      return driver
        .executeQuery(
          `MATCH (p1:Person{person_id:"${_args.first_person_id}"}), (p2:Person {person_id:"${_args.second_person_id}"}), p = shortestPath((p1)-[*]-(p2)) RETURN p`
        )
        .then((res) => {
          let results = [];
          for (let i = 0; i < res.records[0].get(0).segments.length; i++) {
            if (i % 2 === 0) {
              results.push({
                person: res.records[0].get(0).segments[i].start.properties,
                relationship:
                  res.records[0].get(0).segments[i].relationship.properties,
                endPoint: res.records[0].get(0).segments[i].end.properties,
              });
            } else {
              results.push({
                person: res.records[0].get(0).segments[i].end.properties,
                relationship:
                  res.records[0].get(0).segments[i].relationship.properties,
                endPoint: res.records[0].get(0).segments[i].start.properties,
              });
            }
          }
          return results;
        });
    },
  },
  Relationship: {
    __resolveType(obj: any, context: any, info: any) {
      if (obj.character) {
        return "castObj";
      }
      if (obj.department) {
        return "crewObj";
      }
      return null;
    },
  },
  MovieOrTvEpisode: {
    __resolveType(obj: any, context: any, info: any) {
      if (obj.movie_id) {
        return "Movie";
      }
      if (obj.tv_show_id) {
        return "TvEpisode";
      }
      return null;
    },
  },
  PersonWithRelationships: {
    person(obj: any, context: any, info: any) {
      return obj.person;
    },
    relationship(obj: any, context: any, info: any) {
      return obj.relationship;
    },
    endPoint(obj: any, context: any, info: any) {
      return obj.endPoint;
    },
  },
};
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
