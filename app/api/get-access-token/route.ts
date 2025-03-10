const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

/**
 * Valida y prepara la API key de Heygen
 * @returns La API key validada
 */
export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }

    console.log("Attempting to fetch token with API key length:", HEYGEN_API_KEY.length);

    const res = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
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
