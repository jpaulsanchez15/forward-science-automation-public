import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { env } from "../../env.mjs";
import { formatShopifyOrder } from "../../utils/ordoro/index";

import React from "react";
import Link from "next/link";
import Head from "next/head";

import LoadingCircle from "../../components/LoadingCircle";
import Checkmark from "../../components/Checkmark";
import Warning from "../../components/Warning";
import LoadingCard from "../../components/LoadingCard";
import Modal from "../../components/Modal";
import Tooltip from "../../components/Tooltip";
import Question from "../../components/Question";
import QuestionModal from "../../components/QuestionModal";

const SHOPIFY_STORE_URL = env.NEXT_PUBLIC_SHOPIFY_STORE_URL;

interface productDescriptionItems {
  quantity: number;
  product_name: string;
}

interface Line {
  sku: string;
  quantity: number;
  product_name: string;
  cart_order_id: string;
}

interface Order {
  order_number: string;
  order_placed_date: string;
  lines: Line[];
  shipping_address: {
    company: string | null;
    street1: string | null;
    phone: string | null | undefined;
  };
  financial: {
    product_amount: number;
    discount_amount: number;
  };
  customer: {
    note: string;
  };
  tags: string;
}

interface Office {
  id: string;
  name: string;
  street1: string;
  shipping_address_street: string;
  phone_office: string;
}

const CaughtUp = () => {
  return (
    <div className="mt-11 text-center text-lg text-black/25">
      All caught up!
    </div>
  );
};

