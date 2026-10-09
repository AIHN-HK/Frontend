import { authSession } from './authSession';
import AsyncStorage from "@react-native-async-storage/async-storage";

export enum AsyncStorageKey {
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
  LANGUAGE = "language",
  USER_NAME = "USER_NAME",
  USER_ID = "USER_ID",
}

class AsyncStorageService {
  getSyncedFromDevice = async (name: string) => {
    try {
      if (name === AsyncStorageKey.ACCESS_TOKEN) return (await authSession.read()).accessToken;
      if (name === AsyncStorageKey.REFRESH_TOKEN) return (await authSession.read()).refreshToken;
      if (name === AsyncStorageKey.USER_ID) return (await authSession.read()).userId;
      if (name === AsyncStorageKey.USER_NAME && !(await authSession.read()).accessToken) return null;
      const object = await AsyncStorage.getItem(name);
      if (object !== null) {
        return JSON.parse(object);
      }
      return null;
    } catch (error) {
      console.log("getSyncedFromDevice::error" + error);
      return null;
    }
  };

  syncToDevice = async (name: string, object: any) => {
    try {
      const stringTodo = JSON.stringify(object);
      await AsyncStorage.setItem(name, stringTodo);
    } catch (e) {
      console.log("syncToDevice::error:" + e);
    }
  };

  clearAll = async () => {
    await authSession.clear();
  };

  clearItemInDevice = async (name: string) => {
    await AsyncStorage.removeItem(name);
  };
}

export const asyncStorageService = new AsyncStorageService();
