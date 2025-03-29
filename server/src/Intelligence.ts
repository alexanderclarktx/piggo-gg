import OpenAI from "openai"

// const client = new OpenAI()

// export const gptPrompt = async (content: string): Promise<string[]> => {
//   try {
//     const thread = await client.beta.threads.create()

//     await client.beta.threads.messages.create(
//       thread.id,
//       { role: "user", content }
//     )

//     const run = await client.beta.threads.runs.createAndPoll(
//       thread.id,
//       { assistant_id: "asst_nb4ZZUQH7EDvYUMsxuI5oUv4" }
//     )

//     const messages = await client.beta.threads.messages.list(run.thread_id)


//     for (const message of messages.data.reverse()) {
//       if (message.role === "assistant") {
//         // @ts-expect-error
//         const result = message.content[0].text.value

//         const commands = [...result.matchAll(/(\/[^\n]+)/g)].map((match) => match[1])
//         return commands
//       }
//     }
//   } catch (error) {
//     console.error("gptPrompt error", error)
//   }

//   return []
// }
