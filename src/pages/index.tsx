import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Head from "next/head";
import LoadingCircle from "../components/LoadingCircle";
import CardNoButton from "../components/Card";

const Home: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push("/api/auth/signin");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center">
        <LoadingCircle />
      </div>
    );
  }

  const firstName =
    session?.user?.name?.substring(0, session?.user?.name?.indexOf(" ")) ??
    "User";

  return (
    <>
      <Head>
        <title>Forward Science | Automation</title>
        <meta
          name="description"
          content="Forward Science Automation Application"
        />
      </Head>
      <h1 className="mt-4 py-2 text-center text-4xl font-extrabold tracking-tight text-white">
        <span className="block">Welcome, </span>
        <span className="block bg-gradient-to-r from-gray-500 to-white bg-clip-text text-6xl text-transparent">
          {firstName}!
        </span>
      </h1>
      <div className="mt-24 flex flex-row items-center justify-center gap-12">
        <CardNoButton
          title="Shopify"
          description="View and process Shopify orders."
          link="/shopify"
        />
        <CardNoButton
          title="Aspen"
          description="Create and process Aspen orders."
          link="/aspen"
        />
      </div>
    </>
  );
};

export default Home;
