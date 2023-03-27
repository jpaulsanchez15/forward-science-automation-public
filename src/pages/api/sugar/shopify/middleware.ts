import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "../../../../env.mjs";

const SUGAR_BASE_URL = env.SUGAR_BASE_URL;

interface NextApiRequestWithSugarToken extends NextApiRequest {
  access_token: string;
}

/* 
  --------------------------------------------------
  This middleware is used to wrap every Sugar request
  to ensure authentication is handled correctly.
  --------------------------------------------------
*/

// Not sure how to type handler??
const sugarMiddleware = (handler: any) => {
  return async (req: NextApiRequestWithSugarToken, res: NextApiResponse) => {
    try {
      const response = await fetch(`${SUGAR_BASE_URL}rest/v11/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "x-requested-with , x-requested-by",
        },
        body: JSON.stringify({
          grant_type: "password",
          client_id: env.SUGAR_CLIENT_ID,
          client_secret: env.SUGAR_CLIENT_SECRET,
          username: env.SUGAR_USERNAME,
          password: env.SUGAR_PASSWORD,
          platform: "base",
        }),
      });

      const data = await response.json();

      const { access_token: accessToken } = data;

      req.access_token = accessToken;

      return handler(req, res);
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  };
}

export default sugarMiddleware;