export default function OrderPage() {
  const [orders, setOrders] = useState<object[]>([]);
  const [loading, isLoading] = useState<boolean>(false);

  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated: () => {
      router.push("/api/auth/signin");
    },
  });

  useEffect(() => {
    isLoading(true);
    (async () => {
      const res = await fetch("/api/ordoro/shopify/getUnfullfiledOrders");
      const data = await res.json();
      setOrders(data.length > 0 ? data : []);
      isLoading(false);
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Forward Science | Shopify Orders</title>
      </Head>

      <div>
        <div>{loading ? <LoadingCard /> : null}</div>
        <div>{!loading && orders.length == 0 ? <CaughtUp /> : null}</div>
        <div className="m-5 grid grid-cols-7 gap-4 pt-3">
          {orders?.map((order: any) => {
            return <Orders key={order.id} order={order} />;
          })}
        </div>
      </div>
    </>
  );
}

function Orders({ order }: { order: Order }) {
  const { order_number: orderNumber, order_placed_date: orderPlacedDate } =
    order || {};
  const [processing, isProcessing] = useState<boolean>(false);
  const [complete, isComplete] = useState<boolean>(false);
  const [ambassador, isAmbassador] = useState<boolean>(false);
  const [npi, isNpi] = useState<boolean>(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const [tracking, setTracking] = useState<string>("");
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [question, showQuestion] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const getShopifyInfo = async () => {
    const res = await fetch("/api/shopify", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return Promise.reject("Failed to fetch Shopify orders");
    } else {
      const orderNums = (await res.json()) ?? [];

      orderNums.forEach((order: Order) => {
        if (order.order_number == orderNumber.slice(2)) {
          const note = order.customer.note;
          const containsNpi = /\d/.test(note);
          isNpi(containsNpi);
          order.tags.includes("FS_Ambassador")
            ? isAmbassador(true)
            : isAmbassador(false);
        }
      });
    }
    return;
  };

  getShopifyInfo();

  async function createLabel() {
    const lines = await formatShopifyOrder(order.lines);

    const payload = {
      num: orderNumber,
      lines: lines,
      order: order.lines,
      ambassador: ambassador,
      npi: npi,
    };

    const res = await fetch("/api/ordoro/shopify/createShopifyLabel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    setTracking(data.tracking_number);
    isProcessing(false);
    isComplete(true);

    return data;
  }

  async function handleRetrieveSugarOfficeClick() {
    isProcessing(true);
    const { company, street1: address, phone } = order.shipping_address;

    const formattedPhone = phone?.replace(/\D/g, "");
    const formattedPhoneTwo = formattedPhone?.replace(
      /(\d{3})(\d{3})(\d{4})/,
      "$1-$2-$3"
    );

    try {
      const res = await fetch(
        `/api/sugar/shopify/findShopifyOffice?officeName=${company}&phone=${formattedPhoneTwo}&address=${address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.length > 0) {
        setOffices(data);
      } else {
        setOffices([]);
        isProcessing(false);
        setShowModal(false);
        setError("No offices found");
      }
    } catch (err) {
      console.error(err);
    }

    isProcessing(false);
    return;
  }

  const handleAddToSugarClick = async (id: string) => {
    offices.length = 0;
    isProcessing(true);

    const productDescription = order.lines
      .map((item: productDescriptionItems) => {
        return `${item.quantity} x ${item.product_name}`;
      })
      .join("\n");

    const price =
      order.financial.product_amount - order.financial.discount_amount;

    const res = await fetch("/api/sugar/shopify/createShipLog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        office: id,
        description: productDescription,
        name: tracking.toString(),
        order_no: order.order_number.slice(2),
        product_sales_total_c: price.toString(),
        ambassador,
      }),
    });

    const data = await res.json();

    isProcessing(false);
    return data;
  };

  return (
    <>
      <div className="shadow-ml relative max-w-sm rounded-lg border border-gray-700 bg-gray-800 p-8">
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={"" /* Commented out for privacy */}
          className="absolute top-0 right-0"
        >
          <h5 className="mb-2 mt-2 pr-3 text-2xl font-bold tracking-tight text-green-400 hover:text-green-700">
            Order: {orderNumber.slice(2)}
          </h5>
        </Link>

        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={`${SHOPIFY_STORE_URL}/${order.lines[0]?.cart_order_id}`}
          className="absolute top-0 left-0"
        >
          <h5 className="mb-2 mt-2 flex flex-row pl-3 text-right text-2xl font-bold tracking-tight text-white hover:text-gray-400">
            Shopify
          </h5>
        </Link>

        <div className="absolute bottom-0 right-0 font-bold">
          {npi ? "" : <Warning />}
        </div>

        <div className="absolute bottom-0 left-0 font-bold text-white ">
          {ambassador ? (
            <Tooltip text="This is a Forward Science Ambassador order!">
              <div>FSA!</div>
            </Tooltip>
          ) : (
            ""
          )}
        </div>

        <div className="absolute bottom-7 right-1 font-bold">
          {processing === false && ""}
          {processing === true && <LoadingCircle />}
          {!processing && complete && <Checkmark />}
        </div>

        <section className="mb-4 mt-3 font-normal text-gray-400">
          <ul className="list-disc p-3">
            {order.lines.map((line: Line) => (
              <li
                key={line.sku}
              >{`${line.quantity} x ${line.product_name}`}</li>
            ))}
          </ul>
          <p className="mt-3">
            Total: $
            {order.financial.product_amount - order.financial.discount_amount}
          </p>
          <p>Date Placed: {orderPlacedDate.slice(0, 10)}</p>
        </section>

        {!processing && !complete && (
          <button
            onClick={() => {
              isProcessing(true);
              createLabel();
            }}
            className="btn"
          >
            Automate Order
            <svg
              aria-hidden="true"
              className="ml-2 -mr-1 h-4 w-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            ></svg>
          </button>
        )}
        {!processing && complete && selectedOffice.length == 0 && (
          <button
            className="btn"
            onClick={() => {
              isProcessing(true);
              handleRetrieveSugarOfficeClick();
              setShowModal(true);
            }}
          >
            Add to Sugar
            <svg
              aria-hidden="true"
              className="ml-2 -mr-1 h-4 w-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            ></svg>
          </button>
        )}
        {offices.length > 0 ? (
          <Modal
            isVisible={showModal}
            title={orderNumber}
            // Add something that shows the office information on a side panel
            // for easier selection
            offices={offices.map((office) => {
              return (
                <div key={office.id} className="flex flex-col">
                  <button
                    onClick={() => setSelectedOffice(office.id)}
                    className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    <ul className="ml-2 list-disc p-2 text-left">
                      <li key={office.name}>Office: {office.name}</li>
                      <li key={office.shipping_address_street}>
                        Address: {office.shipping_address_street}
                      </li>
                      <li key={office.phone_office}>
                        Phone: {office.phone_office}
                      </li>
                    </ul>
                  </button>
                </div>
              );
            })}
            accept={() => {
              setShowModal(false);
              handleAddToSugarClick(selectedOffice);
            }}
            close={() => setShowModal(false)}
          />
        ) : null}
        {error != "" ? (
          <div>
            <h1 className="font-extrabold text-white">
              {/* Commented out for privacy */}
            </h1>
          </div>
        ) : null}
      </div>
      <div className="absolute bottom-0 right-0">
        <Question toggle={() => showQuestion((question) => !question)} />
      </div>
      {question ? (
        <QuestionModal
          isVisible={question}
          title="Shopify Order Page"
          desc={<div>{/* Commented out for privacy */}</div>}
          close={() => showQuestion((question) => !question)}
        />
      ) : null}
    </>
  );
}
