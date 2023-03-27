import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../../../server/db";

/*
  --------------------------------------------------------------------------
  DELETE route for deleting Aspen orders from the database.
  --------------------------------------------------------------------------
*/

const deleteAspenOrder = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  } else {
    // Deletes the order from the database.
    const order = await prisma.aspenOrder.delete({
      where: {
        orderNumber: req.body.orderNumber,
      },
    });

    // Return the order.
    res.status(200).json({ order });
  }
}

export default deleteAspenOrder