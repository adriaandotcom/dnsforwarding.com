const http = require('http');
const SimpleBase = require('simple-base');

const hostname = '127.0.0.1';
const port = process.env.PORT || '3000';

const server = http.createServer((req, res) => {
  const hostnameWithPort = req.headers.host.split('.').slice(-2).join('.');
  const hostname = hostnameWithPort.split(':')[0];

  if (req.headers.host.split('.').length === 2) {
    return res.end('Homepage of dnsforwarding.com');
  }

  const subdomainCode = req.headers.host.split('.').slice(0, -2).join('');
  const location = SimpleBase.decode(subdomainCode, 36);
  if (location.indexOf('http') === 0) {
    res.writeHead(302, { 'Location': location });
    return res.end();
  }
  res.end('Something is wrong with your subdomain');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
