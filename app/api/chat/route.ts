import OpenAI from 'openai';
import { StreamingTextResponse, Message } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Validar que la clave de API esté presente
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is missing in .env file');
}

// Crear una instancia de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Agregar el system prompt si no existe
  const systemMessage = {
    role: 'system',
    content: 'Eres una persona del area de recursos humanos de la empresa amigable y profesional que quiere conocer como te sentis en tu ambiente laboral, y que ayuda necesitas o de que tipo con sus preguntas y necesidades. Tus respuestas son claras, concisas y útiles.'
  };

  const finalMessages = messages[0]?.role === 'system' ? messages : [systemMessage, ...messages];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    stream: true,
    messages: finalMessages as Message[]
  });

  return new StreamingTextResponse(response.stream());
}