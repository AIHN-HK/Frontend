import AsyncStorage from "@react-native-async-storage/async-storage";

export enum AsyncStorageKey {
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
  LANGUAGE = "language",
  USER_NAME = "USER_NAME",
}

class AsyncStorageService {
  getSyncedFromDevice = async (name: string) => {
    try {
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
    await AsyncStorage.multiRemove([
      AsyncStorageKey.ACCESS_TOKEN,
      AsyncStorageKey.REFRESH_TOKEN,
    ]);
  };

  clearItemInDevice = async (name: string) => {
    await AsyncStorage.removeItem(name);
  };
}

export const asyncStorageService = new AsyncStorageService();
