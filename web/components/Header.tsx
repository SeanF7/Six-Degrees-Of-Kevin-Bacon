import React from "react";
import Image from "next/image";
import Link from "next/link";
function Header() {
  return (
    <div className="flex flex-col-reverse justify-center gap-5 bg-sky-700">
      <div className="flex justify-center gap-5">
        <h1 className="self-center text-center text-2xl lg:text-5xl">
          Six Degrees Of <br />
          Kevin Bacon
        </h1>
        <Image
          src="/HeaderImage.png"
          width={200}
          height={200}
          sizes="(max-width: 200px) 100px, 100px"
          alt="Image of Kevin Bacon with arrows pointing to him"
          priority={true}
        ></Image>
      </div>
      <div className="flex gap-5 self-end lg:absolute lg:top-2">
        <Link href="/about" className=" text-xl hover:text-red-600 lg:text-3xl">
          About
        </Link>
        <Link
          href="https://github.com/SeanF7/Six-Degrees-Of-Kevin-Bacon-Capstone"
          className="text-xl hover:text-red-600 lg:text-3xl"
        >
          Github
        </Link>
      </div>
    </div>
  );
}

export default Header;
