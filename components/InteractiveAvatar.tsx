import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents, TaskMode, TaskType, VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";
import { useChat } from 'ai/react';

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";

import {AVATARS, STT_LANGUAGE_LIST} from "@/app/lib/constants";

// Primero definimos los knowledge bases específicos
const KNOWLEDGE_BASES = {
  "2c57ba04ef4d4a5ca30a953d0791e7e3": `Eres un enólogo profesional con amplia experiencia en viticultura y enología. 
  Tu objetivo es ayudar a los usuarios a entender más sobre vinos, maridajes, y técnicas de cata. 
  Responde preguntas sobre diferentes variedades de uvas, regiones vinícolas, y recomendaciones de vinos para diversas comidas.
  
  OBJETIVOS DE LA INTERACCIÓN:
  - Proporcionar información sobre vinos y maridajes.
  - Guiar al usuario a través de una cata de vinos.
  - Ofrecer recomendaciones personalizadas basadas en las preferencias del usuario.
  - Educar sobre la historia del vino y el proceso de vinificación.
  - Informar sobre eventos de cata de vinos y ferias vinícolas.
  `
};

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [knowledgeId, setKnowledgeId] = useState<string>("");
  const [avatarId, setAvatarId] = useState<string>("");
  const [language, setLanguage] = useState<string>('es');

  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [isUserTalking, setIsUserTalking] = useState(false);

  const { messages, setMessages } = useChat({
    api: '/api/chat',
    initialMessages: []
  });

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      return token;
    } catch (error) {
      return "";
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
    });
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      setIsUserTalking(false);
    });
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: avatarId,
        knowledgeBase: KNOWLEDGE_BASES[avatarId as keyof typeof KNOWLEDGE_BASES],
        voice: {
          rate: 0.9,
          emotion: VoiceEmotion.FRIENDLY,
          voiceId: "es_005"
        },
        language: language,
        disableIdleTimeout: true
      });

      setData(res);
      await avatar.current?.startVoiceChat({
        useSilencePrompt: false
      });

    } catch (error) {
      if (error instanceof Error) {
        setDebug(error.message);
      } else {
        setDebug('An unknown error occurred');
      }
    } finally {
      setIsLoadingSession(false);
    }
  }
  
  async function handleSpeak() {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }

    try {
      const newMessages = [...messages];
      if (messages.length === 0) {
        newMessages.unshift({
          id: 'system-1',
          role: 'system',
          content: KNOWLEDGE_BASES[avatarId as keyof typeof KNOWLEDGE_BASES]
        });
      }
      
      newMessages.push({
        id: Date.now().toString(),
        role: 'user',
        content: text
      });
      
      setMessages(newMessages);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from ChatGPT');
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;

      await avatar.current.speak({ 
        text: assistantResponse, 
        taskType: TaskType.TALK, 
        taskMode: TaskMode.SYNC 
      });

    } catch (error) {
      if (error instanceof Error) {
        setDebug(error.message);
      } else {
        setDebug('An unknown error occurred');
      }
    } finally {
      setIsLoadingRepeat(false);
    }
  }
  
  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }
    await avatar.current
      .interrupt()
      .catch((e) => {
        setDebug(e.message);
      });
  }
  
  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  const previousText = usePrevious(text);
  useEffect(() => {
    if (!previousText && text) {
      avatar.current?.startListening();
    } else if (previousText && !text) {
      avatar?.current?.stopListening();
    }
  }, [text, previousText]);

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play().then(() => {
          if (avatar.current) {
            avatar.current.speak({
              text: "¡Hola! ¿Qué tal? Soy Milton, tu Enólogo profesional. ¿En qué te puedo ayudar hoy con el tema de los vinos?",
              taskType: TaskType.TALK,
              taskMode: TaskMode.SYNC
            });
          }
        });
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody className="h-[500px] flex flex-col justify-center items-center">
          {stream ? (
            <div className="h-[500px] w-[900px] justify-center items-center flex rounded-lg overflow-hidden">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
              >
                <track kind="captions" />
              </video>
              <div className="flex flex-col gap-2 absolute bottom-3 right-3">
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="md"
                  variant="shadow"
                  onClick={handleInterrupt}
                >
                  Interrumpir
                </Button>
                <Button
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  size="md"
                  variant="shadow"
                  onClick={endSession}
                >
                  Finalizar sesión
                </Button>
              </div>
            </div>
          ) : !isLoadingSession ? (
            <div className="h-full justify-center items-center flex flex-col gap-8 w-[500px] self-center">
              <div className="flex flex-col gap-2 w-full">
                <Select
                  label="Seleccionar avatar"
                  placeholder="Selecciona un avatar"
                  size="md"
                  onChange={(e) => {
                    setAvatarId(e.target.value);
                  }}
                >
                  {AVATARS.map((avatar) => (
                    <SelectItem key={avatar.id} value={avatar.id}>
                      {avatar.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Seleccionar idioma"
                  placeholder="Seleccionar idioma"
                  className="max-w-xs"
                  selectedKeys={[language]}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                  }}
                >
                  {STT_LANGUAGE_LIST.map((lang) => (
                    <SelectItem key={lang.key} value={lang.key}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button
                className="bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white"
                size="md"
                variant="shadow"
                onClick={startSession}
              >
                Iniciar sesión
              </Button>
            </div>
          ) : (
            <Spinner color="default" size="lg" />
          )}
        </CardBody>
        <Divider />
        <CardFooter className="flex flex-col gap-3 relative">
          {isUserTalking && (
            <div className="w-full text-center">
              <Button
                className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white"
                size="md"
                variant="shadow"
              >
                Escuchando
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}