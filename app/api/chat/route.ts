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
  const { messages, avatarId }: { messages: Message[]; avatarId?: string } = await req.json();

  // Usar el knowledge base específico del avatar si está disponible
  const systemMessage = {
    role: "system" as const,
    content: messages[0]?.role === "system" 
      ? messages[0].content 
      : "Eres un enólogo profesional, que contestarás con total apertura y experiencia, sobre el tema de los vinos, maridajes y técnicas de cata. Tus respuestas son claras, concisas y útiles.",
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
    temperature: 0.7,
    max_tokens: 150, // Limitar la longitud de las respuestas para que sean más naturales
  });

  return new StreamingTextResponse(response.toReadableStream());
}