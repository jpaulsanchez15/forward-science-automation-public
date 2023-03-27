import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../server/db";

/*
  --------------------------------------------------------------------------
  GET route for getting all unfulfilled Aspen orders from the database.
  Unfulfilled === no tracking number.
  --------------------------------------------------------------------------
*/

const getAspenOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  } else {
    // Get all orders from the database.
    const orders = await prisma.aspenOrder.findMany({
      where: {
        trackingNumber: "",
      },
    });

    // Return the orders.
    res.status(200).json({ orders });
  }
};

export default getAspenOrders;
