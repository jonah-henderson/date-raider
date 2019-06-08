// NOTE: this doesn't offer any real security, since Vue will have to embed
//       the token at build time. However, it at least keeps it out of the git
//       repo.
//
//       This means that if someone pulled the token out of the built
//       source, or just opened the network tab in developer tools and grabbed it
//       there, and then tried to misbehave with it, I would have to revoke the
//       token from the IEX dashboard and rebuild the entire app with a new one.
//
//       A better solution would be to get the token from a custom backend server.
//       That way, in the event of shenanigans, I could deploy a new token in
//       more dynamically. However that's a lot of work for a toy app, so,
//       if it breaks, it breaks. ¯\_(ツ)_/¯
const apiToken = process.env["VUE_APP_IEX_API_TOKEN"];

export function constructApiEndpoint(symbol: string)
{
  return `https://cloud.iexapis.com/v1/stock/${symbol}/price?token=${apiToken}`;
}
