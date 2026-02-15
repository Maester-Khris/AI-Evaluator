import { useSocket } from "@/features/chat/hooks/useSocket";
import type { MessageReview } from "../types";
import { useNotification } from "@/hooks/useNotification";

export const useAIReview = () => {
    const { socket, isConnected } = useSocket();
    const { show } = useNotification();

    const sendEvaluationToSocket = async (evaluation: MessageReview) => {
        console.log(`Rating message ${evaluation.message_id}: ${evaluation.rating} stars`);
        socket?.emit("response_evaluation", evaluation, (ack: any) => {
            console.log("Evaluation sent to socket", ack);
            show("Evaluation sent to socket", "success");
        });
    };

    return {
        sendEvaluationToSocket,
    };
}