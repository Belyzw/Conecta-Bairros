/* =====================================================
   1) DADOS
   Cada atividade tem a própria latitude (lat) e
   longitude (lon), e pode ter uma foto.
   ===================================================== */

const categorias = [
  { id: "todas", nome: "Todas", icone: "★", cor: "#d5e1ee" },
  { id: "esporte", nome: "Esporte", icone: "⚽", cor: "#cfe3fb" },
  { id: "educacao", nome: "Educação", icone: "📖", cor: "#fde0c6" },
  { id: "social", nome: "Projetos Sociais", icone: "🤝", cor: "#cdeedb" },
  {
    id: "sustentabilidade",
    nome: "Sustentabilidade",
    icone: "🌱",
    cor: "#faf0b8",
  },
];

// Atividades de exemplo (fictícias). lat e lon são números, sem aspas.
let projetos = [
  {
    nome: "Escolinha de kitesurf",
    categoria: "esporte",
    bairro: "Serviluz",
    local: "Praia do Serviluz",
    horario: "Sábados, 8h–11h",
    whatsapp: "85999990001",
    lat: -3.7075,
    lon: -38.479,
  },
  {
    nome: "Futsal para jovens",
    categoria: "esporte",
    bairro: "Bom Jardim",
    local: "Quadra da associação",
    horario: "Terças e quintas, 18h",
    whatsapp: "85999990002",
    lat: -3.785,
    lon: -38.61,
  },
  {
    nome: "Curso de informática básica",
    categoria: "educacao",
    bairro: "Mondubim",
    local: "Centro Comunitário da Vila",
    horario: "Sábados, 14h–16h",
    whatsapp: "85999990003",
    lat: -3.8,
    lon: -38.58,
  },
  {
    nome: "Plantão pedagógico",
    categoria: "educacao",
    bairro: "Jangurussu",
    local: "Biblioteca comunitária",
    horario: "Segundas a quartas, 14h",
    whatsapp: "85999990004",
    lat: -3.81,
    lon: -38.51,
  },
  {
    nome: "Reforço escolar",
    categoria: "educacao",
    bairro: "Pirambu",
    local: "Igreja São Pedro (salão)",
    horario: "Quartas, 15h–17h",
    whatsapp: "85999990005",
    lat: -3.708,
    lon: -38.555,
  },
  {
    nome: "Atendimento a famílias",
    categoria: "social",
    bairro: "Barra do Ceará",
    local: "Associação de moradores",
    horario: "Sextas, 9h–12h",
    whatsapp: "85999990006",
    lat: -3.697,
    lon: -38.585,
  },
  {
    nome: "Oficina de preservação da praia",
    categoria: "sustentabilidade",
    bairro: "Praia do Futuro",
    local: "Barraca de apoio, Praia do Futuro",
    horario: "Domingos, 7h–9h",
    whatsapp: "85999990007",
    lat: -3.743,
    lon: -38.457,
  },
  {
    nome: "Horta comunitária",
    categoria: "sustentabilidade",
    bairro: "Messejana",
    local: "Terreno da associação",
    horario: "Sábados, 7h–10h",
    whatsapp: "85999990008",
    lat: -3.83,
    lon: -38.485,
  },
];

// Estado atual da tela
let categoriaAtual = "todas";
let posicaoUsuario = null; // localização de quem está visitando o site
let localDaAtividade = null; // localização capturada no formulário de cadastro
let fotoDoProjeto = null; // foto escolhida no formulário (guardada como texto)

