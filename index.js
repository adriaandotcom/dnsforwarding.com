const http = require('http');
const SimpleBase = require('simple-base');

const port = process.env.PORT || '3000';

const server = http.createServer((req, res) => {

  console.log('host', req.headers.host);
  console.log('x-upstream 1', req.headers['X-Upstream']);
  console.log('x-upstream 2', req.headers['x-upstream']);

  console.log('JSON', JSON.stringify(req.headers));

  // const hostname = req.headers.host.split(':')[0];
  const hostnameWithPort = req.headers.host.split('.').slice(-2).join('.');
  const hostname = hostnameWithPort.split(':')[0];

  console.log('hostname', hostname);

  if (req.headers.host.split('.').length === 2) {
    return res.end('Homepage of dnsforwarding.com');
  }

  const subdomainCode = req.headers.host.split('.').slice(0, -2).join('');
  const location = SimpleBase.decode(subdomainCode, 36);
  if (location.indexOf('http') === 0) {
    console.log('redirect to:', location);
    res.writeHead(302, { 'Location': location });
    return res.end();
  }
  console.error('something is wrong with decoding:', location);
  res.end('Something is wrong with your subdomain');
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
