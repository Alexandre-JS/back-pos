import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>
  ) {}

  async getSettings(): Promise<Settings> {
    let settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      settings = this.settingsRepository.create();
      await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    let settings = await this.getSettings();
    Object.assign(settings, data);
    return this.settingsRepository.save(settings);
  }
}
