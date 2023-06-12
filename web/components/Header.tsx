import React from "react";
import Image from "next/image";
import Link from "next/link";
function Header() {
  return (
    <div className="flex flex-col-reverse justify-center gap-5 bg-sky-700">
      <Link href="/" className="flex justify-center gap-5">
        <h1 className="self-center text-center text-2xl md:text-5xl">
          Six Degrees Of <br />
          Kevin Bacon
        </h1>
        <Image
          src="/HeaderImage.png"
          width={200}
          height={200}
          alt="Image of Kevin Bacon with arrows pointing to him"
          priority={true}
        ></Image>
      </Link>
      <div className="flex gap-5 self-end">
        <Link href="/about" className=" text-xl hover:text-red-600 md:text-3xl">
          About
        </Link>
        <Link
          href="https://github.com/SeanF7/Six-Degrees-Of-Kevin-Bacon-Capstone"
          className="text-xl hover:text-red-600 md:text-3xl"
        >
          Github
        </Link>
      </div>
    </div>
  );
}

export default Header;
