import React, { useState } from "react";
import Image from "next/image";

function Results({ data }: any) {
  const [index, setIndex] = useState(0);
  let first_person = data.find_path[index];
  let second_person = data.find_path[index + 1];
  let people = [first_person, second_person];
  let connection_count = data.find_path.length / 2;

  const go_right = () => {
    if (index < data.find_path.length - 2) {
      setIndex(index + 2);
    }
    return;
  };
  const go_left = () => {
    if (index > 0) {
      setIndex(index - 2);
    }
    return;
  };

  return (
    <div className="mt-12 rounded-2xl border-8 border-slate-700 bg-slate-700">
      <div className="flex justify-items-center">
        {people.map(
          (
            { person, relationship, project }: PersonWithRelationships,
            index: number
          ) => {
            let part =
              "character" in relationship
                ? relationship.character
                : relationship.job;
            let poster =
              "poster_path" in project
                ? project.poster_path
                : project.parent_show?.poster_path;
            let reverse = index === 1 ? "flex-row-reverse" : "";
            return (
              <>
                <div className={`flex ${reverse} lg:gap-5`}>
                  <div className="flex w-12 flex-col items-center justify-center md:w-32 lg:w-auto">
                    {person.image_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${person.image_path}`}
                        alt={`Image of  ${person.name}`}
                        width={100}
                        height={75}
                      ></Image>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-16 w-12 md:h-24 md:w-24 lg:h-36 lg:w-36"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <h3 className="text-center md:text-3xl lg:w-52">
                      {person.name}
                    </h3>
                  </div>
                  <div className="md:w-18 mx-3 flex w-12 flex-col items-center justify-center lg:w-20">
                    <p className="text-xs lg:text-base">
                      {part ? part : "Job not found"}
                    </p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="md:h-18 md:w-18 h-12 w-12 lg:h-24 lg:w-24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                      />
                    </svg>
                  </div>
                </div>
                {index % 2 === 0 && (
                  <div className="flex w-24 flex-col items-center md:w-52 lg:w-max lg:px-10">
                    {poster ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w154${poster}`}
                        alt={`Poster for ${project.title}`}
                        width={154}
                        height={138}
                      ></Image>
                    ) : (
                      <Image
                        src="/QuestionMark.png"
                        alt={`No poster found for ${project.title}`}
                        width={154}
                        height={138}
                      ></Image>
                    )}
                    <div className="min-h-[3rem]">
                      <p className="text-center">{project.title}</p>
                      {"parent_show" in project && (
                        <p className="text-center">
                          {project.parent_show?.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            );
          }
        )}
      </div>
      <div className="flex justify-center gap-5 lg:pt-4">
        <button
          onClick={go_left}
          className="h-6 w-6 rounded-md bg-slate-500 lg:h-12 lg:w-12"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 lg:h-12 lg:w-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
            />
          </svg>
        </button>
        <div className="flex items-center gap-1">
          {Array.from(Array(connection_count), (e, i) => {
            let color = i === index / 2 ? "bg-black" : "bg-slate-500";
            return (
              <div
                key={i}
                className={`h-6 w-6 rounded-sm ${color} flex items-center justify-center text-center align-middle text-xs text-white`}
                onClick={() => setIndex(2 * i)}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
        <button
          onClick={go_right}
          className="h-6 w-6 rounded-md bg-slate-500 lg:h-12 lg:w-12"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 lg:h-12 lg:w-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Results;
