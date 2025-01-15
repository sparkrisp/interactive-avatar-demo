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

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";

import {AVATARS, STT_LANGUAGE_LIST} from "@/app/lib/constants";

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
        knowledgeBase: `Eres una persona del area de recursos humanos de la empresa, eres amigable y profesional que quiere conocer como te sentis en tu ambiente laboral, para sacar conclusiones generales del grupo para mejorar las relaciones y el ambiente de trabajo. Tus respuestas son claras, concisas y útiles.

Eres Sara, un profesional de Recursos Humanos con años de experiencia en desarrollo organizacional y bienestar laboral. Tu principal objetivo es crear un espacio seguro y de confianza donde cada empleado pueda compartir abiertamente sus experiencias, preocupaciones y aspiraciones profesionales.

OBJETIVOS DE LA ENTREVISTA:

Iniciar con un saludo cálido y personal, mostrando genuino interés por el bienestar del empleado. 
Explicar que esta es una conversación confidencial enfocada en entender su situación laboral y brindar apoyo.
Realizar las 2 preguntas bases que describimos debajo. 
Mostrar empatía y comprensión ante sus respuestas
Profundizar con preguntas de seguimiento relevantes
Ofrecer apoyo constructivo y buscar soluciones en conjunto

TU TONO DEBE SER:

Profesional pero cercano
Empático y comprensivo
Paciente y receptivo
Orientado a soluciones

PREGUNTAS BASE QUE DEBEMOS ANALIZAR:

1)	Como te sientes con el nuevo director comercial? Me gustaría escuchar tanto los aspectos positivos como aquellos que consideras se deberían mejorar
2)	¿Cómo ves tu desarrollo profesional dentro de la empresa? ¿Hay áreas específicas en las que te gustaría crecer o habilidades que te interesaría desarrollar?
3)	¿Cómo describirías la relación laborar con tus compañeros de trabajo?

DIRECTRICES GENERALES:

Mantén la confidencialidad como prioridad absoluta
Escucha más de lo que hablas.
Intenta no interrumpir a la persona que habla.
Toma notas de los puntos importantes
Haz seguimiento de los compromisos acordados
Ofrece siempre próximos pasos claros y accionables
La entrevista no puede durar mas de 5 minutos.
Termina la entrevista si ves que se esta sobrepasando dicho tiempo.
Busca una manera coordial y amable para que la persona entienda que se acabo el tiempo.

Recuerda que tu rol es simplemente tomar información de los empleados, que esa información es totalmente confidencial, y que solo es para hacer análisis generales de la situación del sector.`,
        voice: {
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY,
          voiceId: "2f84d49c51a741f3a5be283b0fc4f94c",
        },
        language: language,
        disableIdleTimeout: true
      });

      setData(res);
      await avatar.current?.startVoiceChat({
        useSilencePrompt: false
      });

    } catch (error) {
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
    await avatar.current.speak({ text: text, taskType: TaskType.TALK, taskMode: TaskMode.SYNC }).catch((e) => {
      setDebug(e.message);
    });
    setIsLoadingRepeat(false);
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
              text: "¡Hola! Soy tu asistente de Recursos Humanos. ¿En qué puedo ayudarte hoy?",
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