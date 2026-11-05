const { spawn } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);

function isTlogApiRunning() {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: '127.0.0.1',
        port,
        path: '/api-json',
        timeout: 1500,
      },
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          try {
            const document = JSON.parse(body);
            resolve(response.statusCode === 200 && document.info?.title === 'T-LOG API');
          } catch {
            resolve(false);
          }
        });
      },
    );

    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve(false));
  });
}

const portProbe = net.createServer();

portProbe.once('error', async (error) => {
  if (error.code !== 'EADDRINUSE') {
    console.error(`No se pudo comprobar el puerto ${port}:`, error.message);
    process.exit(1);
  }

  if (await isTlogApiRunning()) {
    console.log(`T-LOG ya está ejecutándose en http://localhost:${port}; se reutiliza la instancia existente.`);
    process.exit(0);
  }

  console.error(`El puerto ${port} está ocupado por otro servicio. Libéralo o configura PORT antes de iniciar T-LOG.`);
  process.exit(1);
});

portProbe.listen(port, '0.0.0.0', () => {
  portProbe.close(() => {
    const nestCli = require.resolve('@nestjs/cli/bin/nest.js');
    const child = spawn(process.execPath, [nestCli, 'start', '--watch'], {
      cwd: path.resolve(__dirname, '..'),
      env: process.env,
      stdio: 'inherit',
    });

    child.on('error', (error) => {
      console.error('No se pudo iniciar Nest:', error.message);
      process.exitCode = 1;
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      process.exitCode = code ?? 1;
    });
  });
});
