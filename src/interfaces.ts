export enum RAFFLE_STATE {
  Closed = "closed",
  Created = "created",
  Started = "started",
  Finished = "finished",
  Claimed = "claimed",
  Cancelled = "cancelled",
}

export interface RAFFLE {
  raffle_id: number;
  raffle_info: {
    owner: string;
    assets: any[];
    raffle_ticket_price: {
      coin: {
        denom: string;
        amount: string;
      };
    };
    number_of_tickets: number;
    randomness?: string;
    winner?: string;
    is_cancelled: boolean;
    raffle_options: {
      raffle_start_timestamp: string;
      raffle_duration: number;
      raffle_timeout: number;
      comment: string;
      max_ticket_number: number;
      max_ticket_per_address: number;
      raffle_preview: number;
    };
  };
}

export interface TOKEN_RESPONSE {
  imageUrl: string;
  id: string;
  name: string;
  description: string;
  createdAt: string;
  ownerAddr: string;
  tokenId: string;
  collectionAddr: string;
}

export interface COLLECTION_RESPONSE {
  name: string;
  description: string;
  createdByAddr: string;
  collectionAddr: string;
}