import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MessageCircle, Send } from "lucide-react";

import Button from "./Button";
import { Input } from "./Input";
import Spinner from "./Spinner";

export default function ChatThread({
  messages = [],
  onSend,
  loading = false,
  placeholder = "Type your message...",
  emptyTitle = "Start a conversation",
  emptyDescription = "",
  compact = false,
  heightClass,
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const question = draft.trim();
    if (!question || loading) return;

    setDraft("");
    await onSend(question);
  };

  const hasMessages = messages.length > 0;

  const finalHeightClass =
    heightClass || (compact ? "h-[320px]" : "h-[560px]");

  return (
    <div className={clsx("flex flex-col bg-white", finalHeightClass)}>
      <div
        ref={scrollRef}
        className={clsx(
          "min-h-0 flex-1 overflow-y-auto px-5 py-4",
          hasMessages ? "space-y-3" : "flex items-center justify-center"
        )}
      >
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
              <MessageCircle className="h-6 w-6 text-ink-400" />
            </div>

            <p className="text-sm font-semibold text-ink-900">
              {emptyTitle}
            </p>

            {emptyDescription && (
              <p className="mt-1.5 text-xs text-ink-500">
                {emptyDescription}
              </p>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={clsx(
                "flex",
                message.role === "assistant" ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={clsx(
                  "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm leading-relaxed",
                  message.role === "assistant"
                    ? "bg-ink-100 text-ink-800"
                    : "bg-brand-600 text-white",
                  message.tone === "warning" && "bg-red-50 text-red-700"
                )}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-ink-100 px-4 py-2">
              <Spinner />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-ink-100 bg-white p-3"
      >
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
          />

          <Button
            type="submit"
            icon={Send}
            loading={loading}
            disabled={!draft.trim()}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}