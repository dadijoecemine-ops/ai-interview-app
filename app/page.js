"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to Leaders Marketing! I am your AI Hiring Manager for today. Are you ready to begin your interview for the Appointment Setter position?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Auto-speak AI messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant") {
      speakText(lastMsg.content);
    }
  }, [messages]);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    setIsListening(true);
    audioChunksRef.current = [];

    // Microphone audio recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Mic access denied:", err);
    }

    // Speech-to-text recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      };

      recognition.start();
    } else {
      alert("Voice recognition not supported in this browser. Please use Chrome.");
      setIsListening(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4 flex flex-col h-screen">
      <h1 className="text-xl font-bold mb-4 text-center">
        🎙️ Leaders Marketing AI Voice Interviewer
      </h1>

      <div className="flex-1 overflow-y-auto border p-4 rounded-lg bg-gray-50 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              m.role === "assistant"
                ? "bg-blue-100 text-blue-900 self-start"
                : "bg-green-100 text-green-900 self-end ml-auto"
            } max-w-[80%]`}
          >
            <strong>{m.role === "assistant" ? "AI Interviewer:" : "Applicant:"}</strong>
            <p>{m.content}</p>
          </div>
        ))}
        {loading && <p className="text-gray-500 italic">AI is thinking & responding...</p>}
      </div>

      {audioUrl && (
        <div className="my-2 p-2 bg-yellow-50 border rounded flex flex-col items-center">
          <p className="text-xs text-gray-600 mb-1">Last Applicant Voice Recording:</p>
          <audio src={audioUrl} controls className="w-full h-8" />
        </div>
      )}

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={startRecording}
          className={`px-4 py-2 rounded text-white font-semibold ${
            isListening ? "bg-red-600 animate-pulse" : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {isListening ? "🎙️ Listening..." : "🎤 Speak Response"}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Or type/edit response..."
          className="flex-1 border rounded p-2 text-black"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </main>
  );
}
