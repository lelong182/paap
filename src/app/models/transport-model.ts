export class TransportModel {

  id: number;
  name: string;
  description: string;
  avatar: string;
  level: number;
  parent_id: number;
  status: string;

  constructor(transportInfo: any) {
    this.id = transportInfo.id;
    this.name = transportInfo.name;
    this.description = transportInfo.description;
    this.avatar = transportInfo.avatar;
    this.level = transportInfo.level;
    this.parent_id = transportInfo.parent_id;
    this.status = transportInfo.status;
  }
}
