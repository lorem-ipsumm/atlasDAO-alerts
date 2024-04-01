require("dotenv").config();
import { ALERT_DATA, RAFFLE, RAFFLE_STATE } from "./interfaces";
import { CosmWasmClient } from "cosmwasm";
import {
  fetchAssetInfo,
  fetchCollectionInfo,
  loadObject,
  saveObject,
  sleep,
} from "./utils";
import { alertDiscord } from "./discord";
import { alertTelegram } from "./telegram";
import { alertTwitter } from "./twitter";
import cron from "node-cron";
import moment from "moment";

const rpcEndpoint = process.env.TESTNET_RPC_ENDPOINT;
let client: CosmWasmClient;

// use cosmwasm client to fetch all raffles
const getAllRaffles = async (
  filters: {
    states: RAFFLE_STATE[];
  },
  limit: number,
  startAfter: number
): Promise<RAFFLE[]> => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS as string;
    // send query to contract
    const query = await client.queryContractSmart(contractAddress, {
      all_raffles: {
        filters,
        limit,
        start_after: startAfter,
      },
    });
    // return raffles
    return query.raffles;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const sendAlerts = async (raffles: RAFFLE[]) => {
  for (const raffle of raffles) {
    try {
      const {
        // raffle_id,
        raffle_info: {
          owner,
          assets,
          raffle_ticket_price: {
            coin: { amount, denom },
          },
          raffle_options: {
            raffle_start_timestamp,
            raffle_duration,
            max_ticket_number,
          },
        },
      } = raffle;

      // get formatted start date
      const startTimestamp = new Date(
        Math.floor(parseInt(raffle_start_timestamp) / 1000000)
      );
      const formattedStartDate = moment(startTimestamp).format(
        "MMM. D YYYY, h:mm:ss a"
      );
      // get formatted end date
      const endTimestamp = new Date(
        startTimestamp.getTime() + raffle_duration * 1000
      );
      const formattedEndDate = moment(endTimestamp).format(
        "MMM. D YYYY, h:mm:ss a"
      );
      // get formatted amount
      const formattedAmount = parseFloat(amount) / Math.pow(10, 6);

      // get the nft and collection info
      const assetInfo = await fetchAssetInfo(assets[0].sg721_token);
      if (!assetInfo) return;
      const collectionInfo = await fetchCollectionInfo(
        assetInfo.collectionAddr
      );
      if (!collectionInfo) return;

      // extract nft and collection info
      const collectionName = collectionInfo.name;
      const nftName = assetInfo.name;
      const fullName = `${collectionName} ${nftName}`;
      const nftImage = `https://ipfs.daodao.zone/ipfs/${assetInfo.imageUrl.replace(
        "ipfs://",
        ""
      )}`;

      // build alert object
      const alertData: ALERT_DATA = {
        fullName,
        owner,
        formattedStartDate,
        formattedEndDate,
        numNfts: assets.length,
        ticketPrice: `${formattedAmount} ${denom.substring(1)}`,
        ticketSupply: max_ticket_number,
        image: nftImage,
      };

      // send alerts
      await alertDiscord(alertData);
      await alertTelegram(alertData);
      await alertTwitter(alertData);

      // wait x seconds before sending the next batch
      await sleep(5000);
    } catch (e) {
      console.log(e);
      await sleep(10000);
    }
  }
};

const main = async () => {

  // check for valid env vars
  if (!rpcEndpoint || !process.env.CONTRACT_ADDRESS) {
    console.log("Missing env vars");
    return;
  }

  // load save data from file (data.json)
  const savedData = {
    ...(await loadObject("foundRaffles.json")),
  };

  // init client
  client = await CosmWasmClient.connect(rpcEndpoint as string);

  // fetch all raffles
  const raffles = await getAllRaffles(
    {
      states: [RAFFLE_STATE.Created, RAFFLE_STATE.Started],
    },
    200,
    savedData.lastRun || 0
  );

  // list of new raffles
  let newRaffles: RAFFLE[] = [];

  // print all raffles
  for (const raffle of raffles) {
    const raffleId = raffle.raffle_id;
    const owner = raffle.raffle_info.owner;
    const id = `${raffleId}-${owner}`;

    // check if raffle is already saved
    if (savedData.raffles.hasOwnProperty(id)) {
      continue;
    }

    // add raffle to new raffles
    newRaffles.push(raffle);

    // save raffle to file
    savedData.raffles[id] = JSON.stringify(raffle);
  }

  // update the last run time
  savedData.lastRun = Date.now();

  // save the new data to file
  saveObject("foundRaffles.json", savedData);

  // if there are new raffles, send alerts
  if (newRaffles.length > 0) {
    console.log(`Sending alerts for ${newRaffles.length} new raffles`);
    await sendAlerts(newRaffles);
  }
};

// run the main function every minute
cron.schedule("* * * * *", function () {
  console.log("---------------------");
  console.log("Running Cron Job");
  main();
});
