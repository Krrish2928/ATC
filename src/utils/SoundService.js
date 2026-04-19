/**
 * SoundService
 * Uses browser's built-in Text-to-Speech (SpeechSynthesis) for mission alerts.
 */
class SoundService {
  constructor() {
    this.MAX_ALERTS = 3;
    this.alertCounts = {
      emergency: 0,
      lowFuel: 0,
      proximity: 0
    };
    
    // Load toggle states from localStorage or default to 0
    this.initializeAlerts();

    // Reset counters every 10 minutes
    setInterval(() => {
      this.resetCounters();
    }, 10 * 60 * 1000);
  }

  initializeAlerts() {
    ['emergency', 'lowFuel', 'proximity'].forEach(type => {
      const stored = localStorage.getItem(`atc_voice_alert_${type}`);
      if (stored === 'off') {
        this.alertCounts[type] = 999;
      }
    });
  }

  resetCounters() {
    ['emergency', 'lowFuel', 'proximity'].forEach(type => {
      const stored = localStorage.getItem(`atc_voice_alert_${type}`);
      if (stored !== 'off') {
        this.alertCounts[type] = 0;
      }
    });
  }

  toggleAlert(type, enabled) {
    if (enabled) {
      this.alertCounts[type] = 0;
      localStorage.setItem(`atc_voice_alert_${type}`, 'on');
    } else {
      this.alertCounts[type] = 999;
      localStorage.setItem(`atc_voice_alert_${type}`, 'off');
    }
  }

  isAlertEnabled(type) {
    return localStorage.getItem(`atc_voice_alert_${type}`) !== 'off';
  }

  speak(message, type) {
    // Check limits
    if (type && this.alertCounts[type] >= this.MAX_ALERTS) return;

    // Increment count if a type is provided
    if (type) this.alertCounts[type]++;

    // Cancel any ongoing speech to prioritize the new alert
    window.speechSynthesis.cancel();
    
    const SynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
    const utterance = new SynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Use default voice if en-US is not found
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang.includes('en-US')) || voices[0];

    window.speechSynthesis.speak(utterance);
  }

  playEmergency(flightNumber) {
    this.speak(`Mayday. Emergency declared by flight ${flightNumber}. Immediate priority landing required.`, 'emergency');
  }

  playLowFuel(flightNumber) {
    this.speak(`Caution. Flight ${flightNumber} is reporting low fuel. Runway assignment recommended.`, 'lowFuel');
  }

  playProximity(f1, f2, distance) {
    this.speak(`Proximity alert. Flight ${f1} and ${f2} are ${distance} kilometers apart. Maintain separation.`, 'proximity');
  }

  playRunwayCleared(id) {
    this.speak(`Runway ${id} is now clear and available for next assignment.`);
  }
}

export const soundService = new SoundService();
