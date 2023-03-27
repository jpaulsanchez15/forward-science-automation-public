import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "../../../env.mjs";

/*
  --------------------------------------------------------------------------
  GET route that gets exposes the Shopify API and gets the information so
  we can know more about each order that the Ordoro API doesn't provide.
  --------------------------------------------------------------------------
*/

const SHOPIFY_ACCESS_TOKEN = env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_STORE_URL = env.NEXT_PUBLIC_SHOPIFY_STORE_URL;

const getShopifyInfo = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  } else {
    const response = await fetch(
      `${SHOPIFY_STORE_URL}.json?fulfillment_status=unfulfilled&status=open&since_id=4903735066793`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
      }
    );
    const data = await response.json();

    res.status(200).json(data.orders);

    return data;
  }
}

export default getShopifyInfo;