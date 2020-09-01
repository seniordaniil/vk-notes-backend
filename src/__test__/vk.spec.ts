import dotenv from 'dotenv';
dotenv.config();
import { VKService } from 'services';

const vkapi = new VKService();

test('users', async () => {
  const response = await vkapi.vk.api.users.get({
    user_ids: '1,777,292557884',
    fields: ['photo_50'],
  });

  console.log(response);
});

test('photos', async () => {});
