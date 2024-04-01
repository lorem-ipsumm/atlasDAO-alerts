import { ALERT_DATA } from "./interfaces";
const { Rettiwt } = require("rettiwt-api");

export const alertTwitter = async (alertData: ALERT_DATA) => {
  return "not implemented";
  try {
    // extract alert data
    const {
      fullName,
      owner,
      formattedStartDate,
      formattedEndDate,
      numNfts,
      ticketPrice,
      ticketSupply,
      image,
    } = alertData;

    // construct twitter message
    let message = ``;
    message += `New Raffle!\n`;
    message += `Cover NFT: ${fullName}\n`;
    message += `Owner: ${owner}\n`;
    message += `Raffle Start: ${formattedStartDate}\n`;
    message += `Raffle End: ${formattedEndDate}\n`;
    message += `Num NFTs: ${numNfts}\n`;
    message += `Ticket Price: ${ticketPrice}\n`;
    message += `Ticket Supply: ${ticketSupply}\n`;

    // setup twitter client
    const rettiwt = new Rettiwt(process.env.TWITTER_API_KEY);
    // send tweet
    const tweet = await rettiwt.tweet(message, {
      media: image,
    });
  } catch (e) {
    console.log(e);
  }
};
