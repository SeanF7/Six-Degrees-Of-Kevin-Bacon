declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEO4J_URI: string;
      NEO4J_USER: string;
      NEO4J_PASSWORD: string;
    }
  }
  interface Movie {
    title: String;
    adult: Boolean;
    budget: Int;
    poster_path: String;
    revenue: Int;
    genres: [String];
    imdb_id: String;
    movie_id: String;
    production_companies: [Int];
    spoken_languages: [String];
    release_date: String;
    status: String;
    runtime: Int;
    actors: [Person!]!;
    crew: [Person!]!;
  }

  interface TvEpisode {
    air_date: String;
    episode_id: String;
    vote_average: Float;
    show_id: Int;
    title: String;
    season: Int;
    runtime: Int;
    episode: Int;
    vote_count: Int;
    actors: [Person!]!;
    crew: [Person!]!;
    parent_show: TvShow;
  }

  interface TvShow {
    name: String;
    tv_id: Int;
    poster_path: String;
  }

  interface Person {
    name: String;
    adult: Boolean;
    birthday: Date;
    deathday: Date;
    gender: Int;
    imdb_id: String;
    person_id: String;
    popularity: Float;
    image_path: String;
    casted_for_movie: [Movie!]!;
    casted_for_tvshow: [TvEpisode!]!;
    crew_for_movie: [Movie!]!;
    crew_for_tvshow: [TvEpisode!]!;
  }

  interface cast {
    __typename: String;
    character: String;
    credit_id: String;
  }
  interface crew {
    __typename: String;
    department: String;
    job: String;
    credit_id: String;
  }
  interface PersonWithRelationships {
    person: Person;
    relationship: cast | crew;
    project: Movie | TvEpisode;
  }
  interface PathFilters {
    movie_filter: MovieFilter;
    tv_filter: TvFilter;
    person_filter: PersonFilter;
  }

  interface MovieFilter {
    [index: string];
    adult: Boolean;
    budget_GT: Int;
    budget_LT: Int;
    budget_GTE: Int;
    budget_LTE: Int;
    budget_IN: [Int];
    revenue_GT: Int;
    revenue_LT: Int;
    revenue_GTE: Int;
    revenue_LTE: Int;
    revenue_IN: [Int];
    genres: [String];
    imdb_id: String;
    movie_id: Int;
    movie_id_GT: Int;
    movie_id_LT: Int;
    movie_id_GTE: Int;
    movie_id_LTE: Int;
    movie_id_IN: [Int];
    production_companies: [Int];
    spoken_languages: [String];
    release_date_GT: Date;
    release_date_LT: Date;
    release_date_GTE: Date;
    release_date_LTE: Date;
    release_date_IN: [Date];
    status: String;
    runtime: Int;
  }

  interface TvFilter {
    [index: string];
    air_date_GT: Date;
    air_date_LT: Date;
    air_date_GTE: Date;
    air_date_LTE: Date;
    air_date_IN: [Date];
    episode_id: Int;
    vote_average_GT: Float;
    vote_average_LT: Float;
    vote_average_GTE: Float;
    vote_average_LTE: Float;
    vote_average_IN: [Float];
    runtime_GT: Int;
    runtime_LT: Int;
    runtime_GTE: Int;
    runtime_LTE: Int;
    runtime_IN: [Int];
  }

  interface PersonFilter {
    [index: string];
    adult: Boolean;
    birthday_GT: Date;
    birthday_LT: Date;
    birthday_GTE: Date;
    birthday_LTE: Date;
    birthday_IN: [Date];
    deathday_GT: Date;
    deathday_LT: Date;
    deathday_GTE: Date;
    deathday_LTE: Date;
    deathday_IN: [Date];
    gender: Int;
    person_id: Int;
    popularity_GT: Float;
    popularity_LT: Float;
    popularity_GTE: Float;
    popularity_LTE: Float;
    popularity_IN: [Float];
  }

  interface PathArgs {
    first_person_id: Number;
    second_person_id: Number;
    filters?: {
      movie_filter?: MovieFilter;
      tv_filter?: TvFilter;
      person_filter?: PersonFilter;
    };
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
