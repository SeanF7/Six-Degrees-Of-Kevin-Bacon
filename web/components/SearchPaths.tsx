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
      }
      ... on Movie {
        __typename
        title
      }

      ... on TvShow {
        __typename
        name
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
      <div className="flex justify-center p-10">
        <form onSubmit={handleForm} className="flex flex-col gap-6">
          <div className="flex gap-9">
            <ActorInput setPersonID={setFirst_Person} />
            <p className="text-3xl self-center">to</p>
            <ActorInput setPersonID={setSecond_Person} />
          </div>
          <button
            type="submit"
            onClick={handleForm}
            className="bg-red-500 rounded-md p-2 w-2/12 self-center text-white border-2 border-red-500 hover:bg-white hover:text-red-500"
          >
            Search
          </button>
        </form>
        {loading ? (
          <div className="flex items-center justify-center">
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
              data.shortestPath.map(({ __typename, name, title }: any) =>
                __typename === "Movie" ? (
                  <div key={title}>
                    <h1 className="font-bold">{__typename}</h1>
                    <p>{title}</p>
                  </div>
                ) : (
                  <div key={name}>
                    <h1 className="font-bold">{__typename}</h1>
                    <p>{name}</p>
                  </div>
                )
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPaths;
