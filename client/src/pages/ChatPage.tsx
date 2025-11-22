import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

type Role = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

const createMessage = (overrides?: Partial<ChatMessage>): ChatMessage => ({
  id: Math.random().toString(36).slice(2),
  role: "assistant",
  content: "",
  ...overrides,
});

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const canSubmit = useMemo(
    () => input.trim().length > 0 && !isStreaming,
    [input, isStreaming]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userText = input.trim();

    console.log('[CLIENT] Submit triggered');

    if (!userText || isStreaming) {
      console.log('[CLIENT] Ignoring submit - empty input or already streaming');
      return;
    }

    const userMessage = createMessage({ role: "user", content: userText });
    const assistantMessage = createMessage({ role: "assistant", content: "" });

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setError(null);
    setIsStreaming(true);

    const conversation = [...messages, { role: "user", content: userText }]
      .map(({ role, content }) => ({ role, content }))
      .filter(
        (message): message is { role: Role; content: string } =>
          typeof message.role === "string" &&
          typeof message.content === "string"
      );

    console.log('[CLIENT] Sending', conversation.length, 'messages to server');
    console.log('[CLIENT] API URL:', `${API_BASE_URL}/api/chat`);

    try {
      console.log('[CLIENT] Fetching...');
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: conversation }),
      });

      console.log('[CLIENT] Response received:', response.status, response.statusText);
      console.log('[CLIENT] Response OK:', response.ok);
      console.log('[CLIENT] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok || !response.body) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error('[CLIENT] Response not OK:', errorText);
        throw new Error(`Failed to connect to chat service (${response.status})`);
      }

      console.log('[CLIENT] Starting to read stream...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let chunkCount = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('[CLIENT] Stream done, received', chunkCount, 'chunks');
          break;
        }

        if (value) {
          chunkCount++;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
          const currentText = assistantText;

          if (chunkCount === 1) {
            console.log('[CLIENT] First chunk received:', chunk.substring(0, 50));
          }

          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: currentText }
                : message
            )
          );
        }
      }

      assistantText += decoder.decode();
      console.log('[CLIENT] Final text length:', assistantText.length);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: assistantText }
            : message
        )
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong";
      console.error('[CLIENT] Error:', caughtError);
      console.error('[CLIENT] Error message:', message);
      setError(message);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessage.id)
      );
    } finally {
      console.log('[CLIENT] Cleaning up, setting isStreaming to false');
      setIsStreaming(false);
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h1>Frontdoor</h1>
      </header>

      <div className="chat-window">
        {messages.length === 0 && (
          <p className="placeholder">No messages yet... Make a request!</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <span className="message-role">
              {message.role === "user" ? "You" : "Assistant"}
            </span>
            <p>
              {message.content ||
                (message.role === "assistant" && isStreaming ? "…" : "")}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="chat-error">{error}</div>}

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="What legal request do you have?"
          disabled={isStreaming}
        />
        <button type="submit" disabled={!canSubmit}>
          {isStreaming ? "Thinking…" : "Send"}
        </button>
      </form>
    </div>
  );
}
