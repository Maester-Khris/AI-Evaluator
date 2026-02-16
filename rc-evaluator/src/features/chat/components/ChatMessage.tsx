import { Code2, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MessageReview } from "@/features/review/components/MessageReview";
import type { MessageReview as MessageReviewType } from "@/features/review/types";
import { technicalComponents } from "./TechnicalMarkdown";
import { memo } from "react";

interface ChatMessageProps {
    message: any;
    isAssistant: boolean;
    textToShow: string;
    onEvaluate?: (evaluation: MessageReviewType) => void;
}

export const ChatMessage = ({ message, isAssistant, textToShow, onEvaluate }: ChatMessageProps) => {

    const MemoizedMarkdown = memo(({ content, components }: { content: string, components: any }) => (
        <ReactMarkdown components={components}>{content}</ReactMarkdown>
    ), (prevProps, nextProps) => {
        // Only re-render if the content actually changed
        return prevProps.content === nextProps.content;
    });

    return (
        <div
            className={`w-full border-b border-white/[0.03] py-10 transition-colors ${isAssistant ? "bg-blue-500/[0.01]" : "bg-transparent"
                }`}
        >
            <div className={`max-w-4xl mx-auto flex gap-6 px-4 md:px-6 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>
                {/* Technical Avatar Area */}
                <div className="flex flex-col items-center gap-3">
                    <div
                        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border shadow-xl ${isAssistant
                            ? "bg-[#030712] border-blue-500/30 text-blue-400"
                            : "bg-zinc-900 border-white/10 text-zinc-400"
                            }`}
                    >
                        {isAssistant ? <Terminal size={18} /> : <Code2 size={18} />}
                    </div>
                    {/* Optional: Line connector for high-density look */}
                    <div className="w-px flex-1 bg-gradient-to-b from-white/10 to-transparent" />
                </div>

                <div className={`flex-1 min-w-0 flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
                    {/* Header: Fixed metadata layout */}
                    <div className={`flex items-center gap-3 mb-4 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
                            {isAssistant ? "SYS.EVALUATOR_01" : "USER.OPERATOR"}
                        </span>
                        <div className="h-px w-8 bg-white/10" />
                        <span className="text-[9px] font-mono text-slate-600 uppercase">
                            {isAssistant ? "Response_Stream" : "CMD_Input"}
                        </span>
                    </div>

                    {/* Content Section: No bubble, just clean typography */}
                    <div className={`prose prose-invert prose-sm max-w-none text-slate-300 selection:bg-blue-500/30 ${!isAssistant ? "text-right" : ""}`}>
                        {/* <ReactMarkdown components={technicalComponents}>
                            {textToShow}
                        </ReactMarkdown> */}
                        <MemoizedMarkdown content={textToShow} components={technicalComponents} />
                    </div>

                    {/* Action Area for Assistant */}
                    {isAssistant && onEvaluate && (
                        <div className="mt-8 pt-6 border-t border-white/[0.05] w-full max-w-md">
                            <MessageReview
                                initialRating={message.rating}
                                initialComment={message.evaluationComment}
                                onAction={(rating, comment) =>
                                    onEvaluate({
                                        message_id: message.id,
                                        rating,
                                        comment,
                                    })
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
