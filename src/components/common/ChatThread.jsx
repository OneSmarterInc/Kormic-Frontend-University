import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MessageCircle, Send } from "lucide-react";

import Button from "./Button";
import { Input } from "./Input";
import Spinner from "./Spinner";

/** Renders `**bold**` spans within a line of otherwise-plain text. */
function renderInline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/**
 * Lightweight markdown-ish formatter for agent replies: turns "**bold**", "# headings",
 * and "- "/"1. " lists into real elements instead of showing the raw symbols. ust enough to clean up what the agent actually produces.
 */
function FormattedMessage({ content }) {
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  content.split("\n").forEach((line) => {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const ordered = line.match(/^\d+\.\s+(.*)$/);

    if (heading) {
      flushList();
      blocks.push({ type: "heading", text: heading[2] });
    } else if (bullet) {
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
    } else if (ordered) {
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ordered[1]);
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push({ type: "text", text: line });
    }
  });
  flushList();

  return blocks.map((block, i) => {
    if (block.type === "heading") {
      return (
        <p key={i} className="mb-1 mt-2 font-semibold first:mt-0">
          {renderInline(block.text, i)}
        </p>
      );
    }
    if (block.type === "ul") {
      return (
        <ul key={i} className="my-1 list-disc space-y-0.5 pl-5">
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item, `${i}-${j}`)}</li>
          ))}
        </ul>
      );
    }
    if (block.type === "ol") {
      return (
        <ol key={i} className="my-1 list-decimal space-y-0.5 pl-5">
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item, `${i}-${j}`)}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={i} className="mb-1 last:mb-0">
        {renderInline(block.text, i)}
      </p>
    );
  });
}

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
    heightClass || (compact ? "h-[420px]" : "h-[560px]");

  return (
    <div className={clsx("flex min-h-0 flex-col bg-white", finalHeightClass)}>
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
                  "max-w-[85%] break-words rounded-2xl px-4 py-2 text-sm leading-relaxed",
                  message.role === "assistant"
                    ? "bg-ink-100 text-ink-800"
                    : "whitespace-pre-wrap bg-brand-600 text-white",
                  message.tone === "warning" && "bg-red-50 text-red-700"
                )}
              >
                {message.role === "assistant" ? (
                  <FormattedMessage content={message.content} />
                ) : (
                  message.content
                )}
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