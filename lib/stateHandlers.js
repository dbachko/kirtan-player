import Alexa from 'alexa-sdk';
import audioData from '../assets/audio';
import constants from './constants';
import controller from './controller';


const kirtan = '<emphasis level="strong"><prosody rate="x-slow"><phoneme alphabet="ipa" ph="ˈk.irtan">Kirtan</phoneme></prosody></emphasis>';

const stateHandlers = {
  startModeIntentHandlers: Alexa.CreateStateHandler(constants.states.START_MODE, {
    /*
     *  All Intent Handlers for state : START_MODE
     */
    LaunchRequest() {
      // Initialize Attributes
      this.attributes['playOrder'] = [...Array(audioData.length).keys()].map(i => i);
      this.attributes['index'] = 0;
      this.attributes['offsetInMilliseconds'] = 0;
      this.attributes['loop'] = true;
      this.attributes['shuffle'] = false;
      this.attributes['playbackIndexChanged'] = true;
      //  Change state to START_MODE
      this.handler.state = constants.states.START_MODE;

      const message = `Welcome to the ${kirtan} Player. You can say, play the ${kirtan} to begin.`;
      const reprompt = 'You can say, play the kirtan, to begin.';

      this.response.speak(message).listen(reprompt);
      this.emit(':responseReady');
    },
    PlayAudio() {
      if (!this.attributes['playOrder']) {
        // Initialize Attributes if undefined.
        this.attributes['playOrder'] = [...Array(audioData.length).keys()].map(i => i);
        this.attributes['index'] = 0;
        this.attributes['offsetInMilliseconds'] = 0;
        this.attributes['loop'] = true;
        this.attributes['shuffle'] = false;
        this.attributes['playbackIndexChanged'] = true;
        //  Change state to START_MODE
        this.handler.state = constants.states.START_MODE;
      }
      controller.play.call(this);
    },
    'AMAZON.HelpIntent'() {
      var message = `Welcome to the ${kirtan} Player. You can say, play the kirtan, to begin.`;
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent'() {
      var message = 'Good bye.';
      this.response.speak(message);
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent'() {
      var message = 'Good bye.';
      this.response.speak(message);
      this.emit(':responseReady');
    },
    SessionEndedRequest() {
      // No session ended logic
    },
    Unhandled() {
      var message = 'Sorry, I could not understand. Please say, play kirtan, to begin.';
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    }
  }),
  playModeIntentHandlers: Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
    /*
     *  All Intent Handlers for state : PLAY_MODE
     */
    LaunchRequest() {
      /*
       *  Session resumed in PLAY_MODE STATE.
       *  If playback had finished during last session :
       *      Give welcome message.
       *      Change state to START_STATE to restrict user inputs.
       *  Else :
       *      Ask user if he/she wants to resume from last position.
       *      Change state to RESUME_DECISION_MODE
       */
      let message;
      let reprompt;
      if (this.attributes['playbackFinished']) {
        this.handler.state = constants.states.START_MODE;
        message = `Welcome to the ${kirtan} Player. You can say, play the ${kirtan} to begin.`;
        reprompt = 'You can say, play the kirtan, to begin.';
      } else {
        this.handler.state = constants.states.RESUME_DECISION_MODE;
        const { title } = audioData[this.attributes['playOrder'][this.attributes['index']]];
        message = `You were listening to ${title}. Would you like to resume?`;
        reprompt = 'You can say yes to resume or no to play from the top.';
      }
      this.response.speak(message.replace('&', 'and')).listen(reprompt);
      this.emit(':responseReady');
    },
    PlayAudio() {
      controller.play.call(this)
    },
    'AMAZON.NextIntent'() {
      controller.playNext.call(this)
    },
    'AMAZON.PreviousIntent'() {
      controller.playPrevious.call(this)
    },
    'AMAZON.PauseIntent'() {
      controller.stop.call(this)
    },
    'AMAZON.StopIntent'() {
      controller.stop.call(this)
    },
    'AMAZON.CancelIntent'() {
      controller.stop.call(this)
    },
    'AMAZON.ResumeIntent'() {
      controller.play.call(this)
    },
    'AMAZON.LoopOnIntent'() {
      controller.loopOn.call(this)
    },
    'AMAZON.LoopOffIntent'() {
      controller.loopOff.call(this)
    },
    'AMAZON.ShuffleOnIntent'() {
      controller.shuffleOn.call(this)
    },
    'AMAZON.ShuffleOffIntent'() {
      controller.shuffleOff.call(this)
    },
    'AMAZON.StartOverIntent'() {
      controller.startOver.call(this)
    },
    'AMAZON.HelpIntent'() {
      var message = `You are listening to the ${kirtan} Player. You can say, Next or Previous to navigate through the playlist. At any time, you can say Pause to pause the audio and Resume to resume.`;
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    },
    SessionEndedRequest() {
      // No session ended logic
    },
    Unhandled() {
      var message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    }
  }),
  remoteControllerHandlers: Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    PlayCommandIssued() {
      controller.play.call(this)
    },
    PauseCommandIssued() {
      controller.stop.call(this)
    },
    NextCommandIssued() {
      controller.playNext.call(this)
    },
    PreviousCommandIssued() {
      controller.playPrevious.call(this)
    }
  }),
  resumeDecisionModeIntentHandlers: Alexa.CreateStateHandler(constants.states.RESUME_DECISION_MODE, {
    /*
     *  All Intent Handlers for state : RESUME_DECISION_MODE
     */
    LaunchRequest() {
      const { title } = audioData[this.attributes['playOrder'][this.attributes['index']]];
      const message = `You were listening to ${title}. Would you like to resume?`;
      const reprompt = 'You can say yes to resume or no to play from the top.';
      this.response.speak(message.replace('&', 'and')).listen(reprompt);
      this.emit(':responseReady');
    },
    'AMAZON.YesIntent'() {
      controller.play.call(this)
    },
    'AMAZON.NoIntent'() {
      controller.reset.call(this)
    },
    'AMAZON.HelpIntent'() {
      const { title } = audioData[this.attributes['index']];
      const message = `You were listening to ${title}. Would you like to resume?`;
      const reprompt = 'You can say yes to resume or no to play from the top.';
      this.response.speak(message.replace('&', 'and')).listen(reprompt);
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent'() {
      var message = 'Good bye.';
      this.response.speak(message);
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent'() {
      var message = 'Good bye.';
      this.response.speak(message);
      this.emit(':responseReady');
    },
    SessionEndedRequest() {
      // No session ended logic
    },
    Unhandled() {
      var message = 'Sorry, this is not a valid command. Please say help to hear what you can say.';
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    }
  })
};

export default stateHandlers;