/* =====================================================
   2) FUNÇÕES AUXILIARES
   ===================================================== */

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Fórmula de Haversine: distância em km entre dois pontos do mapa
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const rad = (graus) => (graus * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function linkWhatsApp(numero, nomeAtividade) {
  let digitos = numero.replace(/\D/g, "");
  if (!digitos.startsWith("55")) digitos = "55" + digitos;
  const msg = encodeURIComponent(
    "Olá! Vi “" + nomeAtividade + "” no Conecta Bairro e quero saber mais.",
  );
  return "https://wa.me/" + digitos + "?text=" + msg;
}

function dadosCategoria(id) {
  return categorias.find((c) => c.id === id);
}

// Descobre o nome do bairro a partir da latitude e longitude (OpenStreetMap)
async function descobrirBairro(lat, lon) {
  const url =
    "https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&accept-language=pt-BR" +
    "&lat=" +
    lat +
    "&lon=" +
    lon;
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error("Falha ao consultar o bairro");
  const dados = await resposta.json();
  const end = dados.address || {};
  return (
    end.suburb ||
    end.neighbourhood ||
    end.city_district ||
    end.quarter ||
    end.village ||
    end.city ||
    ""
  );
}

// Reduz a foto (para não ficar pesada) e transforma em texto,
// para guardar junto com a atividade
function reduzirFoto(arquivo, ladoMaximo = 800) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler a foto"));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo não é uma imagem válida"));
      img.onload = () => {
        const escala = Math.min(
          1,
          ladoMaximo / Math.max(img.width, img.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas
          .getContext("2d")
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

/* =====================================================
   3) TELA
   ===================================================== */

function desenharCategorias() {
  const caixa = document.getElementById("categorias");
  caixa.innerHTML = "";
  categorias.forEach((cat) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "cat";
    botao.setAttribute("aria-pressed", cat.id === categoriaAtual);
    botao.innerHTML =
      '<span class="bolinha" style="background:' +
      cat.cor +
      '">' +
      cat.icone +
      "</span>" +
      cat.nome;
    botao.addEventListener("click", () => {
      categoriaAtual = cat.id;
      desenharCategorias();
      desenharLista();
    });
    caixa.appendChild(botao);
  });
}

function desenharLista() {
  const termo = normalizar(document.getElementById("campoBusca").value.trim());

  // 1. Filtrar por categoria e pelo texto da busca
  let resultado = projetos.filter((p) => {
    const naCategoria =
      categoriaAtual === "todas" || p.categoria === categoriaAtual;
    const textoDoCartao = normalizar(
      p.nome +
        " " +
        p.bairro +
        " " +
        p.local +
        " " +
        dadosCategoria(p.categoria).nome,
    );
    return naCategoria && textoDoCartao.includes(termo);
  });

  // 2. Se o visitante permitiu a localização, calcula a distância até cada atividade
  if (posicaoUsuario) {
    resultado = resultado.map((p) => {
      const temLocal = typeof p.lat === "number" && typeof p.lon === "number";
      const km = temLocal
        ? calcularDistancia(
            posicaoUsuario.lat,
            posicaoUsuario.lon,
            p.lat,
            p.lon,
          )
        : null;
      return { ...p, km };
    });
    resultado.sort((a, b) => (a.km ?? 9999) - (b.km ?? 9999));
  }

  // 3. Mostrar na tela
  const lista = document.getElementById("lista");
  const resumo = document.getElementById("resumo");
  lista.innerHTML = "";

  if (resultado.length === 0) {
    resumo.textContent = "";
    lista.innerHTML =
      '<li class="vazio" style="grid-column:1/-1">Nenhuma atividade encontrada. ' +
      "Tente outro bairro ou escolha “Todas” nas categorias.</li>";
    return;
  }

  resumo.textContent =
    resultado.length +
    (resultado.length === 1
      ? " atividade encontrada"
      : " atividades encontradas");

  resultado.forEach((p) => {
    const cat = dadosCategoria(p.categoria);
    const distancia =
      p.km !== undefined && p.km !== null
        ? '<p class="info distancia">A ' +
          p.km.toFixed(1).replace(".", ",") +
          " km de você</p>"
        : "";

    const li = document.createElement("li");
    li.className = "cartao";
    li.innerHTML =
      '<span class="selo">GRATUITO</span>' +
      "<h3>" +
      escapar(p.nome) +
      "</h3>" +
      '<span class="etiqueta">' +
      cat.icone +
      " " +
      cat.nome +
      "</span>" +
      '<p class="info"><strong>Bairro:</strong> ' +
      escapar(p.bairro) +
      "</p>" +
      '<p class="info"><strong>Local:</strong> ' +
      escapar(p.local) +
      "</p>" +
      '<p class="info"><strong>Horário:</strong> ' +
      escapar(p.horario) +
      "</p>" +
      distancia +
      '<a class="btn-whats" target="_blank" rel="noopener" href="' +
      linkWhatsApp(p.whatsapp, p.nome) +
      '">Conversar pelo WhatsApp</a>';

    // Se a atividade tem foto, mostra no topo do cartão
    if (p.foto) {
      const img = document.createElement("img");
      img.className = "cartao-foto";
      img.src = p.foto;
      img.alt = "Foto do projeto " + p.nome;
      li.prepend(img);
    }

    lista.appendChild(li);
  });
}

/* =====================================================
   4) LOCALIZAÇÃO DO VISITANTE
   ===================================================== */
function usarMinhaLocalizacao() {
  const status = document.getElementById("statusLocal");

  if (!("geolocation" in navigator)) {
    status.textContent =
      "Seu navegador não suporta localização. Use a busca por bairro.";
    return;
  }

  status.textContent = "Buscando sua localização…";

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      posicaoUsuario = {
        lat: posicao.coords.latitude,
        lon: posicao.coords.longitude,
      };
      status.textContent =
        "Localização encontrada. Mostrando as atividades mais próximas primeiro.";
      desenharLista();
    },
    (erro) => {
      if (erro.code === 1) {
        status.textContent =
          "Você não permitiu a localização. Use a busca por bairro.";
      } else {
        status.textContent =
          "Não foi possível obter sua localização. Use a busca por bairro.";
      }
    },
    { enableHighAccuracy: false, timeout: 10000 },
  );
}

