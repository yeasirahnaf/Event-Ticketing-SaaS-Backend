import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('PUSHER_KEY');
    console.log(`[PusherService] Initializing with key: ${key ? key.substring(0, 4) + '...' : 'MISSING'}`);
    this.pusher = new Pusher({
      appId: this.configService.get<string>('PUSHER_APP_ID')!,
      key: key!,
      secret: this.configService.get<string>('PUSHER_SECRET')!,
      cluster: this.configService.get<string>('PUSHER_CLUSTER')!,
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: any) {
    return await this.pusher.trigger(channel, event, data);
  }
}
