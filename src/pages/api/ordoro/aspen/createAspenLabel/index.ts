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

const createAspenLabel = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  } else {
    // Creates the label for the previously created order.
    const response = await fetch(
      `https://api.ordoro.com/v3/order/${req.body.num}/label/fedex`,
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

    if (response.status == 404) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (!response.ok) {
      res.status(504).json({ message: "Error creating label" });
      return;
    }

    const data = await response.json();

    const updatedOrder = await prisma.aspenOrder.update({
      where: {
        orderNumber: req.body.num.slice(11),
      },
      data: {
        trackingNumber: data.tracking_number,
        orderNumber: req.body.num.slice(11),
      },
    });

    res
      .status(201)
      .json({ order: updatedOrder, message: "Tracking added to DB" });

    // RETURN TRACKING NUMBER
    return;
  }
}

export default createAspenLabel;
