import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

@Injectable({
  providedIn: 'root'
})
export class SleepService {
  public static AllSleepData: SleepData[] = [];
  public static AllOvernightData: OvernightSleepData[] = [];
  public static AllSleepinessData: StanfordSleepinessData[] = [];

  // Resolves once saved data has been loaded; pages await this before drawing
  public ready: Promise<void>;

  constructor(private storage: Storage) {
    this.ready = this.init();
  }

  private async init() {
    await this.storage.create();
    const overnight = (await this.storage.get('overnight')) ?? [];
    const sleepiness = (await this.storage.get('sleepiness')) ?? [];

    // Clear first so a second init can't duplicate entries
    SleepService.AllSleepData = [];
    SleepService.AllOvernightData = [];
    SleepService.AllSleepinessData = [];

    overnight.forEach((o: any) => this.addToLists(OvernightSleepData.fromJSON(o)));
    sleepiness.forEach((o: any) => this.addToLists(StanfordSleepinessData.fromJSON(o)));
  }

  private addToLists(d: OvernightSleepData | StanfordSleepinessData) {
    SleepService.AllSleepData.push(d);
    if (d instanceof OvernightSleepData) SleepService.AllOvernightData.push(d);
    else SleepService.AllSleepinessData.push(d);
  }

  private async save() {
    await this.storage.set('overnight', SleepService.AllOvernightData.map(d => d.toJSON()));
    await this.storage.set('sleepiness', SleepService.AllSleepinessData.map(d => d.toJSON()));
  }

  public async logOvernightData(sleepData: OvernightSleepData) {
    await this.ready;
    this.addToLists(sleepData);
    await this.save();
  }

  public async logSleepinessData(sleepData: StanfordSleepinessData) {
    await this.ready;
    this.addToLists(sleepData);
    await this.save();
  }
}