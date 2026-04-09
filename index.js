export default {
  async fetch(request, env, ctx) {
    return new Response('Hello World from Cloudflare Container!', {
      headers: {
        'content-type': 'text/plain',
      },
    });
  },
};