/* =====================================================
   5) FORMULÁRIO PARA CADASTRAR ATIVIDADE
   ===================================================== */
function preencherFormulario() {
  const selCat = document.getElementById("fCategoria");
  categorias
    .filter((c) => c.id !== "todas")
    .forEach((c) => {
      selCat.innerHTML +=
        '<option value="' + c.id + '">' + c.nome + "</option>";
    });
}

// Botão "Usar a localização de onde estou agora" (dentro do formulário)
function capturarLocalDaAtividade() {
  const status = document.getElementById("statusForm");

  if (!("geolocation" in navigator)) {
    status.textContent =
      "Seu navegador não suporta localização. Digite o bairro manualmente.";
    return;
  }

  status.textContent = "Buscando a localização…";

  navigator.geolocation.getCurrentPosition(
    async (posicao) => {
      localDaAtividade = {
        lat: posicao.coords.latitude,
        lon: posicao.coords.longitude,
      };
      status.textContent = "Localização capturada. Descobrindo o bairro…";

      try {
        const bairro = await descobrirBairro(
          localDaAtividade.lat,
          localDaAtividade.lon,
        );
        if (bairro) document.getElementById("fBairro").value = bairro;
        status.textContent = bairro
          ? "Localização capturada. Confira se o bairro está certo."
          : "Localização capturada, mas não achei o bairro. Digite o nome dele.";
      } catch (erro) {
        status.textContent =
          "Localização capturada, mas não consegui descobrir o bairro. Digite o nome dele.";
      }
    },
    () => {
      status.textContent =
        "Não foi possível obter a localização. Digite o bairro manualmente.";
    },
    { enableHighAccuracy: true, timeout: 15000 },
  );
}

/* =====================================================
   6) FOTO DO PROJETO
   ===================================================== */
const campoFoto = document.getElementById("fFoto");
const caixaPrevia = document.getElementById("previaFoto");
const imgPrevia = document.getElementById("imgPrevia");
const statusFoto = document.getElementById("statusFoto");

function limparFoto() {
  fotoDoProjeto = null;
  campoFoto.value = "";
  caixaPrevia.hidden = true;
  imgPrevia.removeAttribute("src");
}

campoFoto.addEventListener("change", async () => {
  const arquivo = campoFoto.files[0];
  if (!arquivo) {
    limparFoto();
    return;
  }

  if (!arquivo.type.startsWith("image/")) {
    statusFoto.textContent = "Escolha um arquivo de imagem (JPG, PNG...).";
    limparFoto();
    return;
  }

  try {
    fotoDoProjeto = await reduzirFoto(arquivo);
    imgPrevia.src = fotoDoProjeto;
    caixaPrevia.hidden = false;
    statusFoto.textContent = "";
  } catch (erro) {
    statusFoto.textContent = "Não consegui carregar essa foto. Tente outra.";
    limparFoto();
  }
});

document.getElementById("btnRemoverFoto").addEventListener("click", limparFoto);

/* =====================================================
   7) ENVIO DO FORMULÁRIO
   ===================================================== */
document.getElementById("formProjeto").addEventListener("submit", (evento) => {
  evento.preventDefault();

  const novo = {
    nome: document.getElementById("fNome").value.trim(),
    categoria: document.getElementById("fCategoria").value,
    bairro: document.getElementById("fBairro").value.trim(),
    local: document.getElementById("fLocal").value.trim(),
    horario: document.getElementById("fHorario").value.trim(),
    whatsapp: document.getElementById("fWhats").value,
  };

  // Se a localização foi capturada, guarda junto com a atividade
  if (localDaAtividade) {
    novo.lat = localDaAtividade.lat;
    novo.lon = localDaAtividade.lon;
  }

  // Se uma foto foi escolhida, guarda junto com a atividade
  if (fotoDoProjeto) {
    novo.foto = fotoDoProjeto;
  }

  projetos.unshift(novo);

  evento.target.reset();
  limparFoto();
  localDaAtividade = null;
  document.getElementById("statusForm").textContent =
    "Opcional, mas sem ela a atividade não mostra a distância. Faça isso no local da atividade.";
  categoriaAtual = "todas";
  document.getElementById("campoBusca").value = "";
  desenharCategorias();
  desenharLista();
  document.getElementById("lista").scrollIntoView({ behavior: "smooth" });
});

/* =====================================================
   8) INÍCIO
   ===================================================== */
document.getElementById("campoBusca").addEventListener("input", desenharLista);
document
  .getElementById("btnLocal")
  .addEventListener("click", usarMinhaLocalizacao);
document
  .getElementById("btnLocalForm")
  .addEventListener("click", capturarLocalDaAtividade);

preencherFormulario();
desenharCategorias();
desenharLista();

/* =====================================================
   9) TRANSFORMAR EM APLICATIVO (PWA)
   ===================================================== */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch((erro) => {
    console.log("Service worker não registrado:", erro);
  });
}
