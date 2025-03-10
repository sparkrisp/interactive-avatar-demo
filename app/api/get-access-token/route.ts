const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

/**
 * Valida y prepara la API key de Heygen
 * @returns La API key validada
 */
function getValidApiKey() {
  if (!HEYGEN_API_KEY) {
    throw new Error("API key is missing from .env");
  }

  // Verificar si la clave ya está en el formato correcto o necesita decodificación
  let apiKey = HEYGEN_API_KEY;
  
  // Intentar determinar si la clave está en Base64
  const isBase64 = /^[A-Za-z0-9+/=]+$/.test(HEYGEN_API_KEY) && HEYGEN_API_KEY.length % 4 === 0;
  
  // Si parece estar en Base64, intentar decodificarla
  if (isBase64) {
    try {
      // En Node.js, decodificar Base64
      const decodedKey = Buffer.from(HEYGEN_API_KEY, 'base64').toString('utf-8');
      
      // Verificar si la clave decodificada tiene un formato válido (por ejemplo, si comienza con "hg_")
      if (decodedKey.startsWith("hg_") || /^[a-zA-Z0-9_-]{30,}$/.test(decodedKey)) {
        console.log("Using decoded API key");
        apiKey = decodedKey;
      }
    } catch (error) {
      console.warn("Failed to decode API key, using as-is");
    }
  }
  
  return apiKey;
}

export async function POST() {
  try {
    const apiKey = getValidApiKey();
    console.log("Attempting to fetch token with API key (first 5 chars):", apiKey.substring(0, 5) + "...");

    const res = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
        },
      },
    );
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API responded with status ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log("API Response structure:", JSON.stringify(data, null, 2));
    
    if (!data || !data.data || !data.data.token) {
      throw new Error(`Invalid response structure: ${JSON.stringify(data)}`);
    }

    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error retrieving access token:", error);

    return new Response(`Failed to retrieve access token: ${error.message || String(error)}`, {
      status: 500,
    });
  }
}
