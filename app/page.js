"use client";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! Welcome to Leaders Marketing. I am your AI Interviewer today for the Appointment Setter position. Are you ready to begin?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "assistant", content: "Welcome to Leaders Marketing! I am your AI Hiring Manager for today. Are you ready to begin your interview for the Appointment Setter position?" }];
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
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif", padding: "20px" }}>
      <h2>AI Job Interviewer</h2>
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", minHeight: "300px", marginBottom: "16px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "12px", textAlign: m.role === "user" ? "right" : "left" }}>
            <strong>{m.role === "user" ? "Ikaw" : "AI Interviewer"}:</strong>
            <p style={{ margin: "4px 0", background: m.role === "user" ? "#e3f2fd" : "#f5f5f5", display: "inline-block", padding: "8px 12px", borderRadius: "8px" }}>
              {m.content}
            </p>
          </div>
        ))}
        {loading && <p><i>Naghunahuna ang AI...</i></p>}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I-type ang imong tubag diri..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: "10px 20px", borderRadius: "4px", background: "#0070f3", color: "#fff", border: "none", cursor: "pointer" }}>
          I-send
        </button>
      </div>
    </main>
  );
}
