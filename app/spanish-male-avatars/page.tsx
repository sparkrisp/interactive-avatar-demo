"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip, Spinner, Button, Image } from "@nextui-org/react";

interface Avatar {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
}

interface Voice {
  id: string;
  name: string;
  description?: string;
  language?: string;
}

export default function SpanishMaleAvatarsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatarsAndVoices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/get-spanish-male-avatars');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al obtener avatares y voces: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAvatars(data.maleAvatars || []);
          setVoices(data.spanishVoices || []);
          setToken(data.token || null);
        } else {
          throw new Error(data.error || 'Error desconocido');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarsAndVoices();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Avatares Masculinos con Voz en Español</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" label="Cargando avatares y voces..." />
        </div>
      ) : error ? (
        <Card className="bg-red-100 mb-8">
          <CardBody>
            <p className="text-red-600">{error}</p>
          </CardBody>
        </Card>
      ) : (
        <>
          {token && (
            <Card className="mb-8 bg-green-50">
              <CardBody>
                <p className="text-green-600">
                  ✅ Conexión exitosa con la API de Heygen. Token de streaming obtenido correctamente.
                </p>
              </CardBody>
            </Card>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader className="bg-blue-50">
                <h2 className="text-xl font-semibold">Avatares Masculinos ({avatars.length})</h2>
              </CardHeader>
              <CardBody>
                {avatars.length === 0 ? (
                  <p className="text-gray-500">No se encontraron avatares masculinos.</p>
                ) : (
                  <div className="space-y-4">
                    {avatars.map((avatar) => (
                      <Card key={avatar.id} className="p-4">
                        <div className="flex items-center gap-4">
                          {avatar.thumbnail_url && (
                            <Image
                              src={avatar.thumbnail_url}
                              alt={avatar.name}
                              className="w-16 h-16 rounded-full object-cover"
                              fallbackSrc="https://via.placeholder.com/64"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold">{avatar.name}</h3>
                            <p className="text-sm text-gray-500">{avatar.description || 'Sin descripción'}</p>
                            <Chip size="sm" className="mt-2" color="primary">ID: {avatar.id}</Chip>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader className="bg-purple-50">
                <h2 className="text-xl font-semibold">Voces en Español ({voices.length})</h2>
              </CardHeader>
              <CardBody>
                {voices.length === 0 ? (
                  <p className="text-gray-500">No se encontraron voces en español.</p>
                ) : (
                  <div className="space-y-4">
                    {voices.map((voice) => (
                      <Card key={voice.id} className="p-4">
                        <div>
                          <h3 className="font-semibold">{voice.name}</h3>
                          <p className="text-sm text-gray-500">{voice.description || 'Sin descripción'}</p>
                          <div className="flex gap-2 mt-2">
                            <Chip size="sm" color="primary">ID: {voice.id}</Chip>
                            {voice.language && (
                              <Chip size="sm" color="secondary">Idioma: {voice.language}</Chip>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <Button 
              color="primary" 
              onClick={() => window.location.href = '/'}
              className="mx-2"
            >
              Volver al Inicio
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
