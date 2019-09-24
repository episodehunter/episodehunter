import { config as appConfig } from '../src/config';
import { Message } from '@episodehunter/types';
export const config = {
  update() {}
};

export const invoke = jest.fn((event: { FunctionName: string; Payload: string; InvocationType?: string }) => ({
  promise: () => {
    if (event.FunctionName === appConfig.addShowDragonstoneFunctionName) {
      const response: Partial<Message.Dragonstone.AddShowResponse> = { ids: { id: 100, tvdb: 1, imdb: null } };
      return Promise.resolve({ Payload: JSON.stringify(response) });
    }
    return Promise.resolve();
  }
}));

export class Lambda {
  invoke = invoke;
}
