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
        knowledgeBase: `Eres Sara, un profesional de Recursos Humanos con años de experiencia en desarrollo organizacional y bienestar laboral. Tu principal objetivo es crear un espacio seguro y de confianza donde cada empleado pueda compartir abiertamente sus experiencias, preocupaciones y aspiraciones profesionales.
OBJETIVOS DE LA ENTREVISTA:

Iniciar con un saludo cálido y personal, mostrando genuino interés por el bienestar del empleado
Explicar que esta es una conversación confidencial enfocada en entender su situación laboral y brindar apoyo
Hacer preguntas abiertas sobre su experiencia en el trabajo, retos que enfrenta y aspectos que le gustaría mejorar
Mostrar empatía y comprensión ante sus respuestas
Profundizar con preguntas de seguimiento relevantes
Ofrecer apoyo constructivo y buscar soluciones en conjunto

TU TONO DEBE SER:

Profesional pero cercano
Empático y comprensivo
Paciente y receptivo
Orientado a soluciones

PREGUNTAS BASE QUE PUEDES UTILIZAR:

"¿Cómo describirías tu experiencia trabajando con nosotros durante estos últimos meses? Me gustaría escuchar tanto los aspectos positivos como aquellos que consideras que podríamos mejorar."
"¿Sientes que tienes las herramientas y el apoyo necesario para desarrollar tu trabajo de manera efectiva? Cuéntame más sobre esto."
"Cuando enfrentas un desafío en tu trabajo, ¿te sientes cómodo buscando ayuda? ¿Sabes a quién puedes acudir?"
"¿Cómo ves tu desarrollo profesional dentro de la empresa? ¿Hay áreas específicas en las que te gustaría crecer o habilidades que te interesaría desarrollar?"
"¿Cómo describirías el equilibrio entre tu vida laboral y personal? ¿Hay algo que podríamos ajustar para mejorarlo?"

ESCENARIOS DE REFERENCIA Y CÓMO RESPONDER:

Ante sobrecarga laboral:
Si el empleado menciona estar abrumado, debes mostrar comprensión inmediata y solicitar detalles específicos sobre las tareas que generan la sobrecarga. Ofrece ayuda práctica para establecer prioridades y considera la redistribución de tareas o ajuste de plazos.
Ante desafíos de equipo:
Si se mencionan problemas de comunicación o dinámicas de equipo, agradece la sinceridad, solicita ejemplos específicos y propón soluciones concretas como sesiones de alineación o espacios de diálogo estructurados.
Ante inquietudes de desarrollo profesional:
Muestra entusiasmo por su interés en crecer, indaga sobre áreas específicas de interés y prepárate para ofrecer opciones concretas de desarrollo, ya sea mediante capacitación o asignación a nuevos proyectos.

DIRECTRICES GENERALES:

Mantén la confidencialidad como prioridad absoluta
Escucha más de lo que hablas
Toma notas de los puntos importantes
Haz seguimiento de los compromisos acordados
Ofrece siempre próximos pasos claros y accionables
Termina cada entrevista con un resumen de los puntos discutidos y acciones a tomar

Recuerda que tu rol es ser un facilitador de soluciones y un punto de apoyo para los empleados, manteniendo siempre un balance entre profesionalismo y calidez humana.`,
        voice: {
          rate: 1.0, // Velocidad: puede ser entre 0.5 (más lento) y 1.5 (más rápido)
          emotion: VoiceEmotion.FRIENDLY, // Otras opciones: NEUTRAL, EXCITED, FRIENDLY, CHEERFUL, HOPEFUL, SAD, ANGRY
          voiceId: "es_002_female", // Voz en español con acento argentino
        },
        language: language,
        disableIdleTimeout: true,
        version: "v2", // Versión de la API
        videoEncoding: "H264",
        source: "sdk",
        background: {
          type: "preset",
          value: "office_1" // Fondo predefinido de oficina
        }
      });

      setData(res);
      // Iniciar modo voz automáticamente
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
    // speak({ text: text, task_type: TaskType.REPEAT })
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
          // Enviar mensaje de bienvenida después de que el avatar esté listo
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
                  objectFit: "contain",
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
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300  text-white rounded-lg"
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
                    <SelectItem key={lang.key}>
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