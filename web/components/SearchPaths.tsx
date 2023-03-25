import React from "react";
import ActorInput from "../components/ActorInput";
import { useState } from "react";
import { useLazyQuery, gql } from "@apollo/client";
import Results from "./Results";
const GET_PATH = gql`
  query Query($first_person_id: Int!, $second_person_id: Int!) {
    find_path(
      first_person_id: $first_person_id
      second_person_id: $second_person_id
    ) {
      person {
        name
        image_path
      }
      relationship {
        ... on crewObj {
          job
        }
        ... on castObj {
          character
        }
      }
      project {
        ... on Movie {
          title
          poster_path
        }
        ... on TvEpisode {
          title
          parent_show {
            poster_path
            name
          }
        }
      }
    }
  }
`;

function SearchPaths() {
  const [first_person, setFirst_Person] = useState(0);
  const [second_person, setSecond_Person] = useState(0);
  const [getPaths, { loading, error, data }] = useLazyQuery(GET_PATH);

  const handleForm = (e: React.FormEvent) => {
    getPaths({
      variables: {
        first_person_id: first_person,
        second_person_id: second_person,
      },
    });
    e.preventDefault();
  };
  return (
    <div className="flex flex-col justify-center bg-sky-700 text-center">
      <h1 className="text-4xl">Find the shortest path from</h1>
      <div className="flex flex-col items-center p-10">
        <form onSubmit={handleForm} className="flex flex-col gap-6">
          <div className="flex gap-9">
            <ActorInput setPersonID={setFirst_Person} />
            <p className="self-center text-3xl">to</p>
            <ActorInput setPersonID={setSecond_Person} />
          </div>
          <button
            type="submit"
            onClick={handleForm}
            className="h-16 w-3/12 self-center rounded-md border-2 border-red-500 bg-red-500 p-2 text-3xl text-white hover:bg-white hover:text-red-500"
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
          <div className="justify-center align-middle">
            {data ? <Results data={data} /> : <p>no data</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPaths;
