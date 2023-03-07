import { useQuery, gql } from "@apollo/client";
import { useState } from "react";
import React from "react";
// How to query for an image
// Grab first https://api.themoviedb.org/3/person/{person_id}/images?api_key=<<api_key>>
// https://image.tmdb.org/t/p/w45/2Dkx4uuGoWFrPSitxdikv9z5azR.jpg
const GET_SUGGESTIONS = gql`
  query SuggestedNames($name: String!) {
    suggestedNames(name: $name) {
      name
      image_path
      person_id
    }
  }
`;

function ActorInput() {
  const [first_person, setFirst_Person] = useState("");
  const [search, setsearch] = useState(false);
  const { loading, error, data } = useQuery(GET_SUGGESTIONS, {
    variables: { name: first_person },
  });

  const updateName = (e: any) => {
    setFirst_Person(e.target.value);
    if (e.target.value === "") {
      setsearch(false);
    } else {
      setsearch(true);
    }
  };
  const clickUpdateName = (name: string) => {
    setFirst_Person(name);
    setsearch(false);
  };

  return (
    <div className="flex flex-col w-56">
      <input
        type="text"
        placeholder="Tom Cruise"
        value={first_person}
        onChange={updateName}
        className="border-2 border-stone-700"
      ></input>
      <div>
        {data &&
          search &&
          data.suggestedNames.map(({ name, image_path, person_id }: any) => (
            <div
              key={person_id}
              onClick={() => clickUpdateName(name)}
              className="flex items-center border-stone-700 border-2 w"
            >
              {image_path ? (
                <img src={`https://image.tmdb.org/t/p/w45${image_path}`}></img>
              ) : (
                <img src="person.png"></img>
              )}
              <h1 className="font-bold">{name}</h1>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ActorInput;
