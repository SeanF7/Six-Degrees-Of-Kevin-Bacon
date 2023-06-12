import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import { ApolloClient, InMemoryCache } from "@apollo/client";
const client = new ApolloClient({
  uri: process.env.GRAPHQL_URL,
  cache: new InMemoryCache(),
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
