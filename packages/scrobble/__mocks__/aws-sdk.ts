export const response = jest.fn();

export const invoke = jest.fn((_: any) => ({
  promise: response
}));

export class Lambda {
  invoke = invoke
}

export const config = {
  update() {
    //
  }
};
