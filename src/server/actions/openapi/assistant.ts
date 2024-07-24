"use server";

import OpenAI from "openai";
import data from "./data.json";
import writeToJson from "./writeToJson";
import loadThreadMessages from "./messages";
import { ASSISTANT_ID } from "./constants";
import { IThread, ThreadMessages } from "./types";

const client = new OpenAI();

export default async function askFromAssistant(
  question: string,
  token: string,
  state: string
) {
  let assistants: any[] = data.assistants;
  let threads: IThread[] = data.threds;
  let messages: ThreadMessages[] = data.messages;

  let currentThread: OpenAI.Beta.Threads.Thread;
  let currentAssistant: OpenAI.Beta.Assistant;

  currentAssistant = await client.beta.assistants.retrieve(ASSISTANT_ID);

  if (currentAssistant && !assistants[0]) {
    assistants.push(currentAssistant);
  }

  console.log("Retrieving Data from JSON : ", data.threds);
  console.log("Data retrieved success");

  const user_messages = messages.find(
    (message) => message.session_id === token
  );
  if (user_messages?.session_id) {
    console.log("User Session Found : ", user_messages.thread_id);
    currentThread = await client.beta.threads.retrieve(user_messages.thread_id);
  } else {
    console.log("User Session Not Found");
    currentThread = await client.beta.threads.create();
    threads.push({
      ...currentThread,
      session_id: token,
      state,
      title: question,
    });
    messages.push({
      session_id: token,
      user_id: token,
      assistant_id: currentAssistant.id,
      thread_id: currentThread.id,
      messages: [],
    });
  }

  const message = await client.beta.threads.messages.create(currentThread.id, {
    content: question,
    role: "user",
  });

  const run = await client.beta.threads.runs.createAndPoll(currentThread.id, {
    assistant_id: currentAssistant.id,
  });

  console.log(`Thread ${currentThread.id} Run status`, run.status);

  if (run.status == "completed") {
    const result: OpenAI.Beta.Threads.Messages.MessagesPage =
      await client.beta.threads.messages.list(currentThread.id);
    console.log(result);

    // Update current threds messages list
    if (messages.length === 0) {
      messages.push({
        thread_id: currentThread.id,
        assistant_id: currentAssistant.id,
        session_id: token,
        user_id: token,
        messages: result.data,
      });
    } else {
      messages.map((message) => {
        console.log("Messages List : ", message);
        if (message.thread_id === currentThread.id) {
          message.messages = result.data;
          console.log("Messages Found");
        }
      });
    }

    await writeToJson(data, "'../data.json'");
    return createActionResponse(result.data);
  } else {
    console.log("Run Status : ", run.status);
    console.log("Run Details : ", run);
    return {
      status: false,
    };
  }
}

async function createActionResponse(
  messages: OpenAI.Beta.Threads.Messages.Message[]
) {
  const latestMessage = messages[0];

  const formattedMessage =
    latestMessage.content[0].type === "text"
      ? latestMessage.content[0].text.value
      : "None";

  console.log("Latest Message : ", formattedMessage);

  if (formattedMessage) {
    return {
      status: true,
      data: {
        id: latestMessage.id,
        content: formattedMessage,
      },
    };
  }

  return {
    status: false,
  };
}
