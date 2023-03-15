import React from "react";
import ActorInput from "../components/ActorInput";
import { useState } from "react";
import { useLazyQuery, gql } from "@apollo/client";
const GET_PATH = gql`
  query Paths($first_person_id: String!, $second_person_id: String!) {
    shortestPath(
      first_person: $first_person_id
      second_person: $second_person_id
    ) {
      ... on Person {
        __typename
        name
        image_path
      }
      ... on Movie {
        __typename
        title
        poster_path
      }

      ... on TvEpisode {
        __typename
        title
        parent_show {
          name
          poster_path
        }
      }
    }
  }
`;

function SearchPaths() {
  const [first_person, setFirst_Person] = useState("");
  const [second_person, setSecond_Person] = useState("");
  const [getPaths, { loading, error, data }] = useLazyQuery(GET_PATH);

  const handleForm = (e: React.FormEvent) => {
    getPaths({
      variables: {
        second_person_id: first_person,
        first_person_id: second_person,
      },
    });
    e.preventDefault();
  };

  return (
    <div className="flex justify-center flex-col text-center bg-sky-700">
      <h1 className="text-4xl">Find the shortest path from</h1>
      <div className="flex p-10 flex-col items-center">
        <form onSubmit={handleForm} className="flex flex-col gap-6">
          <div className="flex gap-9">
            <ActorInput setPersonID={setFirst_Person} />
            <p className="text-3xl self-center">to</p>
            <ActorInput setPersonID={setSecond_Person} />
          </div>
          <button
            type="submit"
            onClick={handleForm}
            className="bg-red-500 rounded-md p-2 w-3/12 h-16 self-center text-white border-2 border-red-500 hover:bg-white hover:text-red-500 text-3xl"
          >
            Search
          </button>
        </form>
        {loading ? (
          <div className="flex items-center justify-center pt-20">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        ) : (
          <div>
            {data &&
              data.shortestPath.map(
                ({
                  __typename,
                  name,
                  title,
                  image_path,
                  poster_path,
                  parent_show,
                }: any) => {
                  if (__typename === "TvEpisode") {
                    return (
                      <div key={title} className="flex">
                        <p>{title}</p>
                        {image_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92/${parent_show.poster_path}`}
                          ></img>
                        ) : (
                          <img src="QuestionMark.png"></img>
                        )}
                      </div>
                    );
                  } else if (__typename === "Person") {
                    return (
                      <div key={name} className="flex">
                        <p>{name}</p>
                        {image_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${image_path}`}
                          ></img>
                        ) : (
                          <img src="person.png"></img>
                        )}
                      </div>
                    );
                  } else if (__typename === "Movie") {
                    return (
                      <div key={title} className="flex">
                        <p>{title}</p>
                        {poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92/${poster_path}`}
                          ></img>
                        ) : (
                          <img src="QuestionMark.png"></img>
                        )}
                      </div>
                    );
                  }
                }
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPaths;
