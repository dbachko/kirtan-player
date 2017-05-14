import { helloSvc } from './services/helloSvc';

export const kirtanPlayer = (event, context, callback) => {

  const result = helloSvc({name: 'kirtanPlayer'});

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: result,
      input: event,
    }),
  };

  callback(null, response);
};

export default {
  kirtanPlayer
}
