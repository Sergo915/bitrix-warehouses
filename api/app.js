/**
 * Bitrix24 opens a local application handler with a POST request containing
 * placement/authentication fields. Vercel static files only accept GET/HEAD,
 * so posting directly to the Vite entry point results in an empty 405 page.
 *
 * A 303 deliberately changes the follow-up request to GET, allowing Vercel to
 * serve the built SPA without exposing the Bitrix POST payload in the URL.
 */
export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Location', '/index.html');
  response.status(303).end();
}
