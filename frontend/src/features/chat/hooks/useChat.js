import { useDispatch } from "react-redux";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { initializeSocketConnection } from "../service/chat.socket";
import { addMessages, addNewMessage, createNewChat, setChats, setCurrentChatId, setError, setLoading } from "../chat.slice";

export const useChat = () => {
    const dispatch = useDispatch();

    async function handleSendMessage({ message, chatId }) {
        dispatch(setLoading(true));
        const data = await sendMessage({ message, chatId });
        const { chat, aiMessage } = data;

        if (!chatId) {
            dispatch(createNewChat({
                chatId: chatId || chat._id,
                title: chat.title
            }));
        }


        dispatch(addNewMessage({
            chatId: chatId || chat._id,
            content: message,
            role: "user",
        }));
        dispatch(addNewMessage({
            chatId: chatId || chat._id,
            content: aiMessage.content,
            role: aiMessage.role,
        }))

        dispatch(setCurrentChatId(chatId || chat._id));

    }

    async function handleGetChats() {
        dispatch(setLoading(true));
        const data = await getChats();
        const { chats } = data;
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc;
        }, {})))
        dispatch(setLoading(false));
    }

    async function handleOpenChat(chatId, chats) {

        if (chats[chatId]?.messages.length === 0) {
            const data = await getMessages(chatId);
            const { messages } = data;

            const formatedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }));
            dispatch(addMessages({
                chatId,
                messages: formatedMessages,
            }));
        }
        dispatch(setCurrentChatId(chatId));
    }
    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat
    }
}