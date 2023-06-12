import React from "react";
import Head from "next/head";
import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";

function about() {
  return (
    <div className="bg-sky-700">
      <Head>
        <title>Six Degrees Of Kevin Bacon</title>
        <meta
          name="description"
          content="Find the shortest path between 2 people in hollywood."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="flex w-1/2 flex-col items-center">
        <p className="w-1/4">
          This website was originally created as a capstone project for my
          bachelor&apos;s degree in computer science. The goal of the project
          was to create a website that would allow users to find the shortest
          path between 2 actors in hollywood. It was created using data from{" "}
          <Link href="https://www.themoviedb.org/"> The Movie Database</Link>
        </p>

        <Link href="https://www.themoviedb.org/">
          <Image
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
            alt="The Movie Database"
            width={200}
            height={200}
          />
        </Link>
      </div>
    </div>
  );
}

export default about;
