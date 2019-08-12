import { config as appConfig } from '../src/config';
import { Dragonstone } from '@episodehunter/types/message';
export const config = {
  update() {}
};

export const invoke = jest.fn((event: { FunctionName: string; Payload: string; InvocationType?: string }) => ({
  promise: () => {
    if (event.FunctionName === appConfig.addShowDragonstoneFunctionName) {
      const response: Partial<Dragonstone.AddShow.Response> = { ids: { id: 100, tvdb: 1, imdb: null } };
      return Promise.resolve({ Payload: JSON.stringify(response) });
    }
    return Promise.resolve();
  }
}));

export class Lambda {
  invoke = invoke;
}
