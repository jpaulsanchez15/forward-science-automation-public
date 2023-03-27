import React from "react";
import Head from "next/head";
import CardNoButton from "../../components/Card";
import Question from "../../components/Question";
import QuestionModal from "../../components/QuestionModal";

const Orders = () => {
  const [question, showQuestion] = React.useState(false);

  return (
    <>
      <Head>
        <title>Forward Science | Aspen</title>
        <meta name="description" content="Generated by create-t3-app" />
      </Head>
      <h1 className="mt-4 text-center text-3xl font-bold tracking-tight text-white">
        Aspen Order Page
      </h1>
      <div className="mt-24 flex flex-row items-center justify-center gap-12">
        <CardNoButton
          title="Create"
          description="Create orders for Aspen."
          link="/aspen/create"
        />
        <CardNoButton
          title="Fulfill"
          description="Process Aspen orders."
          link="/aspen/fulfill"
        />
      </div>
      <div className="absolute bottom-0 right-0">
        <Question toggle={() => showQuestion((question) => !question)} />
      </div>
      {question ? (
        <QuestionModal
          isVisible={question}
          title="Aspen Order Page"
          desc={<div>{/* FAQ INFO HERE COMMENTED OUT FOR PRIVACY */}</div>}
          close={() => showQuestion((question) => !question)}
        />
      ) : null}
    </>
  );
};
export default Orders;
