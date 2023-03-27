import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "../../../../../env.mjs";

import sugarMiddleware from "../middleware";


const SUGAR_BASE_URL = env.SUGAR_BASE_URL;

interface NextApiRequestWithSugarToken extends NextApiRequest {
  access_token: string;
}

const findShopifyOffice = async (
  req: NextApiRequestWithSugarToken,
  res: NextApiResponse
) => {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  } else {
    const accessToken = req.access_token;
    const officeName =
      req.query.officeName !== "" ? req.query.officeName : undefined;
    const phone = req.query.phone !== "" ? req.query.phone : null;
    const address = req.query.address !== "" ? req.query.address : null;

    const endpoint = `Accounts?filter[0][$or][1][phone_office][$contains]=${phone}&filter[0][$or][0][name][$contains]=${officeName}&filter[0][$or][2][shipping_address_street][$contains]=${address}`;

    const response = await fetch(`${SUGAR_BASE_URL}rest/v11/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();

    if (data.records.length === 0) {
      res.status(404).send({ message: "Office not found" });
      return;
    } else {
      res.status(200).json(data.records);
      return;
    }
  }
}

export default sugarMiddleware(findShopifyOffice);
