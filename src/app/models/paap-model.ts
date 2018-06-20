export class PaapModel {

  id: number;
  user_id: number;
  departureId: string;
  departureAddress: string;
  departureName: string;
  destinationId: string;
  destinationAddress: string;
  destinationName: string;
  arrival_datetime: string;
  departure_datetime: string;
  transport_id: number;
  transport_name: string;
  description: string;
  booked: boolean;
  status: string;
  created_at: string;
  updated_at: string;

  constructor(paapInfo: any) {
    this.id = paapInfo.id;
    this.user_id = paapInfo.user_id;
    this.departureId = paapInfo.departureId;
    this.departureAddress = paapInfo.departureAddress;
    this.departureName = paapInfo.departureName;
    this.destinationId = paapInfo.destinationId;
    this.destinationAddress = paapInfo.destinationAddress;
    this.destinationName = paapInfo.destinationName;
    this.arrival_datetime = paapInfo.arrival_datetime;
    this.departure_datetime = paapInfo.departure_datetime;
    this.transport_id = paapInfo.transport_id;
    this.transport_name = paapInfo.transport_name;
    this.description = paapInfo.description;
    this.booked = paapInfo.booked;
    this.status = paapInfo.status;
    this.created_at = paapInfo.created_at;
    this.updated_at = paapInfo.updated_at;
  }

}
