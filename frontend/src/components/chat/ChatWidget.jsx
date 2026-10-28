import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../api/client.js';
import { usePortfolio } from '../../context/PortfolioContext.jsx';

const SUGGESTIONS = [
  'Who is Cedrick?',
  'What services does he offer?',
  'How much does a website cost?',
  'How can I contact him?',
];

const STORAGE_KEY = 'cedrick-ai-session';

const ChatWidget = () => {
  const { profile } = usePortfolio();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState('Auto');
  const scrollRef = useRef(null);
  const sessionRef = useRef(null);

  const aiName = profile.ai_name || 'Cedrick AI';
  const greeting =
    profile.ai_greeting ||
    "Hello! I'm Cedrick AI, your personal assistant. How can I help you today?";

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      sessionRef.current = stored;
      return;
    }
    sessionRef.current = `web-${Math.random().toString(36).slice(2)}${Date.now()}`;
    window.localStorage.setItem(STORAGE_KEY, sessionRef.current);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = useCallback(
    async (text) => {
      const message = (text ?? input).trim();
      if (!message || sending) return;

      setInput('');
      setSending(true);
      setMessages((current) => [...current, { role: 'user', content: message }]);

      try {
        const data = await api.post('/ai/chat', {
          message,
          session_id: sessionRef.current,
          language: language === 'Auto' ? 'auto' : language === 'RW' ? 'rw' : 'en',
          history: messages
            .filter((entry) => entry.role === 'user' || entry.role === 'assistant')
            .slice(-10)
            .map((entry) => ({ role: entry.role, content: entry.content })),
        });

        setMessages((current) => [
          ...current,
          { role: 'assistant', content: data?.response || 'Sorry, I could not answer that.' },
        ]);
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            content: error?.message || 'Something went wrong. Please try again.',
            error: true,
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [input, messages, sending],
  );

  const toggleLanguage = () => {
    setLanguage((current) => (current === 'Auto' ? 'EN' : current === 'EN' ? 'RW' : 'Auto'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Window */}
      <div
        className={`absolute bottom-[72px] right-0 flex w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink shadow-2xl transition-all duration-300 sm:w-[380px] ${
          open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible translate-y-5 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-700 bg-ink-900 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-gradient text-white">
              <i className="fas fa-robot" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{aiName}</h4>
              <span className="flex items-center gap-1.5 text-[11px] text-ink-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-ink-300 transition-colors hover:bg-ink-700 hover:text-white"
            aria-label="Close chat"
          >
            <i className="fas fa-xmark" />
          </button>
        </div>

        <div ref={scrollRef} className="scrollbar-thin flex max-h-[340px] flex-col gap-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <>
              <div className="flex max-w-[85%] gap-2">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-gradient text-white">
                  <i className="fas fa-robot text-xs" />
                </div>
                <div className="rounded-xl rounded-bl-sm bg-ink-700 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-100">
                  <p className="whitespace-pre-wrap">{greeting}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pl-9">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-ink-600 bg-ink-700 px-3 py-1.5 text-[11px] text-ink-300 transition-colors hover:border-primary-500 hover:bg-primary-500 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          ) : (
            messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={`flex gap-2 ${
                  entry.role === 'user' ? 'flex-row-reverse self-end' : 'self-start'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    entry.role === 'user' ? 'bg-ink-700 text-ink-300' : 'bg-teal-gradient text-white'
                  }`}
                >
                  <i className={`${entry.role === 'user' ? 'fas fa-user' : 'fas fa-robot'} text-xs`} />
                </div>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    entry.role === 'user'
                      ? 'rounded-br-sm bg-teal-gradient text-white'
                      : `rounded-bl-sm bg-ink-700 text-ink-100 ${
                          entry.error ? 'text-red-300' : ''
                        }`
                  }`}
                >
                  {entry.content}
                </div>
              </div>
            ))
          )}

          {sending ? (
            <div className="flex items-center gap-2 self-start">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-teal-gradient text-white">
                <i className="fas fa-robot text-xs" />
              </div>
              <div className="flex items-center gap-1 rounded-xl rounded-bl-sm bg-ink-700 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-ink-400" />
                <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-ink-400" />
                <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-ink-400" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-ink-700 bg-ink-900 px-4 py-1.5">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-700 px-3 py-1 text-[11px] text-ink-300 transition-colors hover:border-primary-500 hover:text-white"
            title="Toggle language"
          >
            <i className="fas fa-globe" /> {language}
          </button>
        </div>

        <form
          className="flex items-center gap-2 border-t border-ink-700 bg-ink-900 px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask me anything about Cedrick..."
            autoComplete="off"
            className="flex-1 rounded-xl border border-ink-600 bg-ink-700 px-3.5 py-2.5 text-[13px] text-white outline-none placeholder:text-ink-400 focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-gradient text-white transition-transform hover:scale-105 disabled:opacity-60"
            aria-label="Send message"
          >
            <i className="fas fa-paper-plane text-sm" />
          </button>
        </form>
      </div>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-teal-gradient text-white shadow-card transition-transform hover:scale-110"
        aria-label="Chat with AI Assistant"
      >
        <span
          className={`absolute inset-0 rounded-full border-2 border-primary-500/60 ${
            open ? 'hidden' : 'animate-pulse-ring'
          }`}
        />
        <i className={`fas ${open ? 'fa-xmark' : 'fa-comment-dots'} text-xl`} />
      </button>
    </div>
  );
};

export default ChatWidget;
