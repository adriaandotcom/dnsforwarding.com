const http = require('http');
const dns = require('dns');
const SimpleBase = require('simple-base');

const port = process.env.PORT || '3000';

function getSubdomainRedirect(url) {
  const hostname = url.split(':')[0];
  const subdomainCode = hostname.split('.').slice(0, -2).join('');
  const location = SimpleBase.decode(subdomainCode, 36);
  if (location.indexOf('http') === 0) return location;
  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host;
    if (!host) return res.end('Something is wrong at our end, mail us. #nohost');

    if (host.split('.').length === 2) return res.end('Homepage of dnsforwarding.com');

    // Find url based on hostname
    const hostLocation = getSubdomainRedirect(host);
    if (hostLocation) {
      res.writeHead(302, { 'Location': hostLocation });
      return res.end();
    }

    // Find url based on cname of hostname
    const cnames = await dns.resolveCname(host);
    if (cnames && cnames[0]) {
      const cnameLocation = getSubdomainRedirect(cnames[0]);
      if (cnameLocation) {
        res.writeHead(302, { 'Location': cnameLocation });
        return res.end();
      }
    }

    return res.end('No redirect found in this url. #notfound');
  } catch (e) {
    console.error(e);
    res.end('Something is wrong at our end, mail us. #catch');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
