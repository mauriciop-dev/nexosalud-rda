/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aseguramos que Next.js sirva correctamente los archivos de la carpeta public
  output: 'standalone', 
  async headers() {
    return [
      {
        // Aplicamos cabeceras para forzar la descarga de archivos .zip
        source: '/(.*).zip',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/zip',
          },
          {
            key: 'Content-Disposition',
            value: 'attachment',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
