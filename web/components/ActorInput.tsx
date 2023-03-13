import { useQuery, gql } from "@apollo/client";
import { useState, useEffect, useRef } from "react";
import React from "react";
const GET_SUGGESTIONS = gql`
  query SuggestedNames($name: String!) {
    suggestedNames(name: $name) {
      name
      image_path
      person_id
    }
  }
`;

// Find a better way to populate random actors
let actors: string[] = [
  "Tom Cruise",
  "Tom Holland",
  "Johnny Depp",
  "Robery Downey Jr.",
  "Jenna Ortega",
  "Zendaya",
  "Selena Gomez",
];
interface Props {
  setPersonID: Function;
}
function ActorInput({ setPersonID }: Props) {
  const [person, setPerson] = useState("");
  const [placeHolder, setPlaceHolder] = useState("");
  const [search, setSearch] = useState(false);
  const { loading, error, data } = useQuery(GET_SUGGESTIONS, {
    variables: { name: person },
    skip: !search || person === "",
  });

  const updateName = (e: any) => {
    setPerson(e.target.value);
    if (e.target.value === "") {
      setSearch(false);
    } else {
      setSearch(true);
    }
    if (data?.suggestedNames.length > 0) {
      setPersonID(data.suggestedNames[0].person_id);
    }
  };
  const clickUpdate = (name: string, id: string) => {
    setPerson(name);
    setPersonID(id);
    setSearch(false);
  };

  useEffect(() => {
    setPlaceHolder(actors[Math.floor(Math.random() * actors.length)]);

    const interval = setInterval(
      () => setPlaceHolder(actors[Math.floor(Math.random() * actors.length)]),
      2000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleArrows = (e: any) => {
    let element = document.activeElement as HTMLElement;
    console.log(element.nextElementSibling?.childNodes);
    if (e.keyCode === 40) {
      (element.nextElementSibling as HTMLElement)?.focus();
    } else if (e.keyCode === 38) {
      (element.previousElementSibling as HTMLElement)?.focus();
    } else if (e.keyCode === 13) {
      element?.click();
    }
  };
  return (
    <div onKeyDown={handleArrows} className="flex flex-col">
      <input
        type="text"
        placeholder={placeHolder}
        value={person}
        onChange={updateName}
        className="w-96 h-16 rounded-lg border-2 border-stone-700 focus:outline-none focus:border-red-500 text-3xl text-center"
        // Deals with focus loss but causing issues with clicking on suggestions
        // onBlur={() => setSearch(false)}
      ></input>
      {data &&
        data.suggestedNames.map(
          ({ name, image_path, person_id }: any, index: number) => (
            <li
              key={person_id}
              onClick={() => clickUpdate(name, person_id)}
              className="flex items-center border-stone-700 border-2 border-stone-700 rounded-lg w-96 h-16 bg-sky-700 text-3xl text-center"
              tabIndex={index}
            >
              {image_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w45${image_path}`}
                  className="overflow-hidden"
                ></img>
              ) : (
                <img src="person.png"></img>
              )}
              <h1 className="font-bold">{name}</h1>
            </li>
          )
        )}
    </div>
  );
}

export default ActorInput;
