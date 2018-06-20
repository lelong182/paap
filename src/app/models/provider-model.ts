import {TransportModel} from './transport-model';

export class ProviderModel {

  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  current_password: string;
  password: string;
  excerpt: string;
  gpdkkd: string;
  gpvt: string;
  mst: string;
  companyName: string;
  description: string;
  discounts: Array<{ code: string, value: string, description: string }>;
  transports: Array<TransportModel>;
  provinces: Array<number>;
  rating: number;
  avatar: string;
  status: string;
  phoneVerifyCode: string;


  constructor(providerInfo: any) {
    this.id = providerInfo.id;
    this.name = providerInfo.name;
    this.email = providerInfo.email;
    this.phone = providerInfo.phone;
    this.address = providerInfo.address;
    this.current_password = providerInfo.current_password;
    this.password = providerInfo.password;
    this.excerpt = providerInfo.excerpt;
    this.gpdkkd = providerInfo.gpdkkd;
    this.gpvt = providerInfo.gpvt;
    this.mst = providerInfo.mst;
    this.companyName = providerInfo.companyName;
    this.description = providerInfo.description;
    this.discounts = providerInfo.discounts;
    this.transports = providerInfo.transports;
    this.provinces = providerInfo.provinces;
    this.rating = providerInfo.rating;
    this.avatar = providerInfo.avatar;
    this.status = providerInfo.status;
    this.phoneVerifyCode = providerInfo.phoneVerifyCode;
  }
}
