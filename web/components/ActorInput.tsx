import { useQuery, gql } from "@apollo/client";
import { useState, useEffect } from "react";
import React from "react";
import Image from "next/image";
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
  const clickUpdate = (name: string, id: number) => {
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
        className="h-16 w-56 rounded-lg border-2 border-stone-700 text-center text-xl focus:border-red-500 focus:outline-none md:w-72 md:text-2xl lg:w-96 lg:text-3xl"
        // Deals with focus loss but causing issues with clicking on suggestions
        // onBlur={() => setSearch(false)}
      ></input>
      {data?.suggestedNames.length > 0 && (
        <ul className="absolute mt-16 grid grid-rows-5 bg-white outline-none outline-4 -outline-offset-2 outline-stone-700">
          {data.suggestedNames.map(
            ({ name, image_path, person_id }: any, index: number) => (
              <li
                key={person_id}
                onClick={() => clickUpdate(name, person_id)}
                className="flex h-16 w-56 items-center border-y-2 border-stone-700 p-2 py-10 text-center text-xl outline-none hover:bg-stone-600 focus:bg-stone-600 lg:w-96 lg:text-3xl "
                tabIndex={index}
              >
                {image_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w45${image_path}`}
                    alt={`Image of  ${name}`}
                    className="h-16 w-11"
                    sizes="(max-width: 45px) 45px, 45px"
                    width={45}
                    height={68}
                  ></Image>
                ) : (
                  <Image
                    src="/person.png"
                    sizes="(max-width: 45px) 45px, 45px"
                    className="h-16 w-11"
                    alt="No person image found"
                    width={45}
                    height={68}
                  ></Image>
                )}
                <h1 className="pl-2 font-bold">{name}</h1>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

export default ActorInput;
