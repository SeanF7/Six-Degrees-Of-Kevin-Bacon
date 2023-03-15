import React from "react";

function Header() {
  return (
    <div className="flex justify-center bg-sky-700">
      <div className="flex gap-5 ">
        <h1 className="text-5xl text-center self-center">
          Six Degrees Of <br />
          Kevin Bacon
        </h1>
        <img src="HeaderImage.png" width="200"></img>
      </div>
      <div className="absolute top-2 right-5 flex gap-5">
        <a href="/about" className="text-3xl hover:text-red-600">
          About
        </a>
        <div className="border-r-2 border-white h-10"></div>
        <a
          href="https://github.com/SeanF7/Six-Degrees-Of-Kevin-Bacon-Capstone"
          className="text-3xl hover:text-red-600"
        >
          Github
        </a>
      </div>
    </div>
  );
}

export default Header;
