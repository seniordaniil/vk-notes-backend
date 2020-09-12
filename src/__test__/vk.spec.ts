import dotenv from 'dotenv';
dotenv.config();
import { VKService } from 'services';

const vkService = new VKService();
test('getUsers', async () => {
  const res = await vkService.vk.api.users.get({
    user_ids: '1',
    fields: ['photo_50'],
  });
  console.log(res)
})