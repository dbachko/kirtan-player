import Alexa from 'alexa-sdk';
import constants from './lib/constants';
import stateHandlers from './lib/stateHandlers';
import audioEventHandlers from './lib/audioEventHandlers';

export const kirtanPlayer = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = constants.appId;
  alexa.dynamoDBTableName = constants.dynamoDBTableName;
  alexa.registerHandlers(
    stateHandlers.startModeIntentHandlers,
    stateHandlers.playModeIntentHandlers,
    stateHandlers.remoteControllerHandlers,
    stateHandlers.resumeDecisionModeIntentHandlers,
    audioEventHandlers
  );
  alexa.execute();
};

export default {
  kirtanPlayer
}
