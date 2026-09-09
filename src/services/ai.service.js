import { ChatMistralAI } from "@langchain/mistralai";

const model = new ChatMistralAI({
model: "mistral-small-latest",
temperature: 0
});

export async function testAi() {
    model.invoke("What is AI explain under 100 words?")
        .then((response) => {
            console.log(response.text);
        })
}
