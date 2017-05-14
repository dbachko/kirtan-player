import Alexa from 'alexa-sdk';
import audioData from '../assets/audio';
import constants from './constants';
import controller from './controller';

const stateHandlers = {
  startModeIntentHandlers: Alexa.CreateStateHandler(constants.states.START_MODE, {
    /*
     *  All Intent Handlers for state : START_MODE
     */
    'LaunchRequest': function() {
      // Initialize Attributes
      this.attributes['playOrder'] = [...Array(audioData.length).keys()].map(i => i);
      this.attributes['index'] = 0;
      this.attributes['offsetInMilliseconds'] = 0;
      this.attributes['loop'] = true;
      this.attributes['shuffle'] = false;
      this.attributes['playbackIndexChanged'] = true;
      //  Change state to START_MODE
      this.handler.state = constants.states.START_MODE;

      const message = 'Welcome to the <emphasis level="strong"><prosody rate="x-slow"><phoneme alphabet="ipa" ph="ˈk.irtan">Kirtan</phoneme></prosody></emphasis> Player. You can say, play the <emphasis level="strong"><prosody rate="x-slow"><phoneme alphabet="ipa" ph="ˈk.irtan">Kirtan</phoneme></prosody></emphasis> to begin.';
      const reprompt = 'You can say, play the kirtan, to begin.';

      this.response.speak(message).listen(reprompt);
      this.emit(':responseReady');
    },
    'PlayAudio': function() {
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
    'AMAZON.HelpIntent': function() {
      var message = 'Welcome to the <emphasis level="strong"><prosody rate="x-slow"><phoneme alphabet="ipa" ph="ˈk.irtan">Kirtan</phoneme></prosody></emphasis> Player. You can say, play the kirtan, to begin.';
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function() {
      var message = 'Good bye.';
      this.response.speak(message);
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function() {
      var message = 'Good bye.';
      this.response.speak(message);
      this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
      // No session ended logic
    },
    'Unhandled': function() {
      var message = 'Sorry, I could not understand. Please say, play kirtan, to begin.';
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    }
  }),
  playModeIntentHandlers: Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
    /*
     *  All Intent Handlers for state : PLAY_MODE
     */
    'LaunchRequest': function() {
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
        message = 'Welcome to the <emphasis level="strong"><prosody rate="x-slow"><phoneme alphabet="ipa" ph="ˈk.irtan">Kirtan</phoneme></prosody></emphasis> Player. You can say, play the <emphasis level="strong"><prosody rate="x-slow"><phoneme alphabet="ipa" ph="ˈk.irtan">Kirtan</phoneme></prosody></emphasis> to begin.';
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
    'PlayAudio': function() {
      controller.play.call(this)
    },
    'AMAZON.NextIntent': function() {
      controller.playNext.call(this)
    },
    'AMAZON.PreviousIntent': function() {
      controller.playPrevious.call(this)
    },
    'AMAZON.PauseIntent': function() {
      controller.stop.call(this)
    },
    'AMAZON.StopIntent': function() {
      controller.stop.call(this)
    },
    'AMAZON.CancelIntent': function() {
      controller.stop.call(this)
    },
    'AMAZON.ResumeIntent': function() {
      controller.play.call(this)
    },
    'AMAZON.LoopOnIntent': function() {
      controller.loopOn.call(this)
    },
    'AMAZON.LoopOffIntent': function() {
      controller.loopOff.call(this)
    },
    'AMAZON.ShuffleOnIntent': function() {
      controller.shuffleOn.call(this)
    },
    'AMAZON.ShuffleOffIntent': function() {
      controller.shuffleOff.call(this)
    },
    'AMAZON.StartOverIntent': function() {
      controller.startOver.call(this)
    },
    'AMAZON.HelpIntent': function() {
      // This will called while audio is playing and a user says "ask <invocation_name> for help"
      var message = 'You are listening to the <emphasis level="strong"><prosody rate="x-slow"><phoneme alphabet="ipa" ph="ˈk.irtan">Kirtan</phoneme></prosody></emphasis> Player. You can say, Next or Previous to navigate through the playlist. ' +
        'At any time, you can say Pause to pause the audio and Resume to resume.';
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
      // No session ended logic
    },
    'Unhandled': function() {
      var message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    }
  }),
  remoteControllerHandlers: Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued': function() {
      controller.play.call(this)
    },
    'PauseCommandIssued': function() {
      controller.stop.call(this)
    },
    'NextCommandIssued': function() {
      controller.playNext.call(this)
    },
    'PreviousCommandIssued': function() {
      controller.playPrevious.call(this)
    }
  }),
  resumeDecisionModeIntentHandlers: Alexa.CreateStateHandler(constants.states.RESUME_DECISION_MODE, {
    /*
     *  All Intent Handlers for state : RESUME_DECISION_MODE
     */
    'LaunchRequest': function() {
      const { title } = audioData[this.attributes['playOrder'][this.attributes['index']]];
      const message = `You were listening to ${title}. Would you like to resume?`;
      const reprompt = 'You can say yes to resume or no to play from the top.';
      this.response.speak(message.replace('&', 'and')).listen(reprompt);
      this.emit(':responseReady');
    },
    'AMAZON.YesIntent': function() {
      controller.play.call(this)
    },
    'AMAZON.NoIntent': function() {
      controller.reset.call(this)
    },
    'AMAZON.HelpIntent': function() {
      const { title } = audioData[this.attributes['index']];
      const message = `You were listening to ${title}. Would you like to resume?`;
      const reprompt = 'You can say yes to resume or no to play from the top.';
      this.response.speak(message.replace('&', 'and')).listen(reprompt);
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function() {
      var message = 'Good bye.';
      this.response.speak(message);
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function() {
      var message = 'Good bye.';
      this.response.speak(message);
      this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
      // No session ended logic
    },
    'Unhandled': function() {
      var message = 'Sorry, this is not a valid command. Please say help to hear what you can say.';
      this.response.speak(message).listen(message);
      this.emit(':responseReady');
    }
  })
};

export default stateHandlers;
