const http = require('http');
const SimpleBase = require('simple-base');

const port = process.env.PORT || '3000';

const server = http.createServer((req, res) => {
  try {
    const host = req.headers.host;
    if (!host) return res.end('Something is wrong at our end, mail us. #nohost');
    const hostname = host.split(':')[0];

    console.log('hostname', hostname);

    if (hostname.split('.').length === 2) {
      return res.end('Homepage of dnsforwarding.com');
    }

    const subdomainCode = hostname.split('.').slice(0, -2).join('');
    const location = SimpleBase.decode(subdomainCode, 36);
    if (location.indexOf('http') === 0) {
      console.log('redirect to:', location);
      res.writeHead(302, { 'Location': location });
      return res.end();
    }
    console.error('something is wrong with decoding:', location);
    res.end('Something is wrong with your subdomain');
  } catch (e) {
    console.error(e);
    res.end('Something is wrong at our end, mail us. #catch');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
