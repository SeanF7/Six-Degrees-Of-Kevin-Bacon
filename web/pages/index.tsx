import Header from "@/components/Header";
import Head from "next/head";
import SearchPaths from "../components/SearchPaths";

export default function Home() {
  return (
    <div className="flex flex-col">
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
      <SearchPaths />
    </div>
  );
}
