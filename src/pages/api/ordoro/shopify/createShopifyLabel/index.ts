import { type NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../server/db";
import { env } from "../../../../../env.mjs";

/*
  --------------------------------------------------------------------------
  POST route that creates the label via the Ordoro API.
  --------------------------------------------------------------------------
*/

const ORDORO_API_USERNAME = env.ORDORO_API_USERNAME;
const ORDORO_API_PASSWORD = env.ORDORO_API_PASSWORD;
const ORDORO_API_URL = env.ORDORO_API_URL;

type Line = {
  sku: string;
  quantity: number;
  order_line_product_name: string;
  total_price: number;
};

const createShopifyLabel = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Creates label for Shopify orders.
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  } else {
    const response = await fetch(
      `${ORDORO_API_URL}/${req.body.num}/label/fedex`,
      {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${ORDORO_API_USERNAME}:${ORDORO_API_PASSWORD}`
          ).toString("base64")}`,
        },
        body: JSON.stringify(req.body.lines),
      }
    );

    const data = await response.json();

    const { tracking_number: trackingNumber } = data;

    res.status(201).json(data);

    const lines = req.body.order.map((line: Line) => {
      return {
        sku: line.sku,
        quantity: line.quantity,
        productName: line.order_line_product_name,
        price: line.total_price,
      };
    });

    await prisma.shopifyOrder.create({
      data: {
        trackingNumber: trackingNumber,
        orderNumber: req.body.num.slice(2),
      },
    });

    await prisma.shopifyOrder.update({
      where: {
        orderNumber: req.body.num.slice(2),
      },
      data: {
        lines: {
          create: lines,
        },
      },
    });

    return;
  }
}

export default createShopifyLabel;
