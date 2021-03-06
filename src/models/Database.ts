import Loki = require('lokijs');
import { Service } from 'typedi';

import UserInput from '../interfaces/UserInput';

@Service()
export default class Database {

  /// The Loki instance backing the database
  private loki: Loki;

  private addons: LokiCollection<AddonSchema>;

  constructor(filename: string = './database.json') {
    this.loki = new Loki(filename, {
      autosave: true,
      serializationMethod: process.env.NODE_ENV === 'development' ? 'pretty' : 'normal',
    } as any);
  }

  public async initialise() {
    return new Promise((resolve, reject) => {
      this.loki.loadDatabase({}, (error) => {
        if (error) {
          reject(error);
          return;
        }

        this.addons = this.loadOrCreateCollection('addons');

        resolve();
      });
    });
  }

  public retrieveAllAddons(): AddonSchema[] {
    return this.addons.find();
  }

  public createAddon(addon: AddonSchema) {
    this.addons.insert(addon);
  }

  public saveAddonData(instanceId: string, savedData: object) {
    this.addons.findAndUpdate((addon) => addon.instanceId === instanceId, (addon) => { addon.savedData = savedData; return addon; });
  }

  private loadOrCreateCollection<StoredType>(collectionName: string, options?: LokiCollectionOptions): LokiCollection<StoredType> {
    const loadedCollection = this.loki.getCollection<StoredType>(collectionName);

    if (loadedCollection !== null) {
      return loadedCollection;
    }

    return this.loki.addCollection(collectionName, options);
  }

}

export type AddonSchema = {
  instanceId: string;
  moduleName: string;
  displayName: string;
  userProvidedInputs: UserInput.Value[];
  savedData?: object;
};
