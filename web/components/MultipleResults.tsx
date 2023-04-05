import React from "react";
import SingleResult from "./SingleResult";

interface Props {
  paths: Array<PersonWithRelationships>;
}

export default function MultipleResults({ paths }: Props) {
  return (
    <div className="grid grid-cols-1 gap-x-9 md:grid-cols-2 lg:grid-cols-3">
      {paths.slice(1).map((path: any, index: number) => (
        <SingleResult key={index} data={{ find_path: path }} />
      ))}
    </div>
  );
}
