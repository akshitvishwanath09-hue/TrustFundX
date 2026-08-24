import algosdk from "algosdk";

export const algod = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
);

if (!process.env.NEXT_PUBLIC_APP_ID) {
  throw new Error('NEXT_PUBLIC_APP_ID environment variable is not set');
}

if (!process.env.NEXT_PUBLIC_APP_ADDRESS) {
  throw new Error('NEXT_PUBLIC_APP_ADDRESS environment variable is not set');
}

export const APP_ID = parseInt(process.env.NEXT_PUBLIC_APP_ID, 10);
export const APP_ADDRESS = process.env.NEXT_PUBLIC_APP_ADDRESS;