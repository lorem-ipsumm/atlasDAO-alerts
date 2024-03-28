import { RAFFLE, RAFFLE_STATE } from "./interfaces";
import { CosmWasmClient } from "cosmwasm";
import { loadObject, saveObject, sleep } from "./utils";
import { alertDiscord } from "./discord";
import { alertTelegram } from "./telegram";
import { alertTwitter } from "./twitter";
import cron from 'node-cron';

const rpcEndpoint = "https://rpc.elgafar-1.stargaze-apis.com/";
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
    const contractAddress =
      "stars1hqvn37a7dn58gzq6md4y5gk20e9j4gmm9eu8c7g5vhqj5mpsd0uqg55ngg";
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

// send alerts to all platforms
const sendAlerts = async (raffles: RAFFLE[]) => {
  for (const raffle of raffles) {
    // send alerts
    await alertDiscord(raffle);
    await alertTelegram(raffle);
    await alertTwitter(raffle);
    // wait x seconds before sending the next batch 
    await sleep(5000);
  }
};

const main = async () => {
  // load save data from file (data.json)
  const savedData = {
    ...(await loadObject("saveData.json")),
  };

  // init client
  client = await CosmWasmClient.connect(rpcEndpoint);

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
  saveObject("saveData.json", savedData);

  // if there are new raffles, send alerts
  if (newRaffles.length > 0) {
    console.log(`Sending alerts for ${newRaffles.length} new raffles`);
    await sendAlerts(newRaffles);
  }
};

cron.schedule('* * * * *', function() {
  console.log('---------------------');
  console.log('Running Cron Job');
  main();
});