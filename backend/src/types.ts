export type PayStatus =
  | "confirm"
  | "need_info"
  | "contact_not_found"
  | "not_understood";

export interface Payment {
  payee_name: string;
  vpa: string;
  amount: number;
  upi_uri: string;
}

export interface PayResponse {
  status: PayStatus;
  speech: string;
  tts_audio: string; // base64 audio of `speech`
  payment?: Payment; // only when status = "confirm"
}
