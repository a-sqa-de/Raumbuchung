require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

let cachedToken = null;
let tokenExpiryTime = null;

/**
 * Prüft, ob das aktuelle Token abgelaufen ist.
 */
const isTokenExpired = () => {
  if (!cachedToken || !tokenExpiryTime) return true;
  return Date.now() >= tokenExpiryTime;
};

/**
 * Fordert ein neues Access Token von Microsoft an.
 */
const fetchNewAccessToken = async () => {
  try {
    console.log('Debugging Token-Request:');
    console.log('TOKEN_ENDPOINT:', process.env.TOKEN_ENDPOINT);
    console.log('CLIENT_ID:', process.env.CLIENT_ID);
    console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET ? '***VERSTECKT***' : 'NICHT GESETZT');
    console.log('GRAPH_SCOPE:', process.env.GRAPH_SCOPE);

    const tokenRequestBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      scope: process.env.GRAPH_SCOPE
    });
    console.log('POST-Daten:', tokenRequestBody.toString());

    const response = await axios.post(process.env.TOKEN_ENDPOINT, tokenRequestBody);

    // Überprüfe die Antwort und das Access Token
    console.log('Token Response:', response.data);

    const { access_token, expires_in } = response.data;

    if (!access_token) {
      throw new Error('Access Token wurde nicht generiert.');
    }

    // Cache das Token und speichere die Ablaufzeit
    cachedToken = access_token;
    tokenExpiryTime = Date.now() + expires_in * 1000;

    console.log('Access Token erfolgreich aktualisiert:', access_token);
    return cachedToken;
  } catch (error) {
    console.error('Fehler beim Abrufen des Access Tokens:', error.response?.data || error.message);
    throw new Error('Token konnte nicht aktualisiert werden.');
  }
};

/**
 * Gibt ein gültiges Access Token zurück.
 * Erneuert das Token, falls es abgelaufen ist.
 */
const getAccessToken = async () => {
  if (isTokenExpired()) {
    return await fetchNewAccessToken();
  }
  return cachedToken;
};

/**
 * Holt Kalenderereignisse von Microsoft Graph
 */
const fetchCalendarEvents = async () => {
  try {
    // Token abrufen
    const token = await getAccessToken();

    // Debugging: Zeige die Anfrage-Details
    console.log('Access Token:', token);
    console.log('Request URL:', 'https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/calendar/events');
    console.log('Request Headers:', {
      Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
    });

    // Anfrage an Microsoft Graph senden
    const response = await axios.get('https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/calendar/events', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Optional, falls erforderlich
      }
    });
    console.log('Benutzerdetails:', response.data);

    console.log('Kalenderereignisse:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Fehlerdetails:', JSON.stringify(error.response.data, null, 2)); // Vollständige Fehlermeldung
    } else {
      console.error('Fehler:', error.message);
    }
    throw error;
  }
};


// Exportiere die Funktion für den Abruf von Kalenderdaten
module.exports = { getAccessToken, fetchCalendarEvents };
