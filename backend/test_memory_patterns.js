function extractMemory(message) {
    const trimmed = message.trim();
    const results = [];

    // 1. Name extraction
    const nameMatch1 = trimmed.match(/(?:my name is|call me|i am called)\s+([a-zA-Z0-9_\-\s]+?)(?:[,.]|\s+and\s+|\s+please|\s+remember|\s+save|$)/i);
    if (nameMatch1 && nameMatch1[1]) {
        const name = nameMatch1[1].trim();
        if (name.length >= 2 && name.length <= 40 && !/^(a|an|the|trying|learning|working|looking)$/i.test(name)) {
            results.push({
                type: "profile",
                content: `User's name is ${name}`,
                preferredName: name,
                importance: 5
            });
        }
    }

    // 2. Remember at start
    const rememberStart = trimmed.match(/^(?:please\s+)?remember\s+(?:that\s+|to\s+)?(.+)/i);
    if (rememberStart && rememberStart[1]) {
        let content = rememberStart[1].trim().replace(/[.!?]+$/, "");
        if (content.length >= 3) {
            results.push({
                type: "instruction",
                content: content,
                importance: 5
            });
        }
    }

    // 3. Remember at end (e.g., "my name is hamza and remember it", "I prefer TypeScript, please remember that")
    const rememberEnd = trimmed.match(/^(.+?)(?:[,.]|\s+and)?\s+(?:please\s+)?(?:remember\s+(?:it|this|that)|save\s+(?:this|it)|keep\s+in\s+mind)/i);
    if (rememberEnd && rememberEnd[1]) {
        let content = rememberEnd[1].trim().replace(/^(?:please\s+)?/, "").replace(/[.!?]+$/, "");
        if (content.length >= 3) {
            results.push({
                type: "instruction",
                content: content,
                importance: 5
            });
        }
    }

    // 4. Preferences ("I prefer React", "Always use dark mode", "I like Tailwind")
    const prefMatch = trimmed.match(/^(?:always\s+)?(?:i\s+prefer|i\s+like|prefer)\s+(.+)/i);
    if (prefMatch && prefMatch[1]) {
        let content = prefMatch[1].trim().replace(/[.!?]+$/, "");
        if (content.length >= 3) {
            results.push({
                type: "preference",
                content: `Prefers ${content}`,
                importance: 4
            });
        }
    }

    return results;
}

const testCases = [
    "I 1 chat i have given my name and told to remember",
    "My name is Hamza and remember it",
    "my name is hamza, remember this",
    "remember my name is Hamza",
    "remember that my name is Hamza",
    "Call me Hamza Khan",
    "I prefer dark mode and TypeScript, please remember it",
    "Remember to always format code in clean blocks",
    "My name is Hamza."
];

testCases.forEach(tc => {
    console.log(`\nInput: "${tc}"`);
    console.log("Extracted:", extractMemory(tc));
});
