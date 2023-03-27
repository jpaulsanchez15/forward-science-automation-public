import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import Head from "next/head";
import Question from "../../../components/Question";
import QuestionModal from "../../../components/QuestionModal";

interface Office {
  name: string;
  Suggestion: Suggestion[];
}

interface Suggestion {
  name: string;
  id: string;
  shipping_address_street: string;
}

const debounceValue = (value: string, time = 250) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, time);

    return () => {
      clearTimeout(handler);
    };
  }, [value, time]);

  return debouncedValue;
};

export default function CreateOrder() {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentOffice, setCurrentOffice] = useState<string>("");
  const [question, showQuestion] = useState(false);
  const [loading, isLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    orderNumber: "",
    office: [] as Office[],
    price: 0,
    therastom: 0,
    oxistom: 0,
    salivamax: 0,
    oralid: 0,
    accessories: 0,
  });

  const debouncedQuery = debounceValue(query);

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

  const createOrder = async () => {
    const res = await fetch("/api/ordoro/aspen/addOrderToDb", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        firstName,
        userId: session?.user.id,
      }),
    });

    if (!res.ok) {
      alert(
        "Error creating order. \nPlease make sure you add an office! \nResetting form..."
      );
      return;
    }

    setForm({
      orderNumber: "",
      office: [] as Office[],
      price: 0,
      therastom: 0,
      oxistom: 0,
      salivamax: 0,
      oralid: 0,
      accessories: 0,
    });
    setQuery("");

    router.refresh();
  };

  const handleUpdatePrice = () => {
    // Calculate the total price here and update the state of the price field
    const totalPrice =
      form.therastom * 63.0 +
      form.oxistom * 25.5 +
      form.salivamax * 110.0 +
      form.oralid * 1200.0 +
      form.accessories * 20.0;
    setForm({ ...form, price: totalPrice });
  };

  useEffect(() => {
    (async () => {
      setSuggestions([]);
      setError("");
      if (debouncedQuery.length > 0) {
        isLoading(true);
        const res = await fetch(
          `/api/sugar/aspen/findAspenOffice?officeName=${debouncedQuery}`,
          {
            method: "GET",
          }
        );

        if (!res.ok) {
          isLoading(false);
          setSuggestions([]);
          setError("No results found.");
          return;
        }

        const data = await res.json();

        setSuggestions(data);
        isLoading(false);
        return;
      }
    })();
  }, [debouncedQuery]);

  return (
    <>
      <Head>
        <title>Forward Science | Create Aspen Order</title>
      </Head>

      <div>
        <form
          className="flex flex-col items-center 
              justify-center p-5"
          onSubmit={createOrder}
        >
          <div className="flex items-center space-x-1 py-2">
            <input
              className="label"
              type="search"
              placeholder="Office"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <input
              className="label"
              type="text"
              required
              placeholder="Order Number"
              value={form.orderNumber}
              onChange={(e) =>
                setForm({ ...form, orderNumber: e.target.value })
              }
            />
            <input
              className="label cursor-not-allowed"
              type="text"
              placeholder="Order Price"
              value={form.price || ""}
              readOnly
            />
          </div>
          <div className="flex items-center space-x-1 py-2">
            <input
              className="label "
              type="number"
              min="0"
              placeholder="TheraStom"
              value={form.therastom || ""}
              onChange={(e) =>
                setForm({ ...form, therastom: e.target.valueAsNumber })
              }
              onBlur={handleUpdatePrice}
            />
            <input
              className="label"
              type="number"
              min="0"
              placeholder="OxiStom"
              value={form.oxistom || ""}
              onChange={(e) =>
                setForm({ ...form, oxistom: e.target.valueAsNumber })
              }
              onBlur={handleUpdatePrice}
            />
            <input
              className="label"
              min="0"
              type="number"
              placeholder="SalivaMAX"
              value={form.salivamax || ""}
              onChange={(e) =>
                setForm({ ...form, salivamax: e.target.valueAsNumber })
              }
              onBlur={handleUpdatePrice}
            />
            <input
              className="label"
              min="0"
              type="number"
              placeholder="OralID"
              value={form.oralid || ""}
              onChange={(e) =>
                setForm({ ...form, oralid: e.target.valueAsNumber })
              }
              onBlur={handleUpdatePrice}
            />
            <input
              className="label"
              min="0"
              type="number"
              placeholder="Accessories"
              value={form.accessories || ""}
              onChange={(e) =>
                setForm({ ...form, accessories: e.target.valueAsNumber })
              }
              onBlur={handleUpdatePrice}
            />
          </div>
          <div className="grid grid-cols-1">
            <button className="btn" type="submit">
              Create Order
            </button>
          </div>
        </form>
        <div className="flex flex-row items-center justify-center">
          <p className="font-semibold text-white">
            {currentOffice.length > 0
              ? `Current office: ${currentOffice} `
              : null}
          </p>{" "}
        </div>
        <div className="mt-3 flex flex-row items-center justify-center">
          <a
            className=" font-semibold text-blue-500 underline"
            href="/aspen/fulfill"
          >
            See unfulfilled orders
          </a>
        </div>
        <div className="mt-3 flex flex-row items-center justify-center">
          <p className="font-semibold text-white">
            {error != "" ? `Error: ${error}` : null}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 px-2">
          {Array.isArray(suggestions) && suggestions.length > 0
            ? suggestions.map((suggestion: any) => {
                return (
                  <button
                    className="items-center rounded-lg bg-blue-700 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    onClick={() => {
                      setForm({ ...form, office: suggestion });
                      setCurrentOffice(suggestion.name);
                      setSuggestions([]);
                      setQuery("");
                    }}
                    key={suggestion.id}
                  >
                    {[
                      `Office Name: ${suggestion.name}`,
                      <br key={suggestion.id} />,
                      `Address: ${suggestion.shipping_address_street}`,
                      <br />,
                      `City: ${suggestion.shipping_address_city}`,
                      <br />,
                      `State: ${suggestion.shipping_address_state}`,
                      <br />,
                      `Zip: ${suggestion.shipping_address_postalcode}`,
                    ]}
                  </button>
                );
              })
            : null}
          <div>
            <p className="font-semibold text-white">
              {loading ? "Loading..." : null}
            </p>
          </div>
          <div className="absolute bottom-0 right-0">
            <Question toggle={() => showQuestion((question) => !question)} />
          </div>
          {question ? (
            <QuestionModal
              isVisible={question}
              title="Aspen Create Page"
              desc={<div>{/* FAQ INFO HERE COMMENTED OUT FOR PRIVACY */}</div>}
              close={() => showQuestion((question) => !question)}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
