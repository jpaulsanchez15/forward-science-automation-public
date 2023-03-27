import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "../../../../../env.mjs";

import sugarMiddleware from "../../shopify/middleware";

/*
  --------------------------------------------------------------------------
  POST route that creates a new ship log in Sugar. This is for documentation
  purposes.
  --------------------------------------------------------------------------
*/

const SUGAR_BASE_URL = env.SUGAR_BASE_URL;

interface NextApiRequestWithSugarToken extends NextApiRequest {
  access_token: string;
}

const date = new Date();
date.toISOString();

const createShipLog = async (
  req: NextApiRequestWithSugarToken,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  } else {
    try {
      const accessToken = req.access_token;

      const orderContents: string = req.body.description;
      const tracking: string = req.body.name;
      const orderNumberWithoutFirstChar: string = req.body.order_no;
      const price: string = req.body.product_sales_total_c;
      const officeId: string = req.body.office;

      const createLog = async () => {
        const payload = {
          order_no: orderNumberWithoutFirstChar,
        };

        const response = await fetch(`${SUGAR_BASE_URL}rest/v11/FS_Shipping/`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        const { id } = await response.json();

        return id;
      };

      const shipLogId = await createLog();

      const updateLog = async () => {
        const payload = {
          description: orderContents,
          name: tracking,
          product_sales_total_c: price,
          date_ordered_c: date,
        };

        const response = await fetch(
          `${SUGAR_BASE_URL}rest/v11/FS_Shipping/${shipLogId}`,
          {
            method: "put",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          }
        );

        const { id } = await response.json();

        return id;
      };

      const updatedLogId = await updateLog();

      const linkLogToOffice = async () => {
        if (!officeId) {
          return;
        } else {
          const payload = {
            module: "FS_Shipping",
            ids: [updatedLogId],
            link_name: "fs_shipping_accounts",
          };

          const response = await fetch(
            `${SUGAR_BASE_URL}rest/v11/Accounts/${officeId}/link`,
            {
              method: "post",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(payload),
            }
          );

          const data = await response.json();

          return data;
        }
      };

      if (officeId == undefined || null) {
        res
          .status(404)
          .json({ message: "Couldn't link log to office! Office not found!" });
        return;
      } else {
        await linkLogToOffice();
      }
      res.status(201).json({ message: "Log created and linked!" });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong!" });
    }
  }
}

export default sugarMiddleware(createShipLog);
