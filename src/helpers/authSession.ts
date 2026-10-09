import { passwordRecovery } from './passwordRecovery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSessionManager } from './sessionManager';
export const authSession = createSessionManager(AsyncStorage);

authSession.subscribe((_id, reason) => { if (reason === 'account') passwordRecovery.clear(); });
