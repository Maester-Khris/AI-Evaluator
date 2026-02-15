import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { Textarea } from "@/common/ui/textarea";

interface MessageReviewProps {
    onAction: (rating: number, comment: string) => void;
}

export const MessageReview: React.FC<MessageReviewProps> = ({ onAction }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        if (rating > 0) {
            onAction(rating, comment);
            setIsSubmitted(true);
        }
    };

    // if (isSubmitted) {
    //     return (
    //         <div className="mt-2 text-xs text-green-400 font-medium">
    //             Thanks for your feedback!
    //         </div>
    //     );
    // }

    return (
        <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1">
                    <span className="text-xs text-zinc-400 mr-2">Rate response:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-colors"
                        >
                            <Star
                                size={14}
                                className={`${star <= rating
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-zinc-600 hover:text-zinc-400"
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                {rating > 0 && (
                    <div className="flex gap-2 items-end animate-in fade-in slide-in-from-top-2 duration-200">
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Optional feedback..."
                            className="min-h-[60px] text-xs bg-black/20 border-white/10 focus:border-white/20 resize-none p-2"
                        />
                        <button
                            onClick={handleSubmit}
                            className="h-[60px] w-[30px] flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};