"use client";
import ControlledForm from "@/components/ui/client/controlledForm/form";
import sendAction from "@/server/actions/chat/sendAction";
import { ActionIcon, Input, TextInput } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { MdClear, MdSend } from "react-icons/md";
import { SiCcleaner } from "react-icons/si";
import { ChatFormState } from "../types";
import { error } from "console";
import { useDispatch } from "react-redux";
import {
  initiateNewMessageForStream,
  loadPreMessages,
  setAssistantMessage,
  setAssistantMessageStream,
  setUserMessage,
} from "@/lib/provider/features/chat/chat.slice";
import loadChatMessages from "@/server/actions/chat/loadMessages";
import userSession from "@/utils/generators/userSession";
import generateMessageID from "@/utils/generators/messegaID";

export default function ChatClientFormStreaming() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState({
    text: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    loadSessionMessages(userSession());
  }, []);

  async function loadSessionMessages(token: string) {
    const messages = await loadChatMessages(token);
    console.log(messages);
    if (messages.status) {
      dispatch(loadPreMessages(messages.payload));
    }
  }

  const handleFormSubmit = async (formData: FormData) => {
    const token = userSession();
    const text = formData.get("text") as string;
    if (text) {
      dispatch(setUserMessage({ id: generateMessageID(), content: text }));
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, token }),
      });

      console.log(response);

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder();
      let done = false;
      let message_id;
      let initiated = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        if (!initiated) {
          const slpittedChunk = chunk.split(":");
          if (slpittedChunk[0] === "thread") {
            console.log("Message Thread Initiated");
            message_id = slpittedChunk[1];
            dispatch(
              initiateNewMessageForStream({
                id: slpittedChunk[1],
              })
            );
            initiated = true;
          }
        } else {
          dispatch(
            setAssistantMessageStream({
              id: message_id ? message_id : "",
              content: chunk,
            })
          );
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      inputRef.current && (inputRef.current.value = "");
    }
  };

  return (
    <ControlledForm action={handleFormSubmit}>
      <div className="flex justify-center items-center gap-3 px-8 lg:px-20">
        <div>
          <ActionIcon size="lg" c="white" className="bg-secondary" radius={100}>
            <SiCcleaner className="text-lg" />
          </ActionIcon>
        </div>
        <div className="grow">
          <Input
            name="text"
            ref={inputRef}
            error={errors.text}
            radius="xl"
            placeholder="Ask Anything"
          />
        </div>
        <div>
          <ActionIcon
            type="submit"
            size="lg"
            c="white"
            className="bg-primary"
            radius={100}
          >
            <MdSend className="text-lg" />
          </ActionIcon>
        </div>
      </div>
    </ControlledForm>
  );
}