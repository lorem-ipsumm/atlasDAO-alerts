require("dotenv").config();
import { ALERT_DATA } from "./interfaces";
import axios from "axios";

export const alertDiscord = async (alertData: ALERT_DATA) => {
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

    // construct discord message
    let message = ``;
    message += `**New Raffle!**\n`;
    message += `**Cover NFT**: ${fullName}\n`;
    message += `**Owner**: ${owner}\n`;
    message += `**Raffle Start**: ${formattedStartDate}\n`;
    message += `**Raffle End**: ${formattedEndDate}\n`;
    message += `**Num NFTs**: ${numNfts}\n`;
    message += `**Ticket Price**: ${ticketPrice}\n`;
    message += `**Ticket Supply**: ${ticketSupply}\n`;

    // send message to discord
    await axios.post(process.env.DISCORD_WEBHOOK as string, {
      content: message,
      embeds: [
        {
          image: {
            url: image,
          },
        },
      ],
    });
  } catch (e) {
    console.log(e);
  }
};
