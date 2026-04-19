import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Dashboard.module.css';
import { api } from '../../services/api';
import { MAPBOX_TOKEN } from '../config';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onNavigate, onTrackFlight, flights, isCollapsed, onToggle, systemMessage, activeFlightToTrack }) {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || '';
  
  useEffect(() => {
    if (flights && flights.length > 0) {
      console.log("SIDEBAR LIVE FLIGHT DATA [0]:", flights[0]);
    }
  }, [flights]);

  const getFlightNumber = (flight) => {
    if (!flight) return null;
    return flight.flight_number 
      || flight.callsign 
      || flight.flightNumber 
      || flight.id 
      || null;
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: firstName 
        ? `Welcome back, ${firstName}! 👋 I'm ARIA, your ATC Intelligence Assistant. I'm currently monitoring global flights in real-time. How can I assist you today?`
        : "Welcome to ATC Control Center. I'm ARIA, your ATC Intelligence Assistant. I'm monitoring global flights in real-time. Use the quick actions below or ask me anything.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [navStep, setNavStep] = useState(null); // 'navigating' | null
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [trackingHistory, setTrackingHistory] = useState([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Constants
  const QUICK_ACTIONS = [
    { 
      label: "📍 Track Flight", 
      onClick: () => {
        setInputValue("Track ");
        inputRef.current?.focus();
        
        // Generate random suggestions from live flights
        if (flights && flights.length > 0) {
          const suggestionsList = [...new Set(
            flights.map(getFlightNumber).filter(Boolean)
          )].sort(() => 0.5 - Math.random()).slice(0, 8);
          
          setSuggestions(suggestionsList);
          setShowSuggestions(true);
        }
      }
    },
    { label: "🏢 View Delhi Hub", query: "Show me Delhi airport" },
    { label: "🚨 Emergency Scan", query: "List all emergency flights" },
    { label: "⛽ Low Fuel Alerts", query: "Any low fuel warnings?" },
    { label: "🗺️ Global Traffic", query: "Show global traffic density" }
  ];

  const STATUS_STEPS = ["", "📡 Connecting to Sector...", "🛰️ Authenticating Uplink...", "🧠 Processing AI Query...", "✅ Sector Update Ready"];

  // Effect: Load History from Supabase
  useEffect(() => {
    const loadHistory = async () => {
        try {
            const history = await api.getHistory(user?.uid || null);
            setTrackingHistory(history.map(h => ({
                ...h,
                localId: h.id,
                timeStr: new Date(h.searched_at || h.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } catch (err) {
            console.warn('Failed to load history:', err);
        }
    };
    loadHistory();
  }, [user?.uid]);

  // Effect: Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, processingStep]);

  // Logic: Add to History
  const addFlightToHistory = async (flight) => {
    try {
        setTrackingHistory(prev => {
            const exists = prev.find(h => h.flightNumber === flight.flightNumber);
            if (exists) return prev;
            return [{ ...flight, localId: Date.now(), timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, 8);
        });

        // Backend Persistence
        await api.addHistory({
            flight_number: flight.flightNumber,
            origin: flight.origin,
            destination: flight.destination,
            airline: flight.airline,
            status: flight.status,
            lat: flight.lat,
            lng: flight.lng
        });
    } catch (err) {
        console.error('History persistence failed:', err);
    }
  };

  const removeHistoryItem = (localId) => {
    setTrackingHistory(prev => prev.filter(h => h.localId !== localId));
  };

  const clearHistory = () => {
    if (window.confirm("Clear all recent tracking history?")) {
      setTrackingHistory([]);
    }
  };

  // Logic: Speech Interface
  const isSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  let recognition = null;
  if (isSpeechSupported) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInputValue(text);
      handleSend(null, text);
    };

    recognition.onend = () => setIsRecording(false);
  }

  const toggleRecording = () => {
    if (!isSpeechSupported) return;
    if (isRecording) {
      recognition.stop();
    } else {
      setIsRecording(true);
      recognition.start();
    }
  };

  // Logic: Message Sending
  const handleSend = async (e, customQuery = null) => {
    e?.preventDefault();
    const textToSend = customQuery || inputValue;
    if (!textToSend.trim()) return;

    setShowSuggestions(false);

    // Add user message to chat immediately
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputValue('');

    const lowerText = textToSend.toLowerCase();

    // 1. Flight Tracking Intent Detection (Check FIRST)
    const TRACK_TRIGGERS = ['track', 'show', 'follow', 'monitor', 'find', 'locate', 'where is'];
    const flightRegex = /\b([A-Z]{2,3}-?\d{2,4})\b/i;
    const detectFlightTracking = (message) => {
      const lower = message.toLowerCase();
      const hasIntent = TRACK_TRIGGERS.some(t => lower.includes(t));
      const match = message.match(flightRegex);
      if (hasIntent && match) return match[1].toUpperCase();
      return null;
    };

    const trackedFlightNumber = detectFlightTracking(textToSend);
    if (trackedFlightNumber && onTrackFlight) {
        // Show assistant response in chat FIRST
        const botMsg = {
            id: Date.now() + 1,
            type: 'bot',
            text: `📡 Tracking ${trackedFlightNumber}. Locating aircraft on radar...`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            systemFooter: "ATC AI · Tracking Engaged"
        };
        setMessages(prev => [...prev, botMsg]);

        try {
            const flight = flights.find(f => 
              (f.flight_number || f.callsign || f.flightNumber || "").toUpperCase() === trackedFlightNumber.toUpperCase() ||
              (f.flight_number || f.callsign || f.flightNumber || "").replace('-', '').toUpperCase() === trackedFlightNumber.toUpperCase()
            );

            if (flight) {
                onTrackFlight(flight);
            } else {
                setTimeout(() => {
                  const notFoundMsg = {
                      id: Date.now() + 2,
                      type: 'bot',
                      text: `⚠️ Flight ${trackedFlightNumber} not found in current radar range. It may be outside active coverage or landed.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      systemFooter: "ATC AI · Sector Sync Error"
                  };
                  setMessages(prev => [...prev, notFoundMsg]);
                }, 1000);
            }
        } catch (err) {
            console.error("Track error:", err);
            const errorMsg = {
                id: Date.now() + 2,
                type: 'bot',
                text: `❌ Error locating ${trackedFlightNumber}. Systems re-syncing...`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                systemFooter: "ATC AI · System Fault"
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        return; 
    }

    // 2. Greetings Check (Check SECOND)
    const GREETING_WORDS = ['hi', 'hey', 'hello', 'hii', 'helo', 'howdy', 'sup', 'yo', 'good morning', 'good evening', 'how are you', 'what', 'why', 'who', 'when', 'help', 'thanks', 'ok', 'okay', 'yes', 'no'];
    const isGreeting = GREETING_WORDS.some(w => lowerText.trim() === w || lowerText.startsWith(w + ' '));

    // 3. Navigation Intent Detection (Check THIRD)
    let targetLocation = null;
    let targetKey = "";
    const LOCATIONS = {
      'delhi': { coords: [77.1025, 28.7041], zoom: 10 },
      'mumbai': { coords: [72.8777, 19.0760], zoom: 10 },
      'london': { coords: [-0.1278, 51.5074], zoom: 10 },
      'new york': { coords: [-74.0060, 40.7128], zoom: 10 },
      'dubai': { coords: [55.2708, 25.2048], zoom: 10 },
      'tokyo': { coords: [139.6917, 35.6895], zoom: 10 },
      'sydney': { coords: [151.2093, -33.8688], zoom: 12 },
      'singapore': { coords: [103.8198, 1.3521], zoom: 12 },
      'paris': { coords: [2.3522, 48.8566], zoom: 11 },
      'germany': { coords: [10.4515, 51.1657], zoom: 6 },
      'india': { coords: [78.9629, 20.5937], zoom: 5 },
      'usa': { coords: [-95.7129, 37.0902], zoom: 4 },
      'china': { coords: [104.1954, 35.8617], zoom: 4 },
      'brazil': { coords: [-51.9253, -14.2350], zoom: 4 },
      'australia': { coords: [133.7751, -25.2744], zoom: 4 },
      'canada': { coords: [-106.3468, 56.1304], zoom: 4 },
      'russia': { coords: [105.3188, 61.5240], zoom: 3 },
      'south africa': { coords: [22.9375, -30.5595], zoom: 5 },
      'karnataka': { coords: [75.7139, 15.3173], zoom: 7 },
      'maharashtra': { coords: [75.3126, 19.7515], zoom: 7 },
      'tamil nadu': { coords: [78.6569, 11.1271], zoom: 7 },
      'texas': { coords: [-99.9018, 31.9686], zoom: 6 },
      'california': { coords: [-119.4179, 36.7783], zoom: 6 }
    };

    Object.keys(LOCATIONS).forEach(key => {
      if (lowerText.includes(key)) {
        targetLocation = LOCATIONS[key];
        targetKey = key;
      }
    });

    const NAV_KEYWORDS = ["go to", "show me", "take me to", "fly to", "navigate to", "zoom into"];
    const hasExplicitNavIntent = NAV_KEYWORDS.some(k => lowerText.includes(k));
    const hasNavIntent = (lowerText.includes('show') || lowerText.includes('zoom') || lowerText.includes('view') || lowerText.includes('navigate')) && !isGreeting;

    // Add pseudo-flight to history for chatbot queries if it's a search
    if (hasNavIntent || targetLocation) {
        addFlightToHistory({
            flightNumber: "SYS-REQ",
            airline: textToSend.substring(0, 20) + (textToSend.length > 20 ? "..." : ""),
            origin: "AI-CORE",
            destination: targetKey.toUpperCase() || "GLOBAL",
            status: "normal",
            lat: targetLocation ? targetLocation.coords[1] : 0,
            lng: targetLocation ? targetLocation.coords[0] : 0
        });
    }

    setProcessingStep(1);
    
    // UI steps animation 
    let currentStep = 1;
    const progressInterval = setInterval(() => {
      currentStep++;
      if (currentStep <= 3) setProcessingStep(currentStep);
    }, 600);

    try {
        // Real API Call
        const response = await api.chat(textToSend, firstName);
        
        clearInterval(progressInterval);
        setProcessingStep(4);
        
        setTimeout(() => {
            setProcessingStep(0);
            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                systemFooter: response.intent === 'flight_query' ? "ATC AI · Flight Data Synced" : "ATC AI · Query Complete"
            };
            setMessages(prev => [...prev, botMsg]);

            // If the AI response involves a location focus, trigger navigation
            if (targetLocation && onNavigate && !isGreeting && (hasExplicitNavIntent || targetKey)) {
                onNavigate(targetLocation.coords, targetLocation.zoom);
            } else if (onNavigate && !isGreeting && hasExplicitNavIntent) {
                // Fallback: Use Mapbox geocoding to find any location mentioned
                const findLocation = async () => {
                    try {
                        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(textToSend)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
                        const geoRes = await fetch(geocodeUrl);
                        const geoData = await geoRes.json();
                        
                        if (geoData.features && geoData.features.length > 0) {
                            const [lng, lat] = geoData.features[0].center;
                            onNavigate([lng, lat], 6);
                        }
                    } catch (err) {
                        console.warn('Geocoding fallback failed:', err);
                    }
                };
                findLocation();
            }
        }, 500);

    } catch (err) {
        clearInterval(progressInterval);
        setProcessingStep(0);
        const errorMsg = {
            id: Date.now() + 1,
            type: 'bot',
            text: "🚨 AI system temporarily unavailable. Directing query to manual frequency...",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            systemFooter: "System Status: ERROR"
        };
        setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleClickSuggestion = (fn) => {
    handleSend(null, `Track ${fn}`);
    setShowSuggestions(false);
  };

  return (
    <div className={`${styles.sidebarWrapper} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarTab} onClick={onToggle}>
        {isCollapsed ? '›' : '‹'}
      </div>

      <div className={styles.sidebarContent}>
        <div className={styles.sidebarHeader}>
          <h2>AI Assistant</h2>
          <p>ATC Control Intelligence</p>
        </div>

        <div className={styles.chatArea}>
          {messages.map((msg, index) => (
            <div key={msg.id}>
              <div className={`${styles.message} ${msg.type === 'bot' ? styles.botMessage : styles.userMessage}`}>
                {msg.text}
                {msg.systemFooter && <span className={styles.messageMeta}>{msg.systemFooter}</span>}
              </div>
              
              {msg.type === 'bot' && index === messages.length - 1 && (
                <div className={styles.quickActions}>
                  {QUICK_ACTIONS.map(action => (
                    <button 
                      key={action.label} 
                      className={styles.quickActionPill}
                      onClick={() => {
                        if (action.onClick) {
                          action.onClick();
                        } else {
                          handleSend(null, action.query);
                        }
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {processingStep > 0 && (
            <div className={styles.statusBubble}>
              <div className={styles.statusText}>{STATUS_STEPS[processingStep]}</div>
              <div className={styles.statusProgress} style={{ width: `${(processingStep / 4) * 100}%` }} />
            </div>
          )}

          {navStep && (
            <div className={styles.statusBubble}>
              <div className={styles.statusText}>{navStep.text}</div>
              <div className={styles.statusProgress} style={{ width: '100%', opacity: 0.6 }} />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Tracking History Wrapper */}
        <div className={styles.historySection}>
          <div className={styles.historyHeader} onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}>
            <div className={styles.historyTitle}>
              <span>{isHistoryExpanded ? '▼' : '▶'}</span>
              <span>🕐 Recent Searches</span>
              {trackingHistory.length > 0 && <span className={styles.historyBadge}>{trackingHistory.length}</span>}
            </div>
            {trackingHistory.length > 0 && (
              <div className={styles.historyActions}>
                <button className={styles.clearBtn} onClick={clearHistory}>Clear All</button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {isHistoryExpanded && (
              <motion.div 
                className={styles.historyListWrapper}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className={styles.historyList}>
                  {trackingHistory.length === 0 ? (
                    <div className={styles.emptyHistory}>
                      <span style={{ fontSize: '20px' }}>✈️</span>
                      No recent searches
                    </div>
                  ) : (
                    trackingHistory.map((item) => (
                      <motion.div 
                        key={item.localId}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`${styles.historyCard} ${item.status === 'emergency' ? styles['status-red'] : item.status === 'low-fuel' ? styles['status-amber'] : ''}`}
                      >
                        <div className={styles.historyInfo}>
                          <div className={styles.historyTopLine}>
                            <span className={styles.historyFlightNum}>{item.flightNumber}</span>
                            <span className={styles.historyAirline}>{item.airline}</span>
                          </div>
                          <div className={styles.historyRoute}>{item.origin} → {item.destination}</div>
                          <div className={styles.historyTime}>{item.timeStr}</div>
                        </div>
                        <div className={styles.historyControls}>
                          <button 
                            className={styles.historyIconBtn}
                            onClick={() => {
                              if(item.lat !== 0 && onNavigate) onNavigate([item.lng, item.lat], 6);
                            }}
                            title="Fly to Location"
                          >
                            📍
                          </button>
                          <button 
                            className={styles.historyIconBtn}
                            onClick={() => removeHistoryItem(item.localId)}
                            title="Remove"
                          >
                            🗑️
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.chatInputArea}>
          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestionLayer} style={{ background: 'rgba(8, 20, 38, 0.98)' }}>
              <div className={styles.suggestionTitle}>LIVE SECTOR TRAFFIC:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px 0 8px 0' }}>
                {suggestions.map(fn => (
                  <button 
                    key={fn} 
                    onClick={() => {
                      handleSend(null, `Track ${fn}`);
                      setShowSuggestions(false);
                      setInputValue("");
                    }} 
                    style={{
                      fontSize: '11px', 
                      padding: '3px 10px',
                      border: '0.5px solid #4fc3f7', 
                      borderRadius: '2px',
                      background: 'rgba(79, 195, 247, 0.08)', 
                      color: '#4fc3f7',
                      cursor: 'pointer', 
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: '700',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(79, 195, 247, 0.2)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(79, 195, 247, 0.08)'}
                  >
                    {fn}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={styles.inputWrapper}>
            <input 
              ref={inputRef}
              type="text" 
              placeholder={isRecording ? "Listening..." : "Ask about any flight..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
            />
            {isSpeechSupported && (
              <button 
                type="button" 
                className={`${styles.micBtn} ${isRecording ? styles.recording : ''}`}
                onClick={toggleRecording}
              >
                🎤
              </button>
            )}
            <button type="button" className={styles.sendBtn} onClick={(e) => handleSend(e)}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
