const http = require('http');
const SimpleBase = require('simple-base');

const port = process.env.PORT || '3000';

const server = http.createServer((req, res) => {

  const referer = req.headers.referer;
  // const referer = 'http://sadfsdf.dnsforwarding.com/';
  if (!referer) return res.end('Something is wrong at our end, mail us.');
  const url = new URL(referer);

  const hostname = url.host.split(':')[0];
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
