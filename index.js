const http = require('http');
const SimpleBase = require('simple-base');

const hostname = '127.0.0.1';
const port = process.env.PORT || '3000';

const server = http.createServer((req, res) => {
  const hostnameWithPort = req.headers.host.split('.').slice(-2).join('.');
  const hostname = hostnameWithPort.split(':')[0];
  const subdomainCode = req.headers.host.split('.').slice(0, -2).join('');
  const location = SimpleBase.decode(subdomainCode, 36);
  res.writeHead(302, { 'Location': location });
  res.end();
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
