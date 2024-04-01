import { ALERT_DATA } from "./interfaces";
const Telegram = require("node-telegram-bot-api");

export const alertTelegram = async (alertData: ALERT_DATA) => {
  try {
    const telegram = new Telegram(process.env.TELEGRAM_BOT_TOKEN as string);

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

    // construct telegram message
    let message = ``;
    message += `New Raffle!\n`;
    message += `Cover NFT: ${fullName}\n`;
    message += `Owner: ${owner}\n`;
    message += `Raffle Start: ${formattedStartDate}\n`;
    message += `Raffle End: ${formattedEndDate}\n`;
    message += `Num NFTs: ${numNfts}\n`;
    message += `Ticket Price: ${ticketPrice}\n`;
    message += `Ticket Supply: ${ticketSupply}\n`;

    // send message to telegram
    await telegram.sendPhoto(-4197943956, image, {
      caption: message
    });

  } catch (e) {
    console.log(e);
  }
};
