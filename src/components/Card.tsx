import React from "react";
import Link from "next/link";

interface Props {
  title: string;
  description: string;
  link: string;
}

const CardNoButton: React.FC<Props> = (props: Props) => {
  return (
    <Link
      href={props.link}
      className="block max-w-sm rounded-lg border border-gray-700 bg-gray-800 p-10 shadow hover:bg-gray-700 "
    >
      <h5 className="mb-2 text-center text-4xl font-extrabold tracking-tight text-white">
        {props.title}
      </h5>
      <p className="font-bold text-gray-400">{props.description}</p>
    </Link>
  );
}

export default CardNoButton;
