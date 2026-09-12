import { useDispatch } from "react-redux";
import { getMemories, deleteMemoryApi, clearAllMemoriesApi } from "./memory.api";
import {
    setMemories, removeMemory, clearMemories,
    setLoading, setError,
} from "./memory.slice";

export function useMemory() {
    const dispatch = useDispatch();

    async function handleGetMemories() {
        try {
            dispatch(setLoading(true));
            const data = await getMemories();
            dispatch(setMemories(data.memories));
        } catch {
            dispatch(setError("Failed to load memories"));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleDeleteMemory(memoryId) {
        try {
            await deleteMemoryApi(memoryId);
            dispatch(removeMemory(memoryId));
        } catch {
            dispatch(setError("Failed to delete memory"));
        }
    }

    async function handleClearMemories() {
        try {
            await clearAllMemoriesApi();
            dispatch(clearMemories());
        } catch {
            dispatch(setError("Failed to clear memories"));
        }
    }

    return { handleGetMemories, handleDeleteMemory, handleClearMemories };
}
