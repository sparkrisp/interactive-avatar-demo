import { NextResponse } from 'next/server.js';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function GET() {
  try {
    if (!HEYGEN_API_KEY) {
      return NextResponse.json({ error: 'HEYGEN_API_KEY no está configurado en las variables de entorno' }, { status: 500 });
    }

    // Obtener un token de acceso para streaming
    console.log('Obteniendo token de acceso para streaming...');
    const tokenResponse = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
      },
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Error al obtener token de streaming:', errorText);
      return NextResponse.json({ 
        error: 'Error al obtener token de streaming', 
        status: tokenResponse.status,
        details: errorText
      }, { status: tokenResponse.status });
    }

    const tokenData = await tokenResponse.json();
    const streamingToken = tokenData.data.token;
    console.log('Token de streaming obtenido correctamente');

    // En lugar de intentar obtener avatares y voces directamente de la API,
    // proporcionamos una lista predefinida de avatares masculinos y voces en español
    // basados en la documentación y ejemplos de Heygen
    
    const predefinedMaleAvatars = [
      {
        id: 'Onat_Suit_Front_public',
        name: 'Eduardo - Enólogo Profesional',
        description: 'Avatar masculino con traje, ideal para presentaciones profesionales',
        thumbnail_url: 'https://via.placeholder.com/150?text=Eduardo'
      },
      {
        id: 'Onat_Casual_Front_public',
        name: 'Eduardo - Casual',
        description: 'Versión casual del avatar Eduardo',
        thumbnail_url: 'https://via.placeholder.com/150?text=Eduardo+Casual'
      },
      {
        id: 'Noah_Front_public',
        name: 'Noah',
        description: 'Avatar masculino joven y moderno',
        thumbnail_url: 'https://via.placeholder.com/150?text=Noah'
      },
      {
        id: 'Yoshi_Front_public',
        name: 'Yoshi',
        description: 'Avatar masculino de aspecto asiático',
        thumbnail_url: 'https://via.placeholder.com/150?text=Yoshi'
      }
    ];
    
    const predefinedSpanishVoices = [
      {
        id: 'ffb5979428d642abaa9cae60110824e3',
        name: 'Español - Masculino',
        description: 'Voz masculina en español con acento neutro',
        language: 'es'
      },
      {
        id: 'es_male_miguel',
        name: 'Miguel',
        description: 'Voz masculina en español con acento castellano',
        language: 'es-ES'
      },
      {
        id: 'es_male_carlos',
        name: 'Carlos',
        description: 'Voz masculina en español con acento latinoamericano',
        language: 'es-419'
      }
    ];

    // Devolver los resultados
    return NextResponse.json({
      success: true,
      token: streamingToken,
      maleAvatars: predefinedMaleAvatars,
      spanishVoices: predefinedSpanishVoices
    });
  } catch (error) {
    console.error('Error al obtener token de streaming:', error);
    return NextResponse.json({ 
      error: 'Error al obtener token de streaming',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
