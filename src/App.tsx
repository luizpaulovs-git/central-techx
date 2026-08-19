import { useState } from "react";
import "./App.css";

const BASE_URL = import.meta.env.BASE_URL;

type PC = {
  id: string;
  name: string;
  category: string;
  description: string;
  processor: string;
  gpu: string;
  ram: string;
  storage: string;
  price: string;
  image: string;
  stock: boolean;
  featured?: boolean;
};

const pcs: PC[] = [
  {
    id: "techx-start",
    name: "TechX Start",
    category: "PC DE ENTRADA",
    description: "Ideal para estudos, trabalho e uso diário.",
    processor: "Intel I5 3470",
    gpu: "Intel HD Graphics 2500",
    ram: "8GB DDR3",
    storage: "SSD 120GB",
    price: "R$ 799,90",
    image: `${BASE_URL}pcs/techx-start.png`,
    stock: true,
  },
  {
    id: "techx-gamer",
    name: "TechX Médio",
    category: "PC intermediário",
    description: "Performance e custo-benefício para seus jogos.",
    processor: "Ryzen 5 2600",
    gpu: "RX 550 4GB",
    ram: "16GB DDR4",
    storage: "SSD 480GB",
    price: "R$ 1,999,90",
    image: `${BASE_URL}pcs/techx-gamer.png`,
    stock: true,
    featured: true,
  },
  {
    id: "techx-pro",
    name: "TechX Pro",
    category: "PC GAMER",
    description: "Alto desempenho para jogos e criação de conteúdo.",
    processor: "Ryzen 5 5600",
    gpu: "RTX 3050 6GB",
    ram: "16GB DDR4",
    storage: "SSD NVMe 256GB",
    price: "R$ 3.199,90",
    image: `${BASE_URL}pcs/techx-pro.png`,
    stock: true,
  },
  {
    id: "techx-extreme",
    name: "TechX Extreme",
    category: "ALTO DESEMPENHO",
    description: "Para quem exige o máximo de desempenho.",
    processor: "Ryzen 7 7700",
    gpu: "RTX 4060 8GB",
    ram: "32GB DDR5",
    storage: "SSD NVMe 512GB",
    price: "R$ 5.499,90",
    image: `${BASE_URL}pcs/techx-extreme.png`,
    stock: true,
  },
];

const WHATSAPP_NUMBER = "5581992282511";

