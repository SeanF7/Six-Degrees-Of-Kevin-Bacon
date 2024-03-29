import React from "react";
import ActorInput from "../components/ActorInput";
import { useState, useEffect } from "react";
import { useLazyQuery, gql } from "@apollo/client";
import SingleResult from "./SingleResult";
import SearchSettings from "./SearchSettings";
import MultipleResults from "./MultipleResults";

const GET_PATH = gql`
  query Query(
    $first_person_id: Int!
    $second_person_id: Int!
    $filters: PathFilters
  ) {
    find_path(
      first_person_id: $first_person_id
      second_person_id: $second_person_id
      filters: $filters
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

const GET_PATHS = gql`
  query Query(
    $first_person_id: Int!
    $second_person_id: Int!
    $filters: PathFilters
    $max_depth: Int
  ) {
    find_paths(
      first_person_id: $first_person_id
      second_person_id: $second_person_id
      filters: $filters
      max_depth: $max_depth
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
  const [filters, setFilters] = useState();
  const [getPath, { loading, error, data }] = useLazyQuery(GET_PATH);
  const [getPaths, { loading: multipleLoading, data: multipleData }] =
    useLazyQuery(GET_PATHS);

  useEffect(() => {
    if (data && data.find_path.length > 0) {
      getPaths({
        variables: {
          first_person_id: first_person,
          second_person_id: second_person,
          filters: filters,
          max_depth: data.find_path.length,
        },
      });
    }
  }, [data]);

  const handleForm = (e: React.FormEvent) => {
    getPath({
      variables: {
        first_person_id: first_person,
        second_person_id: second_person,
        filters: filters,
      },
    });
    e.preventDefault();
  };

  return (
    <div className="flex flex-col justify-center bg-sky-700 text-center">
      <h1 className="pb-5 text-2xl md:text-4xl">Find the shortest path from</h1>
      <div className="flex flex-col items-center">
        <form onSubmit={handleForm} className="flex flex-col gap-6">
          <div className="gap-2 md:flex">
            <ActorInput setPersonID={setFirst_Person} />
            <p className="self-center text-3xl">to</p>
            <ActorInput setPersonID={setSecond_Person} />
          </div>
          <div className="flex items-center justify-center gap-5">
            <button
              type="submit"
              onClick={handleForm}
              className="w-26 h-16 self-center rounded-md border-2 border-red-500 bg-red-500 p-2 text-3xl text-white hover:bg-white hover:text-red-500 md:w-56"
            >
              Search
            </button>
          </div>
          {/* Removed as a good design did not come to mind
          <SearchSettings setFilters={setFilters} /> */}
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
          <>{data && <SingleResult data={data} />}</>
        )}
        {multipleLoading ? (
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
          <>
            {multipleData?.find_paths && (
              <MultipleResults paths={multipleData.find_paths} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchPaths;
