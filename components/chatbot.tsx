"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X, Stethoscope, Sparkles, Calendar } from "lucide-react";
import Image from "next/image";

interface ChatbotProps {
  patientData: {
    id: string;
    name: string;
    gender?: string;
    blood_group?: string;
    allergies?: string;
    medical_conditions?: string;
    medical_history?: string;
    lastVisit?: Date;
  };
}

interface DoctorCard {
  id: string;
  name: string;
  specialization: string;
  img?: string;
  colorCode?: string;
  department?: string;
  availability_status?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  doctors?: DoctorCard[];
}

const thinkingMessages = [
  "Reviewing your symptoms…",
  "Thinking carefully…",
  "Checking possible explanations…",
  "Preparing guidance…",
];

const quickPrompts = [
  "I have a headache",
  "Feeling feverish",
  "Stomach pain",
  "Chest discomfort",
  "Shoulder pain",
  "Feeling tired lately",
];

const greetingMessages = ["Hi", "Hello", "Hey", "Good to see you"];

const SPECIALIST_KEYWORDS: Record<string, string> = {
  cardiologist: "cardiologist",
  neurologist: "neurologist",
  psychiatrist: "psychiatrist",
  gastroenterologist: "gastroenterologist",
  ophthalmologist: "ophthalmologist",
  gynecologist: "obstetrician/gynecologist",
  obstetrician: "obstetrician/gynecologist",
  endocrinologist: "endocrinologist",
  orthopedic: "orthopedic",
  orthopaedic: "orthopedic",
  dermatologist: "dermatologist",
  pulmonologist: "pulmonologist",
  urologist: "urologist",
  nephrologist: "nephrologist",
  oncologist: "oncologist",
  rheumatologist: "rheumatologist",
  "general physician": "general physician",
  "family doctor": "general physician",
  "ent specialist": "ent",
};

function detectSpecialist(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [keyword, specialization] of Object.entries(SPECIALIST_KEYWORDS)) {
    if (lower.includes(keyword)) return specialization;
  }
  return null;
}

function renderContent(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}

