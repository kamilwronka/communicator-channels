import { HttpService } from '@nestjs/axios';

export const getUserData = async (userId: string): Promise<any> => {
  const response = new HttpService().get(`http://users:4000/data/${userId}`);
  const userData = await response.toPromise();

  return userData.data;
};
