import ElectronStore from 'electron-store';
import { Configuration } from '../reducers/configuration';
import { cacheStateType } from '../reducers/cache';

const persistentStore = new ElectronStore<{
  configuration: Configuration;
  cache: cacheStateType;
}>();
export default persistentStore;
