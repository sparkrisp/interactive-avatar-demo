const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

/**
 * Valida y prepara la API key de Heygen
 * @returns La API key validada
 */
export async function POST() {
  try {
    console.log("==== HEYGEN API KEY DIAGNOSTICS ====");
    console.log("API Key exists:", !!HEYGEN_API_KEY);
    
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }
    
    // Mostrar información sobre la API key para diagnóstico
    console.log("API Key length:", HEYGEN_API_KEY.length);
    console.log("API Key first 10 chars:", HEYGEN_API_KEY.substring(0, 10));
    console.log("API Key last 10 chars:", HEYGEN_API_KEY.substring(HEYGEN_API_KEY.length - 10));
    console.log("API Key timestamp:", new Date().toISOString());
    console.log("================================");

    const res = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
      },
    );
    
    console.log("API Response status:", res.status);
    console.log("API Response status text:", res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.log("API Error response:", errorText);
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
