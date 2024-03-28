require("dotenv").config();
import { RAFFLE } from "./interfaces";
import moment from "moment";
import axios from "axios";
import { fetchAssetInfo, fetchCollectionInfo } from "./utils";

export const alertDiscord = async (raffle: RAFFLE) => {
  try {
    const {
      raffle_id,
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
    const collectionInfo = await fetchCollectionInfo(assetInfo.collectionAddr);
    if (!collectionInfo) return;

    // extract nft and collection info
    const collectionName = collectionInfo.name;
    const nftName = assetInfo.name;
    const fullName = `${collectionName} ${nftName}`;
    const nftImage = `https://ipfs.daodao.zone/ipfs/${assetInfo.imageUrl.replace(
      "ipfs://",
      ""
    )}`;

    // construct discord message
    let message = ``;
    message += `**New Raffle!**\n`;
    message += `**Cover NFT**: ${fullName}\n`;
    message += `**Owner**: ${owner}\n`;
    message += `**Raffle Start**: ${formattedStartDate}\n`;
    message += `**Raffle End**: ${formattedEndDate}\n`;
    message += `**Num NFTs**: ${assets.length}\n`;
    message += `**Ticket Price**: ${formattedAmount} ${denom.substring(1)}\n`;
    message += `**Ticket Supply**: ${max_ticket_number}\n`;

    // send message to discord
    await axios.post(process.env.DISCORD_WEBHOOK as string, {
      content: message,
      embeds: [
        {
          image: {
            url: nftImage,
          },
        },
      ],
    });
  } catch (e) {
    console.log(e);
  }
};
