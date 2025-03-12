import { NextResponse } from 'next/server';

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
      console.error('Error al obtener token de acceso:', errorText);
      return NextResponse.json({ error: `Error al obtener token de acceso: ${errorText}` }, { status: 500 });
    }

    const token = await tokenResponse.text();
    console.log('Token de acceso obtenido correctamente');

    // Obtener avatares disponibles
    console.log('Obteniendo avatares disponibles...');
    const avatarsResponse = await fetch(
      "https://api.heygen.com/v1/avatar.list",
      {
        method: "GET",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
      },
    );

    if (!avatarsResponse.ok) {
      const errorText = await avatarsResponse.text();
      console.error('Error al obtener avatares:', errorText);
      return NextResponse.json({ error: `Error al obtener avatares: ${errorText}` }, { status: 500 });
    }

    const avatarsData = await avatarsResponse.json();
    console.log(`Se encontraron ${avatarsData.data.length} avatares en total`);

    // Filtrar avatares masculinos
    const maleAvatars = avatarsData.data.filter((avatar: any) => 
      avatar.gender === 'male'
    );
    console.log(`Se encontraron ${maleAvatars.length} avatares masculinos`);

    // Obtener voces disponibles
    console.log('Obteniendo voces disponibles...');
    const voicesResponse = await fetch(
      "https://api.heygen.com/v1/voice.list",
      {
        method: "GET",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
      },
    );

    if (!voicesResponse.ok) {
      const errorText = await voicesResponse.text();
      console.error('Error al obtener voces:', errorText);
      return NextResponse.json({ error: `Error al obtener voces: ${errorText}` }, { status: 500 });
    }

    const voicesData = await voicesResponse.json();
    console.log(`Se encontraron ${voicesData.data.length} voces en total`);

    // Filtrar voces en español
    const spanishVoices = voicesData.data.filter((voice: any) => 
      voice.language?.toLowerCase().includes('spanish') || 
      voice.language?.toLowerCase().includes('español')
    );
    console.log(`Se encontraron ${spanishVoices.length} voces en español`);

    return NextResponse.json({ 
      success: true, 
      token,
      maleAvatars, 
      spanishVoices,
      totalAvatars: avatarsData.data.length,
      totalVoices: voicesData.data.length
    });
  } catch (error) {
    console.error('Error en el endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}
