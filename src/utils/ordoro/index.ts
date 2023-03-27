import * as productLibrary from "./productLibrary.json";
import { env } from "../../env.mjs";

interface OrderContents {
  sku: string;
  quantity: number;
}

interface Payload {
  box_shape: string;
  length?: string;
  width?: string;
  height?: string;
  weight?: string;
}

/*
  --------------------------------------------------------------------------
  productLibrary.json has almost all of the data deleted for privacy
  There is a one test product in the file to show the structure for the data
  --------------------------------------------------------------------------
*/

/*
  --------------------------------------------------------------------------
  Utility function for formatting orders for the Ordoro API
  --------------------------------------------------------------------------
*/

export const formatShopifyOrder = async (
  orderContents: Array<OrderContents>
) => {
  const addToPayload = [];
  const templatePayloadValues: Payload = {
    box_shape: "YOUR_PACKAGING",
    length: "",
    width: "",
    height: "",
    weight: "",
  };

  const totalProducts: Array<string> = [];

  orderContents.map((item) => {
    return totalProducts.push(...Array(item.quantity).fill(item.sku));
  });

  const reduced = totalProducts.reduce(
    (acc: any, cv: any) => ((acc[cv] = ++acc[cv] || 1), acc),
    {}
  );

  const check12 = (count: any) => [~~(count / 2), count % 2];

  const updateProducts = (products: any) => {
    const [twelves, remainder] = check12(products["TS-16-6"]);
    products["TS-16-12"] = twelves;
    products["TS-16-6"] = remainder;
    return products;
  };

  const revisedProductObj = updateProducts(reduced);
  const finalProductList = [];

  for (const [key, value] of Object.entries(revisedProductObj)) {
    (value as number) > 0
      ? finalProductList.push(...Array(value).fill(key))
      : null;
  }

  const whichDimensions: Array<{
    dimensions: { length: number; width: number; height: number; lb: number };
  }> = [];
  finalProductList.forEach((item: any) => {
    if (item in productLibrary) {
      whichDimensions.push(productLibrary[item as keyof typeof productLibrary]);
    }
  });

  for (let i = 0; i < whichDimensions.length; i++) {
    const values = [
      "YOUR_PACKAGING",
      whichDimensions[i]?.dimensions?.length,
      whichDimensions[i]?.dimensions?.width,
      whichDimensions[i]?.dimensions?.height,
      whichDimensions[i]?.dimensions?.lb,
    ];

    const payloadObj: Partial<Payload> = {};
    for (let j = 0; j < values.length; j++) {
      payloadObj[Object.keys(templatePayloadValues)[j] as keyof Payload] =
        values[j] as string;
    }
    addToPayload.push(payloadObj);
  }

  const payload = {
    shipper_id: +env.NEXT_PUBLIC_SHIPPER_ID,
    shipping_method: "GROUND_HOME_DELIVERY",
    packages: addToPayload,
  };

  return payload;
};

export const formatAspenOrder = async (orderContents: Array<OrderContents>) => {
  const addToPayload = [];
  const templatePayloadValues: Payload = {
    box_shape: "YOUR_PACKAGING",
    length: "",
    width: "",
    height: "",
    weight: "",
  };

  const totalProducts: Array<string> = [];

  orderContents.map((item) => {
    return totalProducts.push(...Array(item.quantity).fill(item.sku));
  });

  const whichDimensions: Array<{
    dimensions: { length: number; width: number; height: number; lb: number };
  }> = [];
  totalProducts.forEach((item) => {
    if (item in productLibrary) {
      whichDimensions.push(productLibrary[item as keyof typeof productLibrary]);
    }
  });

  for (let i = 0; i < whichDimensions.length; i++) {
    const values = [
      "YOUR_PACKAGING",
      whichDimensions[i]?.dimensions?.length,
      whichDimensions[i]?.dimensions?.width,
      whichDimensions[i]?.dimensions?.height,
      whichDimensions[i]?.dimensions?.lb,
    ];

    const payloadObj: Partial<Payload> = {};
    for (let j = 0; j < values.length; j++) {
      payloadObj[Object.keys(templatePayloadValues)[j] as keyof Payload] =
        values[j] as string;
    }
    addToPayload.push(payloadObj);
  }

  const payload = {
    shipper_id: +env.NEXT_PUBLIC_SHIPPER_ID,
    shipping_method: "GROUND_HOME_DELIVERY",
    payment_account: env.NEXT_PUBLIC_PAYMENT_ACCOUNT,
    payment_type: "RECIPIENT",
    packages: addToPayload,
  };

  return payload;
};
