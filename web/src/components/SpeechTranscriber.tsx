import React from "react";

// check if browser supports speech recognition
var SpeechRecognition: any = null;
if ("SpeechRecognition" in window) {
  SpeechRecognition = window.SpeechRecognition;
} else if ("webkitSpeechRecognition" in window) {
  SpeechRecognition = window.webkitSpeechRecognition;
}

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResult[]
}

export let SpeechTranscriber = () => {

  if (SpeechRecognition) {
    var recognition = new SpeechRecognition();

    // settings
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 0;
    recognition.start();

    // handle continuous transcription results
    var counter = 0;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log(event.results[counter][0].transcript, event.results[0][0].confidence);
        counter += 1;
    }
  }

  return (
    <div></div>
  );
};