export default function Mira({ patientData }: ChatbotProps) {
  const firstName = patientData?.name?.split(" ")[0] || "there";
  const randomGreeting =
    greetingMessages[Math.floor(Math.random() * greetingMessages.length)];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `${randomGreeting} ${firstName} 👋\n\nI'm **Mira** 🩺\nI'm here to help you understand what might be going on and guide you toward the right care.\n\nWhat's been bothering you today?`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const thinkingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    if (loading) {
      thinkingRef.current = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % thinkingMessages.length);
      }, 1800);
    } else {
      if (thinkingRef.current) clearInterval(thinkingRef.current);
      setThinkingIndex(0);
    }
    return () => {
      if (thinkingRef.current) clearInterval(thinkingRef.current);
    };
  }, [loading]);

  async function fetchDoctors(specialization: string): Promise<DoctorCard[]> {
    try {
      const res = await fetch("/api/doctors/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialization }),
      });
      const data = await res.json();
      return data.doctors || [];
    } catch {
      return [];
    }
  }

  async function sendMessage(customMessage?: string) {
    const finalMessage = customMessage || input;
    if (!finalMessage.trim() || loading) return;

    const userMessage: Message = { role: "user", content: finalMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: finalMessage,
          patientData: {
            id: patientData?.id,
            name: patientData?.name,
            gender: patientData?.gender,
            blood_group: patientData?.blood_group,
            allergies: patientData?.allergies,
            medical_conditions: patientData?.medical_conditions,
            medical_history: patientData?.medical_history,
            lastVisit: patientData?.lastVisit,
          },
          history: updatedMessages,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      const replyText = data.reply;

      const specialist = detectSpecialist(replyText);
      const isRecommendation =
        /recommend|specialist|see a|consult|visit/i.test(replyText);
      let doctors: DoctorCard[] = [];
      if (specialist && isRecommendation) {
        doctors = await fetchDoctors(specialist);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText, doctors },
      ]);

      if (!open) setHasUnread(true);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      {/* FLOATING BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl text-white flex items-center justify-center z-[9999] active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
          }}
          title="Open Mira"
        >
          <Stethoscope size={22} />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
          )}
        </button>
      )}

      {/* CHAT WINDOW */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex flex-col"
          style={{
            width: "380px",
            height: "640px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div
            className="relative h-full flex flex-col rounded-2xl overflow-hidden border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E2E8F0",
              boxShadow:
                "0 10px 40px -5px rgba(59,130,246,0.15), 0 4px 16px -2px rgba(0,0,0,0.08)",
            }}
          >
            {/* HEADER */}
            <div
              className="flex-shrink-0 px-4 py-3 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Sparkles size={17} className="text-white" />
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: "#22C55E" }}
                  />
                </div>
                <div>
                  <h1 className="text-white font-semibold text-sm leading-none">
                    Mira
                  </h1>
                  <p className="text-blue-100 text-[10px] mt-0.5">
                    Medical Intelligence & Response Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center transition hover:bg-white/20"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* STATUS BAR */}
            <div
              className="flex-shrink-0 px-4 py-1.5 flex items-center gap-2 border-b"
              style={{
                backgroundColor: "#EFF6FF",
                borderColor: "#DBEAFE",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#22C55E" }}
              />
              <p className="text-[10px] font-medium" style={{ color: "#64748B" }}>
                Mira is online · Not a replacement for professional medical care
              </p>
            </div>

            {/* CHAT BODY */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ backgroundColor: "#F8FAFC" }}
            >
              {messages.map((msg, index) => (
                <div key={index}>
                  {/* MESSAGE ROW */}
                  <div
                    className={`flex items-end gap-2 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* BOT AVATAR */}
                    {msg.role === "assistant" && (
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mb-0.5"
                        style={{ backgroundColor: "#DBEAFE" }}
                      >
                        <Sparkles size={12} style={{ color: "#3B82F6" }} />
                      </div>
                    )}

                    {/* MESSAGE BUBBLE */}
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 text-sm rounded-2xl whitespace-pre-wrap leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-br-sm text-white"
                          : "rounded-bl-sm"
                      }`}
                      style={
                        msg.role === "user"
                          ? {
                              background:
                                "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                              color: "#FFFFFF",
                              boxShadow: "0 2px 8px rgba(59,130,246,0.25)",
                            }
                          : {
                              backgroundColor: "#FFFFFF",
                              color: "#0F172A",
                              border: "1px solid #E2E8F0",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            }
                      }
                    >
                      {renderContent(msg.content)}
                    </div>

                    {/* USER AVATAR */}
                    {msg.role === "user" && (
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center font-semibold text-xs flex-shrink-0 mb-0.5"
                        style={{
                          backgroundColor: "#DBEAFE",
                          color: "#3B82F6",
                        }}
                      >
                        {firstName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* DOCTOR CARDS */}
                  {msg.doctors && msg.doctors.length > 0 && (
                    <div className="mt-2 ml-9 space-y-2">
                      <p
                        className="text-[10px] font-medium px-0.5"
                        style={{ color: "#64748B" }}
                      >
                        Available doctors for you 🩺
                      </p>
                      {msg.doctors.map((doc) => (
                        <div
                          key={doc.id}
                          className="rounded-xl p-3 flex items-center gap-3"
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          }}
                        >
                          {/* DOCTOR AVATAR */}
                          <div
                            className="h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm overflow-hidden"
                            style={{
                              backgroundColor: doc.colorCode || "#3B82F6",
                            }}
                          >
                            {doc.img ? (
                              <Image
                                src={doc.img}
                                alt={doc.name}
                                width={36}
                                height={36}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              doc.name[0]
                            )}
                          </div>

                          {/* DOCTOR INFO */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-semibold truncate"
                              style={{ color: "#0F172A" }}
                            >
                              {doc.name}
                            </p>
                            <p
                              className="text-[10px] truncate capitalize"
                              style={{ color: "#64748B" }}
                            >
                              {doc.specialization}
                            </p>
                            {doc.department && (
                              <p
                                className="text-[10px] truncate"
                                style={{ color: "#94A3B8" }}
                              >
                                {doc.department}
                              </p>
                            )}
                          </div>

                          {/* BOOK BUTTON */}
                          <a
                            href={`/record/appointments?doctor=${doc.id}`}
                            className="flex-shrink-0 flex items-center gap-1 text-[10px] font-medium text-white px-2.5 py-1.5 rounded-lg transition hover:opacity-90"
                            style={{
                              background:
                                "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                            }}
                          >
                            <Calendar size={10} />
                            Book
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* THINKING */}
              {loading && (
                <div className="flex items-end gap-2">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#DBEAFE" }}
                  >
                    <Sparkles size={12} style={{ color: "#3B82F6" }} />
                  </div>
                  <div
                    className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full animate-bounce"
                          style={{
                            backgroundColor: "#3B82F6",
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: "#64748B" }}>
                      {thinkingMessages[thinkingIndex]}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK PROMPTS */}
            {messages.length === 1 && !loading && (
              <div
                className="flex-shrink-0 px-3 py-2 flex flex-wrap gap-1.5 border-t"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2E8F0",
                }}
              >
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border transition hover:bg-blue-50 hover:border-blue-300"
                    style={{
                      backgroundColor: "#EFF6FF",
                      borderColor: "#DBEAFE",
                      color: "#3B82F6",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* INPUT */}
            <div
              className="flex-shrink-0 p-3 border-t flex items-center gap-2"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E2E8F0",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Tell Mira how you're feeling..."
                className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#0F172A",
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl text-white flex items-center justify-center transition active:scale-95 disabled:opacity-40 flex-shrink-0 hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
