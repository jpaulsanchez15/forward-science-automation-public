import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../../../server/db";

/*
  --------------------------------------------------------------------------
  POST route for adding Aspen orders to the database.
  --------------------------------------------------------------------------
*/

const addAspenOrderToDB = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
  } else {
    try {
      const order = await prisma.aspenOrder.create({
        data: {
          orderNumber: req.body.orderNumber,
          officeName: req.body.office.name,
          ordoroLink: "",
          trackingNumber: "",
          price: req.body.price,
          therastom: req.body.therastom,
          oxistom: req.body.oxistom,
          salivamax: req.body.salivamax,
          oralid: req.body.oralid,
          accessories: req.body.accessories,
          createdBy: req.body.firstName,
          userId: req.body.userId,
        },
      });
    res.status(201).json({ order: order, message: "Order added to DB" });
    } catch (error) {
      res.status(500).json({ error: error, message: "Please add an office to the order." });
    }
  }
}

export default addAspenOrderToDB