function App() {
  const [selectedPC, setSelectedPC] = useState<PC | null>(null);

  function contactWhatsApp(pc?: PC) {
    const message = pc
      ? `Olá! Tenho interesse no ${pc.name} da Central TechX. Gostaria de saber mais sobre disponibilidade e pagamento.`
      : "Olá! Gostaria de montar minha própia configuração ou contratar algum serviço.";

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank");
  }

  /*
   * =========================
   * PÁGINA DE DETALHES
   * =========================
   */

  if (selectedPC) {
    return (
      <div className="site">
        <header className="navbar">
          <a
            href="#"
            className="logo"
            onClick={(event) => {
              event.preventDefault();
              setSelectedPC(null);
            }}
          >
            <img
              src={`${BASE_URL}brand/logo-transparent.png.png`}
              alt="Central TechX"
              className="brand-logo"
            />
          </a>

          <nav className="nav-links">
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setSelectedPC(null);
              }}
            >
              INÍCIO
            </a>

            <a className="active" href="#detalhes">
              PCs
            </a>

            <a href="#sobre">SOBRE</a>
            <a href="#contato">CONTATO</a>
          </nav>

          <button
            className="whatsapp-button"
            onClick={() => contactWhatsApp(selectedPC)}
          >
            ◉ &nbsp; FALAR NO WHATSAPP
          </button>
        </header>

        <div className="important-notice">
          <span className="notice-icon">⚠</span>

          <div>
            <strong>AVISO IMPORTANTE</strong>

            <p>
              Devido a questões logísticas, no momento não realizamos
              envio de PCs para outros estados.
            </p>
          </div>
        </div>

        <main className="product-detail" id="detalhes">
          <button
            className="back-button"
            onClick={() => setSelectedPC(null)}
          >
            ← VOLTAR PARA OS PCs
          </button>

          <div className="detail-layout">
            <div className="detail-image-container">
              <div className="detail-glow"></div>

              <img
                src={selectedPC.image}
                alt={selectedPC.name}
                className="detail-image"
              />
            </div>

            <div className="detail-info">
              <p className="detail-category">
                {selectedPC.category}
              </p>

              <h1>{selectedPC.name}</h1>

              <div className={selectedPC.stock ? "stock-ok" : "stock-off"}>
                {selectedPC.stock ? "🟢 Em estoque" : "🔴 Sem estoque"}
              </div>

              <p className="detail-description">
                {selectedPC.description}
              </p>

              <div className="detail-specs">
                <div className="detail-spec">
                  <span>PROCESSADOR</span>
                  <strong>{selectedPC.processor}</strong>
                </div>

                <div className="detail-spec">
                  <span>PLACA DE VÍDEO</span>
                  <strong>{selectedPC.gpu}</strong>
                </div>

                <div className="detail-spec">
                  <span>MEMÓRIA RAM</span>
                  <strong>{selectedPC.ram}</strong>
                </div>

                <div className="detail-spec">
                  <span>ARMAZENAMENTO</span>
                  <strong>{selectedPC.storage}</strong>
                </div>

                <div className="detail-spec">
                  <span>MONTAGEM</span>
                  <strong>Profissional</strong>
                </div>

                <div className="detail-spec">
                  <span>GARANTIA</span>
                  <strong>Consulte condições</strong>
                </div>
              </div>

              <div className="detail-buy">
                <div>
                  <small>A PARTIR DE</small>
                  <strong>{selectedPC.price}</strong>
                </div>

                <button
                  className="whatsapp-buy"
                  onClick={() => contactWhatsApp(selectedPC)}
                >
                  ◉ &nbsp; TENHO INTERESSE
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
   * =========================
   * HOME
   * =========================
   */

  return (
    <div className="site">
      <header className="navbar">
        <a href="#inicio" className="logo">
          <img
            src={`${BASE_URL}brand/logo-transparent.png.png`}
            alt="Central TechX"
            className="brand-logo"
          />
        </a>

        <nav className="nav-links">
          <a href="#inicio" className="active">
            INÍCIO
          </a>

          <a href="#pcs">PCs</a>
          <a href="#sobre">SOBRE</a>
          <a href="#contato">CONTATO</a>
        </nav>

        <button
          className="whatsapp-button"
          onClick={() => contactWhatsApp()}
        >
          ◉ &nbsp; FALAR NO WHATSAPP
        </button>
      </header>

      <div className="important-notice">
        <span className="notice-icon">⚠</span>

        <div>
          <strong>AVISO IMPORTANTE</strong>

          <p>
            Devido a questões logísticas, no momento não realizamos
            envio de PCs para outros estados.
          </p>
        </div>
      </div>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <p className="hero-small">CENTRAL TECH X</p>

            <h1>
              SEU PRÓXIMO
              <br />
              PC COMEÇA
              <br />
              <span>AQUI.</span>
            </h1>

            <p className="hero-description">
              Desempenho, qualidade e tecnologia para
              <br />
              jogar, trabalhar e estudar sem limites.
            </p>

            <div className="hero-buttons">
              <a href="#pcs" className="primary-button">
                🖥️ &nbsp; VER PCs
              </a>

              <button
                className="secondary-button"
                onClick={() => contactWhatsApp()}
              >
                ◉ &nbsp; FALE CONOSCO
              </button>
            </div>

            <div className="hero-benefits">
              <div className="benefit">
                <span className="benefit-icon">♢</span>

                <div>
                  <strong>GARANTIA</strong>
                  <small>De verdade</small>
                </div>
              </div>

              <div className="benefit">
                <span className="benefit-icon">⚙</span>

                <div>
                  <strong>PEÇAS DE QUALIDADE</strong>
                  <small>Das melhores marcas</small>
                </div>
              </div>

              <div className="benefit">
                <span className="benefit-icon">▣</span>

                <div>
                  <strong>MONTAGEM</strong>
                  <small>Profissional</small>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-pc">
            <div className="hero-image-glow"></div>

            <img
              src={`${BASE_URL}hero/central-pc.png`}
              alt="PC Gamer Central TechX"
              className="hero-pc-image"
            />
          </div>
        </section>

        <section className="products" id="pcs">
          <p className="section-small">ESCOLHA O SEU</p>

          <h2>
            NOSSOS <span>PCs</span>
          </h2>

          <div className="section-line"></div>

          <p className="section-description">
            Computadores montados para diferentes níveis de desempenho.
          </p>

          <div className="pc-grid">
            {pcs.map((pc) => (
              <article
                className={`pc-card ${pc.featured ? "featured" : ""}`}
                key={pc.id}
              >
                {pc.featured && (
                  <div className="featured-badge">
                    ★ MAIS VENDIDO
                  </div>
                )}

                <div className="card-image">
                  <img
                    src={pc.image}
                    alt={pc.name}
                    className="pc-product-image"
                  />
                </div>

                <div className="card-content">
                  <p className="card-category">{pc.category}</p>

                  <h3>{pc.name}</h3>

                  <p className="card-description">
                    {pc.description}
                  </p>

                  <div className="specs">
                    <div>
                      <span>PROCESSADOR</span>
                      <strong>{pc.processor}</strong>
                    </div>

                    <div>
                      <span>PLACA DE VÍDEO</span>
                      <strong>{pc.gpu}</strong>
                    </div>

                    <div>
                      <span>MEMÓRIA</span>
                      <strong>{pc.ram}</strong>
                    </div>

                    <div>
                      <span>ARMAZENAMENTO</span>
                      <strong>{pc.storage}</strong>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <div>
                      <small>A PARTIR DE</small>
                      <strong>{pc.price}</strong>
                    </div>

                    <button
                      type="button"
                      className="details-button"
                      onClick={() => setSelectedPC(pc)}
                    >
                      VER DETALHES
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="custom-build" id="sobre">
          <div>
            <p>MONTE O SEU PC</p>

            <h2>
              DO SEU <span>JEITO!</span>
            </h2>

            <small>
              Escolha as peças e nós montamos para você ou contrate nossos serviços.
            </small>
          </div>

          <button
            className="custom-button"
            onClick={() => contactWhatsApp()}
          >
            FALAR COM A CENTRAL TECHX →
          </button>
        </section>

        <footer id="contato" className="footer">
          <div className="footer-logo">
            <img
              src={`${BASE_URL}brand/logo-transparent.png.png`}
              alt="Central TechX"
              className="footer-brand-logo"
            />
          </div>

          <p>© 2026 Central TechX. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;