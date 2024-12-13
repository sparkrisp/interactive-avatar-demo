import OpenAI from "openai";
import { StreamingTextResponse } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Validar que la clave de API esté presente
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing in .env file");
}

// Crear una instancia de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Agregar el system prompt si no existe
  const systemMessage = {
    role: "system" as const,
    content:
      "Eres una persona del area de recursos humanos de la empresa amigable y profesional que quiere conocer como te sentis en tu ambiente laboral, y que ayuda necesitas o de que tipo con sus preguntas y necesidades. Tus respuestas son claras, concisas y útiles.",
  };

  const finalMessages = messages[0]?.role === "system" 
    ? messages 
    : [systemMessage, ...messages];

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    stream: true,
    messages: finalMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  return new StreamingTextResponse(response);
}