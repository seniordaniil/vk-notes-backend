import { Injectable, Scope } from '@nestjs/common';
import { VK } from 'vk-io';

@Injectable({ scope: Scope.DEFAULT })
export class VKService {
  public vk: VK;

  constructor() {
    this.vk = new VK({
      token: process.env.APP_SERVICE_KEY,
      language: process.env.APP_VK_LANGUAGE
    });
  }
}
