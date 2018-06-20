export class UserModel {

  id: number;
  fullname: string;
  dob: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  role: string;
  avatar: string;
  mst: string;
  companyName: string;
  status: string;
  phoneVerifyCode: string;

  constructor(userInfo: any) {
    this.id = userInfo.id;
    this.fullname = userInfo.fullname;
    this.dob = userInfo.dob;
    this.username = userInfo.username;
    this.email = userInfo.email;
    this.password = userInfo.password;
    this.phone = userInfo.phone;
    this.gender = userInfo.id;
    this.role = userInfo.role;
    this.avatar = userInfo.avatar;
    this.mst = userInfo.mst;
    this.companyName = userInfo.companyName;
    this.status = userInfo.status;
    this.phoneVerifyCode = userInfo.phoneVerifyCode;
  }

}
