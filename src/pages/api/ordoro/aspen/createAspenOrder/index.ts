import { type NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../server/db";
import { env } from "../../../../../env.mjs";

/*
  --------------------------------------------------------------------------
  POST route for creating the order in Ordoro.
  --------------------------------------------------------------------------
*/

const ORDORO_API_USERNAME = env.ORDORO_API_USERNAME;
const ORDORO_API_PASSWORD = env.ORDORO_API_PASSWORD;

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const formattedDate =
  year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day;

const createAspenOrder = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  } else {
    // Actually creates the order for the label to then be made in Ordoro.
    const order = await prisma.aspenOrder.findUnique({
      where: {
        orderNumber: req.body.orderNumber,
      },
    });

    const getOfficeAddress = async () => {
      const officeOrderName = order?.officeName;
      const sugarOfficeId = await fetch(
        `https://forward-science-automation.vercel.app/api/sugar/aspen/findAspenOffice?officeName=${officeOrderName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await sugarOfficeId.json();

      const {
        name,
        shipping_address_street,
        shipping_address_city,
        shipping_address_state,
        shipping_address_postalcode,
        shipping_address_country,
      } = data[0];

      const address = {
        name,
        street1: shipping_address_street,
        city: shipping_address_city,
        state: shipping_address_state,
        zip: shipping_address_postalcode,
        country: shipping_address_country,
      };
      return address;
    };

    const shippingAddress = await getOfficeAddress();
    const billingAddress = shippingAddress;

    const nameMap = {
      therastom: "TheraStom 12 pk",
      oxistom: "OxiStom 6 pk",
      salivamax: "SalivaMAX® 10 pk of 30 ct boxes",
      oralid: "OralID Kit (FS-11) Default Title",
      accessories: "Customized Shipment",
    };

    const skuMap = {
      therastom: "TS-16-12",
      oxistom: "OX-13-6",
      salivamax: "42029121142953",
      oralid: "FS-11",
      accessories: "IDFL-Custom",
    };

    const priceMap = {
      therastom: 63,
      oxistom: 25.5,
      salivamax: 110,
      oralid: 995,
      accessories: 0,
    };

    const products = {
      therastom: order?.therastom ?? 0,
      oxistom: order?.oxistom ?? 0,
      salivamax: order?.salivamax ?? 0,
      oralid: order?.oralid ?? 0,
      accessories: order?.accessories ?? 0,
    };

    const productArray = Object.entries(products)
      .map(([name, quantity]) => ({
        product: {
          name: nameMap[name as keyof typeof nameMap],
          sku: skuMap[name as keyof typeof skuMap],
          price: priceMap[name as keyof typeof priceMap],
        },
        quantity,
        total_price: priceMap[name as keyof typeof priceMap] * quantity,
      }))
      .filter((product) => product?.quantity > 0);

    const payload = JSON.stringify({
      order_id: `${formattedDate}-${order?.orderNumber}`,
      billing_address: billingAddress,
      shipping_address: shippingAddress,
      lines: productArray,
    });

    const response = await fetch(`https://api.ordoro.com/v3/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${ORDORO_API_USERNAME}:${ORDORO_API_PASSWORD}`
        ).toString("base64")}`,
      },
      body: payload,
    });

    const data = await response.json();

    const updatedOrder = await prisma.aspenOrder.update({
      where: {
        orderNumber: req.body.orderNumber,
      },
      data: {
        ordoroLink: `${data.order_number}`,
      },
    });

    res.status(201).json({ order: updatedOrder, message: "Order added to DB" });

    return;
  }
}

export default createAspenOrder;
