// Service worker: guarda os arquivos no celular para o app abrir rápido e funcionar sem internet.
const NOME_CACHE = "conecta-bairro-v3";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./logo-cabecalho.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
];

// Instalação: salva os arquivos no cache
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(NOME_CACHE).then((cache) => cache.addAll(ARQUIVOS)),
  );
  self.skipWaiting();
});

// Ativação: apaga caches de versões antigas
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes.filter((n) => n !== NOME_CACHE).map((n) => caches.delete(n)),
        ),
      ),
  );
  self.clients.claim();
});

// Busca: usa o cache primeiro; se não tiver, busca na internet
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches
      .match(evento.request)
      .then((guardado) => guardado || fetch(evento.request)),
  );
});
