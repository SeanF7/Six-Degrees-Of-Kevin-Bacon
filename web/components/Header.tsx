import React from "react";
import Image from "next/image";
import Link from "next/link";
function Header() {
  return (
    <div className="flex justify-center bg-sky-700">
      <div className="flex gap-5 ">
        <h1 className="text-5xl text-center self-center">
          Six Degrees Of <br />
          Kevin Bacon
        </h1>
        <Image
          src="HeaderImage.png"
          width={200}
          height={200}
          alt="Image of Kevin Bacon with arrows pointing to him"
        ></Image>
      </div>
      <div className="absolute top-2 right-5 flex gap-5">
        <Link href="/about" className="text-3xl hover:text-red-600">
          About
        </Link>
        <div className="border-r-2 border-white h-10"></div>
        <Link
          href="https://github.com/SeanF7/Six-Degrees-Of-Kevin-Bacon-Capstone"
          className="text-3xl hover:text-red-600"
        >
          Github
        </Link>
      </div>
    </div>
  );
}

export default Header;
