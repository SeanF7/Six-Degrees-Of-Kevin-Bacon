import React from "react";

function Header() {
  return (
    <div className="flex justify-center bg-sky-700 align-middle gap-10">
      <h1 className="text-5xl text-center self-center ml-auto">
        Six Degrees Of <br />
        Kevin Bacon
      </h1>
      <img src="HeaderImage.png" width="200"></img>
      <div className="flex gap-10 ml-auto">
        <a href="">About</a>
        <a href="">Github</a>
      </div>
    </div>
  );
}

export default Header;
