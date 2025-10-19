"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [altoContraste, setAltoContraste] = useState(false);
  const [mostrarTranscricao, setMostrarTranscricao] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // estados para caminhos resolvidos dos assets
  const [videoSrc, setVideoSrc] = useState(null);
  const [posterSrc, setPosterSrc] = useState(null);
  const [trackSrc, setTrackSrc] = useState(null);
  const [assetsChecked, setAssetsChecked] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setPrefersReducedMotion(e.matches);
    setPrefersReducedMotion(media.matches);
    if (media.addEventListener) media.addEventListener("change", handler);
    else media.addListener(handler);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", handler);
      else media.removeListener(handler);
    };
  }, []);

  // tenta encontrar o arquivo entre múltiplos prefixes (root e basePath)
  useEffect(() => {
    let mounted = true;

    // candidates: vazio (root) e NEXT_PUBLIC_BASE_PATH (se definido) e fallback para nome do repositório
    const envBase = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, ""); // remove slash final
    const fallbackBase = "/site-acessivel-nicson"; // seu repositório / basePath caso use
    const bases = ["", envBase, fallbackBase].filter((v, i, a) => v !== "" ? true : a.indexOf(v) === i); // evita duplicatas

    const filenameVideo = "video-apresentacao.mp4";
    const filenamePoster = "perfil.jpg";
    const filenameTrack = "legenda.vtt";

    // helper para juntar base + nome e garantir slash inicial
    function joinPath(base, name) {
      if (!base) return `/${name}`;
      if (!base.startsWith("/")) base = `/${base}`;
      return `${base}/${name}`.replace(/\/\/+/g, "/");
    }

    async function checkUrl(url) {
      try {
        // tenta HEAD primeiro
        const head = await fetch(url, { method: "HEAD" });
        if (head && head.ok) return true;
      } catch (e) {
        // HEAD pode falhar em alguns servidores; tentaremos GET parcial a seguir
      }
      try {
        // tenta GET com range para evitar baixar tudo (alguns servidores não respeitam)
        const res = await fetch(url, {
          method: "GET",
          headers: { Range: "bytes=0-0" },
        });
        return res && (res.ok || res.status === 206);
      } catch (e) {
        return false;
      }
    }

    (async () => {
      for (const base of bases) {
        const v = joinPath(base, filenameVideo);
        // checa video; se OK, define também os outros caminhos correspondentes
        // (não assumimos que poster/track existam, mas tentamos)
        // console.log("testando", v);
        // small delay not needed
        const ok = await checkUrl(v);
        if (ok && mounted) {
          setVideoSrc(v);
          // tenta poster e track com o mesmo base
          const p = joinPath(base, filenamePoster);
          const t = joinPath(base, filenameTrack);
          const posterOk = await checkUrl(p).catch(() => false);
          const trackOk = await checkUrl(t).catch(() => false);
          if (mounted) {
            setPosterSrc(posterOk ? p : "/perfil.jpg");
            setTrackSrc(trackOk ? t : null);
            setAssetsChecked(true);
          }
          return;
        }
      }

      // último recurso: tenta root absoluto direto (sem base) — embora já testado
      if (mounted) {
        setVideoSrc("/video-apresentacao.mp4"); // deixa tentar e mostrar erro no console se realmente faltar
        setPosterSrc("/perfil.jpg");
        setTrackSrc("/legenda.vtt");
        setAssetsChecked(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleContraste = () => {
    setAltoContraste((v) => !v);
    document.body.classList.toggle("altocontraste");
  };

  return (
    <main
      className={`min-h-screen p-6 sm:p-10 transition-colors motion-reduce:transition-none bg-slate-50 text-gray-900 ${altoContraste ? "bg-yellow-50 text-black" : "bg-slate-50 text-gray-900"
        }`}
      aria-live="polite"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:text-black px-3 py-2 rounded shadow"
      >
        Pular para o conteúdo
      </a>

      <header className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-cyan-100 to-indigo-100 text-gray-900 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Nicson Costa Antunes</h1>
            <p className="text-sm opacity-90 mt-1">Programador Java • AWS • PostgreSQL • Entusiasta Spring</p>
            <p className="text-sm opacity-90 mt-1">Estudante da Universidade Estadual do Piauí</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleContraste}
              aria-pressed={altoContraste}
              aria-label="Alternar alto contraste"
              className="inline-flex items-center gap-2 rounded-md bg-white/80 px-3 py-2 text-sm font-medium hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
            >
              {altoContraste ? "Desativar contraste" : "Alto contraste"}
            </button>
          </div>
        </div>
      </header>

      <div id="main-content" className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <aside className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <img
                src={posterSrc || "/perfil.jpg"}
                alt="Foto de Nicson Costa Antunes sorrindo em frente a um computador"
                className="w-40 h-40 object-cover rounded-xl shadow mb-4"
                loading="lazy"
              />

              <h2 className="text-xl font-bold">Nicson Costa Antunes</h2>
              <p className="text-sm text-gray-700 mt-1">Programador Java • Backend • Admin de servidores</p>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <strong>Skills:</strong> Java, Spring, PostgreSQL, AWS, Linux
                </p>
                <p>
                  <strong>Experiência:</strong> 2 anos (backend, servidores)
                </p>
                <p>
                  <strong>Educação:</strong> Universidade Estadual do Piauí
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href="mailto:nicsoncc1234@gmail.com"
                  className="inline-block rounded-md bg-indigo-200 px-3 py-2 text-sm text-gray-900 hover:bg-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Contato
                </a>

                <a
                  href="#video"
                  className="inline-block rounded-md border border-indigo-200 px-3 py-2 text-sm hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Ver vídeo
                </a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2 space-y-6">
            <section id="sobre" className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="text-2xl font-semibold">Sobre Mim</h3>
              <p className="mt-3 text-sm text-gray-700">
                Olá! Meu nome é <strong>Nicson Costa Antunes</strong>. Sou programador especializado em Java/Spring,
                PostgreSQL e AWS, com 2 anos de experiência em desenvolvimento backend e administração de servidores. Sou
                entusiasta da ferramenta Spring e estudante da Universidade Estadual do Piauí do curso de Bacharelado em
                Ciência da Computação.
              </p>
            </section>

            <section id="profissional" className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="text-2xl font-semibold">Experiência Profissional</h3>
              <ul className="mt-3 list-disc ml-5 space-y-2 text-sm text-gray-700">
                <li>Programador Java / Spring Boot</li>
                <li>Banco de dados PostgreSQL</li>
                <li>Serviços AWS (EC2, S3, RDS)</li>
                <li>Administração de servidores Linux</li>
              </ul>
            </section>

            <section id="video" className="rounded-2xl bg-white p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">🎬 Apresentação em Vídeo</h3>
                  <p className="mt-2 text-sm text-gray-700">Vídeo informativo sobre a ferramenta Spring — legenda embutida disponível.</p>

                  <div className="mt-4">
                    {videoSrc ? (
                      <video
                        controls
                        className="rounded-lg shadow-lg w-full max-w-3xl"
                        aria-label="Vídeo de apresentação de Nicson Costa Antunes com legendas em português"
                        poster={posterSrc || "/perfil.jpg"}
                      >
                        <source src={videoSrc} type="video/mp4" />
                        {trackSrc ? (
                          <track src={trackSrc} kind="subtitles" srcLang="pt" label="Português" default />
                        ) : null}
                        Seu navegador não suporta vídeos HTML5.
                      </video>
                    ) : !assetsChecked ? (
                      <div className="rounded-lg shadow-lg w-full max-w-3xl h-40 flex items-center justify-center bg-gray-50 text-gray-500">
                        Carregando vídeo...
                      </div>
                    ) : (
                      <div className="rounded-lg shadow-lg w-full max-w-3xl h-40 flex items-center justify-center bg-gray-50 text-red-500">
                        Vídeo não encontrado.
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => setMostrarTranscricao((s) => !s)}
                        aria-expanded={mostrarTranscricao}
                        aria-controls="transcricao"
                        className="rounded-md bg-indigo-200 px-3 py-2 text-sm text-gray-900 hover:bg-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        {mostrarTranscricao ? "Ocultar transcrição" : "Mostrar transcrição"}
                      </button>

                      <a
                        href={videoSrc || "/video-apresentacao.mp4"}
                        download
                        className="text-sm underline text-indigo-600 hover:text-indigo-800"
                      >
                        Baixar vídeo
                      </a>
                    </div>

                    {mostrarTranscricao && (
                      <aside id="transcricao" className="mt-4 bg-yellow-50 p-4 rounded text-sm text-gray-900">
                        <strong>Transcrição:</strong>
                        <p className="mt-2">
                          Olá! Eu sou o Nicson Costa Antunes, programador Java com experiência em PostgreSQL, AWS e administração de
                          servidores. Sou entusiasta da ferramenta Spring e estudante da Universidade Estadual do Piauí. Este é meu site
                          acessível, criado para mostrar minhas habilidades e meu compromisso com inclusão digital.
                        </p>
                      </aside>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section id="contato" className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="text-2xl font-semibold">📬 Contato</h3>
              <p className="mt-3 text-sm">
                E-mail:{" "}
                <a href="mailto:nicsoncc1234@gmail.com" className="text-indigo-600 underline">
                  nicsoncc1234@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>

        <footer className="mt-10 text-center text-sm text-gray-700">
          © 2025 - Desenvolvido por Nicson Costa Antunes | Site com recursos de acessibilidade
        </footer>
      </div>
    </main>
  );
}
