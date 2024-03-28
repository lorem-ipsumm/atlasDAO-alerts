import fs from "fs";
import { request, gql } from "graphql-request";
import { COLLECTION_RESPONSE, TOKEN_RESPONSE } from "./interfaces";

export const fetchAssetInfo = async (asset: {
  address: string;
  token_id: string;
}) => {
  // setup graphql query to fetch asset info
  const query = gql`
    query Collection($collectionAddr: String!, $tokenId: String!) {
      token(collectionAddr: $collectionAddr, tokenId: $tokenId) {
        imageUrl
        id
        name
        description
        createdAt
        ownerAddr
        tokenId
        collectionAddr
      }
    }
  `;

  // setup variables for graphql query
  const variables = {
    collectionAddr: asset.address,
    tokenId: asset.token_id,
  };

  try {
    const data: any = await request(
      "https://constellations-api.testnet.stargaze-apis.com/graphql",
      query,
      variables
    );
    return data.token as TOKEN_RESPONSE;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const fetchCollectionInfo = async (collectionAddr: string) => {
  // setup graphql query to fetch collection info
  const query = gql`
    query Collection($collectionAddr: String!) {
      collection(collectionAddr: $collectionAddr) {
        name
        description
        createdByAddr
        collectionAddr
      }
    }
  `;

  // setup variables for graphql query
  const variables = {
    collectionAddr,
  };

  try {
    const data: any = await request(
      "https://constellations-api.testnet.stargaze-apis.com/graphql",
      query,
      variables
    );
    return data.collection as COLLECTION_RESPONSE;
  } catch (e) {
    console.log(e);
    return null;
  }
};

// sleep method
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// save an object to file
export async function saveObject(fileName: string, data: Object, dir?: string) {
  try {
    // save/load file directory
    const path = `./${dir ? dir : "output"}/${fileName}`;
    // save new tokens object
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(err);
    console.log("saving error");
  }
}

// load an object from file
export async function loadObject(fileName: string) {
  try {
    // read data from file
    const path = `./output/${fileName}`;
    const data = fs.readFileSync(path, { encoding: "utf8" });
    // return JSON
    return JSON.parse(data);
  } catch (err) {
    console.log("loading error");
    console.log(err);
    return [];
  }
}
