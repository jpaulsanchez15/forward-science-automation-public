import Link from "next/link";
import React from "react";
import Image from "next/image";

const Navbar: React.FC = () => {
  return (
    <div>
      <nav className="border-gray-200 bg-gray-900 px-2 py-2.5 sm:px-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src={"/logo.png"}
              alt="fs-logo"
              className="px-4"
              width={32}
              height={32}
            ></Image>
          </Link>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="ml-3 inline-flex items-center rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600  md:hidden"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="mt-4 flex flex-col rounded-lg border border-gray-800 bg-gray-900 p-4 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:text-sm md:font-medium">
              <li>
                <Link
                  href="/aspen"
                  className="block rounded py-2 pl-3 pr-4 text-gray-400 hover:bg-gray-900  hover:text-white md:border-0 md:p-0 "
                  aria-current="page"
                >
                  Aspen
                </Link>
              </li>
              <li>
                <Link
                  href="/shopify"
                  className="block rounded py-2 pl-3 pr-4 text-gray-400 hover:bg-gray-900  hover:text-white md:border-0 md:p-0 "
                >
                  Shopify
                </Link>
              </li>
              <li>
                <a
                  href="/faq"
                  className="block rounded py-2 pl-3 pr-4 text-gray-400 hover:bg-gray-900  hover:text-white md:border-0 md:p-0 "
                >
                  FAQ
                </a>
              </li>
              {/* <li>
                <a
                  href="/orders"
                  className="block rounded py-2 pl-3 pr-4 text-gray-400 hover:bg-gray-900  hover:text-white md:border-0 md:p-0 "
                >
                  All Orders
                </a>
              </li> */}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
