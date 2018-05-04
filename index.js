const http = require('http');
const url = require('url');
const dns = require('dns');
const SimpleBase = require('simple-base');

const port = process.env.PORT || '3000';

function getSubdomainRedirect(url) {
  try {
    const hostname = url.split(':')[0].trim();
    const subdomainCode = hostname.split('.').slice(0, -2).join('').trim();
    console.log('subdomainCode:', subdomainCode);
    let location = SimpleBase.decode(subdomainCode, 36).trim();

    // Somehow location can include a weird first character
    // See https://github.com/g-plane/simple-base/issues/1
    if (location.slice(1, 5) === 'http') location = location.slice(1);

    // We assume if the string starts with http it is an URL
    if (location.indexOf('http') === 0) return location;
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function createCname(url) {
  const code = SimpleBase.encode(url, 36);
  const cname = code.replace(/(.{63})/g, '$1.');
  return `${cname.trim('.')}.dnsforwarding.com`;
}

function resolveCname(host) {
  return new Promise((resolve, reject) => {
    dns.resolveCname(host, (err, cnames) => {
      if (err) reject(err);
      resolve(cnames);
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname;

    let host = req.headers.host;
    if (!host) return res.end('Something is wrong at our end, mail us. #nohost');

    if (pathname === '/favicon.ico') {
      res.writeHead(404);
      return res.end();
    }
    else if (host.split('.').length === 2 && pathname === '/') {
      res.writeHead(200, {'Content-Type': 'text/html' });
      return res.end(`<h1>dnsforwarding.com</h1><p>Add URL as path to our website URL <a href="/http://example.com">https://dnsforwarding.com/http://example.com</a></p>`)
    } else if (host.split('.').length === 2 && pathname.indexOf('/http') === 0) {
      const path = url.parse(req.url).path;
      const hash = url.parse(req.url).hash;
      const fullPath = `${path}${hash}`;
      const cname = createCname(fullPath.slice(1));
      return res.end(`<h1>dnsforwarding.com</h1><p>Create a CNAME with this value:<br><a href="http://${cname}">${cname}</a></p><p>And it will redirect to your URL</p>`);
    }

    // Find url based on hostname
    const hostLocation = getSubdomainRedirect(host);
    if (hostLocation) {
      res.writeHead(302, { 'Location': hostLocation });
      return res.end();
    }

    // Find url based on cname of hostname
    const cnames = await resolveCname(host);
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
