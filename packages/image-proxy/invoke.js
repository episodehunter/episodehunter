const handler = require('./dist/handler');

const data = [
  {
    media: 'show',
    type: 'poster',
    action: 'add',
    id: 10,
    path: 'some/path/to/image.jpg'
  },
  {
    media: 'show',
    type: 'episode',
    action: 'add',
    id: 10,
    theTvDbId: 1000,
    path: 'some/path/to/episode/image.jpg'
  }
];

const callback = (error, result) => console.log(error, result);

const event = {
  Records: [
    {
      Sns: {
        Message: JSON.stringify(data)
      }
    }
  ]
};

handler.update(event, null, callback);
