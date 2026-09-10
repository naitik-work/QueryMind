import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-3.7-flash",
    apiKey: process.env.GEMINI_API_KEY
});


export async function testAi() {
    model.invoke("India").then((response) => {
        console.log(response.text);
    })
}