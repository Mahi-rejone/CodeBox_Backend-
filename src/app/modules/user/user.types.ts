import { UserRole, UserStatus } from "../../../generated/browser";

type TCreateUserPayload = {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  profile?: {
    img?: string;
    phoneNumber: string;
    state: string;
    district: string;
    town: string;
    address?: string;
    dateOfBirth: Date;
    gender: string;
  };
};
type TUserFilters = {
  username?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  state?: string;
  district?: string;
  town?: string;
  search?: string;
};
export { TCreateUserPayload, TUserFilters };