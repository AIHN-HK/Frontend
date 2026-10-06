import axios from "axios";
import { AppConfig } from "@/utilities/appInfo";
import { UpdatePersonalProfile, UserProfile } from "@/modules/profile/schemas/profileSchema";
import { UserAPI } from "./api";

// Capture the screen's account for each request; shared interceptors re-read storage
// and can attach a different account's token to an old draft.
const client = axios.create({ baseURL: AppConfig.environmentDev, timeout: 10000 });
const config = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
export const profileService = {
  async get(token: string): Promise<UserProfile> {
    const response = await client.get(UserAPI.GET_USER_DETAIL, config(token));
    return response.data.data;
  },
  async update(token: string, data: UpdatePersonalProfile): Promise<UserProfile> {
    const { fullname, phone, address, gender, class: schoolClass } = data;
    const response = await client.patch(UserAPI.UPDATE_USER_DETAIL, {
      fullname, phone, address, gender, class: schoolClass,
    }, config(token));
    return response.data.data;
  },
};
