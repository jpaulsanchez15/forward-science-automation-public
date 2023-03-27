import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatAspenOrder } from "../../../utils/ordoro/index";
import { useSession } from "next-auth/react";

import LoadingCard from "../../../components/LoadingCard";
import Checkmark from "../../../components/Checkmark";
import XMark from "../../../components/XMark";
import LoadingCircle from "../../../components/LoadingCircle";
import Question from "../../../components/Question";
import QuestionModal from "../../../components/QuestionModal";
import Head from "next/head";

interface Order {
  id: string;
  orderNumber: string;
  price: number;
  therastom: number;
  oxistom: number;
  salivamax: number;
  oralid: number;
  accessories: number;
  fulfilled: boolean;
  officeName: string;
  createdAt: string;
  ordoroLink: string;
  order_date: string;
  user: string;
  createdBy: string;
}

interface ItemList {
  value: number;
  name: string;
}

const CaughtUp = () => {
  return (
    <div className="mt-11 text-center text-lg text-black/25">
      All caught up!
    </div>
  );
};

const getOrders = async () => {
  const res = await fetch("/api/ordoro/aspen/getAspenOrders", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([] as Order[]);
  const [loading, isLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<boolean>(false);
  const [question, showQuestion] = useState<boolean>(false);

  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push("/api/auth/signin");
    },
  });

  const firstName =
    session?.user?.name?.substring(0, session?.user?.name?.indexOf(" ")) ??
    "User";

  async function fetchData() {
    const data = (await getOrders()) || {};
    setOrders(data?.orders);
    isLoading(false);
  }

  const filteredOrders = orders.filter((order) => {
    if (!filter) {
      return order?.createdBy === firstName;
    } else if (filter) {
      return order;
    }
  });

  useEffect(() => {
    isLoading(true);
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Forward Science | Aspen Orders</title>
      </Head>

      <div>
        <h1 className="py-2 text-center text-xl font-bold text-white">
          {orders.length > 0 ? "Orders" : <CaughtUp />}
        </h1>
        {orders.length > 0 ? (
          <div className="mb-3 flex flex-row items-center justify-center gap-3">
            <button className="btn" onClick={() => setFilter(false)}>
              All unfulfilled orders made by {firstName}
            </button>
            <button className="btn" onClick={() => setFilter(true)}>
              All unfulfilled
            </button>
          </div>
        ) : null}
        <div>{loading ? <LoadingCard /> : null}</div>
        {filter ? (
          <div className="grid grid-cols-7 gap-0">
            {orders
              ?.sort((a, b) =>
                a.order_date > b.order_date
                  ? 1
                  : b.order_date > a.order_date
                  ? -1
                  : 0
              )
              .map((order) => {
                return <Orders key={order.id} order={order} />;
              })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0">
            {filteredOrders
              ?.sort((a, b) =>
                a.order_date > b.order_date
                  ? 1
                  : b.order_date > a.order_date
                  ? -1
                  : 0
              )
              .map((order) => {
                return <Orders key={order.id} order={order} />;
              })}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0">
        <Question toggle={() => showQuestion((question) => !question)} />
      </div>
      {question ? (
        <QuestionModal
          isVisible={question}
          title="Aspen Fulfill Page"
          desc={<div>{/* FAQ INFO HERE COMMENTED OUT FOR PRIVACY */}</div>}
          close={() => showQuestion((question) => !question)}
        />
      ) : null}
    </>
  );
}

const Orders = ({ order }: { order: Order }) => {
  const {
    orderNumber,
    price: orderPrice,
    therastom,
    oxistom,
    salivamax,
    oralid,
    accessories,
    officeName: office,
    createdAt: orderDate,
    createdBy,
  } = order || {};

  const router = useRouter();

  const [processing, isProcessing] = useState<boolean>(false);
  const [processed, isProcessed] = useState<boolean>(false);

  const items = [
    { name: "TheraStom", sku: "TS-16-12", value: therastom },
    { name: "OxiStom", sku: "OX-13-6", value: oxistom },
    { name: "SalivaMAX", sku: "42029121142953", value: salivamax },
    { name: "OralID", sku: "FS-11", value: oralid },
    { name: "Accessories", sku: "IDFL-Custom", value: accessories },
  ];

  const shipLogItems = [
    { name: "TheraStom 12 pk", value: therastom },
    { name: "OxiStom 6 pk", value: oxistom },
    { name: "SalivaMAX 10 pk", value: salivamax },
    { name: "Space Grey OID Kit \n Follow BOM", value: oralid },
    // TODO: Accessories needs improvement
    { name: "Accessories", value: accessories },
  ];

  const listItems = items
    .filter((item) => item.value > 0)
    .map((item) => (
      <li className="ml-8" key={item.name}>{`${item.name}: ${item.value}`}</li>
    ));

  const lines = items
    .filter((item) => item.value > 0)
    .map((item) => {
      return {
        sku: item.sku,
        quantity: item.value,
      };
    });

  const handleCreateOrder = async () => {
    isProcessing(true);
    const res = await fetch("/api/ordoro/aspen/createAspenOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ orderNumber, orderPrice, office }),
    });
    const data = await res.json();

    isProcessing(false);

    router.refresh();

    return data;
  };

  const handleCreateLabel = async () => {
    isProcessing(true);
    const label = await formatAspenOrder(lines);

    const sugarOffice = await fetch(
      `/api/sugar/aspen/findAspenOffice?officeName=${office}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const sugarOfficeResponse = await sugarOffice.json();

    const officeId = sugarOfficeResponse[0].id;

    const labelCreated = await fetch("/api/ordoro/aspen/createAspenLabel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        num: order.ordoroLink,
        lines: label,
      }),
    });

    const labelCreatedResponse = await labelCreated.json();

    if (labelCreatedResponse?.message === "Order not found") {
      isProcessing(false);
      return alert(
        "The order hasn't been created in Ordoro yet. Please wait a couple of seconds to try again!"
      );
    } else if (labelCreatedResponse?.message === "Error creating label") {
      isProcessing(false);
      return alert(
        "Order timed out. There was an error completing the order. I think I still made the label, but just check the order in Ordoro and Sugar just to make sure."
      );
    } else {
      const listItemString = shipLogItems
        .filter((item) => item.value > 0)
        .map((item: ItemList) => {
          return `${item.value} x ${item.name}`;
        })
        .join("\n");

      const shipLog = await fetch("/api/sugar/aspen/createShipLog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          office: officeId,
          description: listItemString,
          name: labelCreatedResponse?.order?.trackingNumber,
          order_no: orderNumber,
          product_sales_total_c: orderPrice,
        }),
      });

      const shipLogResponse = await shipLog.json();

      isProcessed(true);
      isProcessing(false);

      // router.refresh();

      return shipLogResponse;
    }
  };

  const handleDeleteOrder = async () => {
    const res = await fetch("/api/ordoro/aspen/deleteAspenOrder", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderNumber }),
    });

    const data = await res.json();

    alert(
      "Order deleted! Please make sure if you processed the order, you delete it in Sugar and Ordoro as well."
    );

    router.refresh();

    return data;
  };

  return (
    <div className="relative p-2">
      <div className="max-w-sm rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-md">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
          Order Number: {orderNumber}
        </h1>
        <a
          rel="noopener noreferrer"
          target="_blank"
          className="text-l mb-2 font-bold tracking-tight text-green-400 hover:text-green-700"
          href={`https://abode.ordoro.com/label?$order=${order.ordoroLink}&docs=shippinglabel&layout=thermal&utcOffset=-360&template=51196&showLogoOnLabel=true`}
        >
          {order.ordoroLink == "" ? null : "Ordoro Label"}
        </a>
        <button
          className="absolute top-4 right-4 font-bold"
          onClick={handleDeleteOrder}
        >
          <XMark />
        </button>
        <p className="mb-3 font-normal text-gray-400 ">Office name: {office}</p>
        <p className="mb-3 font-normal text-gray-400 ">Total: ${orderPrice}</p>
        <ul className="mb-3 list-disc font-normal text-gray-400 ">
          {listItems}
        </ul>
        <button
          className={order.ordoroLink !== "" ? "" : "btn mb-3"}
          onClick={handleCreateOrder}
        >
          {order.ordoroLink !== "" ? null : "1: Create Order in Ordoro"}
        </button>{" "}
        <button
          className={processed ? "" : "btn mb-3"}
          onClick={handleCreateLabel}
        >
          {processed ? <Checkmark /> : "2: Process Order"}
        </button>
        <p className="mb-3 text-gray-400 ">{orderDate.slice(0, 10)}</p>
        <p className="mb-3 text-gray-400 ">{`Created by: ${createdBy}`}</p>
      </div>
      <div className="relative left-56 bottom-9 font-bold">
        {processing ? <LoadingCircle /> : null}
      </div>
    </div>
  );
};
