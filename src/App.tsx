import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import "./App.css";
import {
  supabase,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "./lib/supabase";

const BASE_URL = import.meta.env.BASE_URL;
const WHATSAPP_NUMBER = "5581992282511";
const ORDER_STORAGE_KEY = "central-techx-order-codes";

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
  priceValue: number;
  image: string;
  stock: boolean;
  featured?: boolean;
};

const pcs: PC[] = [
  {
    id: "techx-start",
    name: "PC Start",
    category: "PC DE ENTRADA",
    description: "Ideal para estudos, trabalho e uso diário.",
    processor: "Intel I5 3470",
    gpu: "Intel HD Graphics 2500",
    ram: "8GB DDR3",
    storage: "SSD 120GB",
    price: "R$ 799,90",
    priceValue: 799.9,
    image: `${BASE_URL}pcs/techx-start.png`,
    stock: false,
  },
  {
    id: "techx-gamer",
    name: "PC Médio",
    category: "PC INTERMEDIÁRIO",
    description: "Performance e custo-benefício para seus jogos.",
    processor: "Ryzen 5 2600",
    gpu: "RX 550 4GB",
    ram: "16GB DDR4",
    storage: "SSD 480GB",
    price: "R$ 1.999,90",
    priceValue: 1999.9,
    image: `${BASE_URL}pcs/techx-gamer.png`,
    stock: false,
  },
  {
    id: "techx-pro",
    name: "PC Pro",
    category: "PC GAMER",
    description: "Alto desempenho para jogos e criação de conteúdo.",
    processor: "Ryzen 5 5600",
    gpu: "RTX 3050 6GB",
    ram: "16GB DDR4",
    storage: "SSD NVMe 256GB",
    price: "R$ 3.199,90",
    priceValue: 3199.9,
    image: `${BASE_URL}pcs/techx-pro.png`,
    stock: false,
  },
  {
    id: "techx-extreme",
    name: "PC Extreme",
    category: "ALTO DESEMPENHO",
    description: "Para quem exige o máximo de desempenho.",
    processor: "Ryzen 7 7700",
    gpu: "RTX 4060 8GB",
    ram: "32GB DDR5",
    storage: "SSD NVMe 512GB",
    price: "R$ 5.499,90",
    priceValue: 5499.9,
    image: `${BASE_URL}pcs/techx-extreme.png`,
    stock: false,
  },
];

const statusInfo: Record<OrderStatus, { label: string; icon: string; className: string }> = {
  recebido: { label: "Pedido recebido", icon: "📦", className: "status-recebido" },
  preparo: { label: "Pedido em preparo", icon: "🛠️", className: "status-preparo" },
  caminho: { label: "A caminho", icon: "🚚", className: "status-caminho" },
  entregue: { label: "Entregue", icon: "✅", className: "status-entregue" },
};

function readSavedCodes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

function saveOrderCode(code: string) {
  const codes = Array.from(new Set([code, ...readSavedCodes()]));
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(codes.slice(0, 20)));
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function App() {
  const [page, setPage] = useState<"home" | "orders" | "admin">("home");
  const [selectedPC, setSelectedPC] = useState<PC | null>(null);
  const [orderPC, setOrderPC] = useState<PC | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [adminUser, setAdminUser] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [adminError, setAdminError] = useState("");

  async function ensureCustomerSession() {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;

    const { data: anonymousData, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Erro ao criar sessão anônima:", error);
      setMessage("Não foi possível iniciar sua sessão. Verifique a configuração do Supabase.");
      return null;
    }
    return anonymousData.session;
  }

  async function loadOrders() {
    setLoadingOrders(true);
    const session = await ensureCustomerSession();

    if (!session?.user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar pedidos:", error);
      setMessage("Não foi possível carregar os pedidos.");
    } else {
      setOrders((data || []) as Order[]);
    }

    setLoadingOrders(false);
  }

  async function checkAdmin() {
    const { data } = await supabase.auth.getSession();

    if (!data.session?.user) {
      setAdminUser(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.session.user.id)
      .maybeSingle();

    setAdminUser(profile?.role === "admin");
  }

  useEffect(() => {
    void checkAdmin();
  }, []);

  useEffect(() => {
    if (page === "orders") void loadOrders();
  }, [page]);

  function goHome() {
    setPage("home");
    setSelectedPC(null);
    setOrderPC(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToSection(id: string) {
    setPage("home");
    setSelectedPC(null);
    setOrderPC(null);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function contactWhatsApp(pc?: PC) {
    const messageText = pc
      ? `Olá! Tenho interesse no ${pc.name} da Central TechX. Gostaria de saber mais sobre disponibilidade.`
      : "Olá! Gostaria de montar minha própria configuração ou contratar algum serviço.";

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function openOrder(pc: PC) {
    if (!pc.stock) {
      contactWhatsApp(pc);
      return;
    }
    setSelectedPC(null);
    setOrderPC(pc);
  }

  if (page === "orders") {
    return (
      <div className="site">
        <Header page={page} onHome={goHome} onOrders={() => setPage("orders")} onSection={scrollToSection} />
        <OrdersPage orders={orders} loading={loadingOrders} onHome={goHome} onRefresh={loadOrders} message={message} />
      </div>
    );
  }

  if (page === "admin") {
    return (
      <div className="site">
        <Header page={page} onHome={goHome} onOrders={() => setPage("orders")} onSection={scrollToSection} />
        <AdminPage
          adminUser={adminUser}
          adminLoading={adminLoading}
          setAdminLoading={setAdminLoading}
          orders={orders}
          setOrders={setOrders}
          onLogin={checkAdmin}
          onLogout={async () => {
            await supabase.auth.signOut();
            setAdminUser(false);
            setOrders([]);
            setPage("home");
          }}
          error={adminError}
          setError={setAdminError}
        />
      </div>
    );
  }

  if (selectedPC) {
    return (
      <div className="site">
        <Header page="pcs" onHome={goHome} onOrders={() => setPage("orders")} onSection={scrollToSection} />
        <div className="important-notice">
          <span className="notice-icon">⚠</span>
          <div>
            <strong>AVISO IMPORTANTE</strong>
            <p>Devido a questões logísticas, no momento não realizamos envio de PCs para outros estados.</p>
          </div>
        </div>

        <main className="product-detail">
          <button className="back-button" onClick={goHome}>← VOLTAR PARA OS PCs</button>
          <div className="detail-layout">
            <div className="detail-image-container">
              <div className="detail-glow" />
              <img src={selectedPC.image} alt={selectedPC.name} className="detail-image" />
            </div>

            <div className="detail-info">
              <p className="detail-category">{selectedPC.category}</p>
              <h1>{selectedPC.name}</h1>

              <div className={selectedPC.stock ? "stock-ok" : "stock-off"}>
                {selectedPC.stock ? "🟢 Em estoque" : "🔴 Sem estoque"}
              </div>

              <p className="detail-description">{selectedPC.description}</p>

              <div className="detail-specs">
                <DetailSpec label="PROCESSADOR" value={selectedPC.processor} />
                <DetailSpec label="PLACA DE VÍDEO" value={selectedPC.gpu} />
                <DetailSpec label="MEMÓRIA RAM" value={selectedPC.ram} />
                <DetailSpec label="ARMAZENAMENTO" value={selectedPC.storage} />
                <DetailSpec label="MONTAGEM" value="Profissional" />
                <DetailSpec label="GARANTIA" value="Consulte condições" />
              </div>

              <div className="detail-buy">
                <div>
                  <small>A PARTIR DE</small>
                  <strong>{selectedPC.price}</strong>
                </div>
                <button className="whatsapp-buy" onClick={() => openOrder(selectedPC)}>
                  {selectedPC.stock ? "FAZER PEDIDO →" : "◉ CONSULTAR DISPONIBILIDADE"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="site">
      <Header page="home" onHome={goHome} onOrders={() => setPage("orders")} onSection={scrollToSection} />

      <div className="important-notice">
        <span className="notice-icon">⚠</span>
        <div>
          <strong>AVISO IMPORTANTE</strong>
          <p>Devido a questões logísticas, no momento não realizamos envio de PCs para outros estados.</p>
        </div>
      </div>

      <main>
        <section className="hero hero-reference" id="inicio">
          <div className="hero-content">
            <p className="hero-small">CENTRAL TECHX</p>
            <h1>TECNOLOGIA<br />SEM COMPLICAÇÃO.</h1>
            <p className="hero-description">
              Computadores, assistência e soluções<br className="desktop-break" />
              em tecnologia para o seu dia a dia.
            </p>

            <div className="hero-buttons">
              <button className="primary-button" onClick={() => scrollToSection("pcs")}>
                VER PRODUTOS <span>→</span>
              </button>
              <button className="secondary-button" onClick={() => scrollToSection("sobre")}>
                SOBRE NÓS
              </button>
            </div>
          </div>

          <div className="hero-reference-visual" aria-hidden="true">
            <div className="hero-reference-frame" />
          </div>
        </section>

        <section className="products" id="pcs">
          <div className="products-layout">
            <div className="products-intro">
              <p className="section-small">ESCOLHA O SEU</p>
              <h2>NOSSOS <span>PCs</span></h2>
              <div className="section-line" />
              <p className="section-description">
                Computadores montados para diferentes níveis de desempenho.
              </p>
              <button className="products-all-button" onClick={() => scrollToSection("pcs")}>
                VER TODOS OS PCs <span>→</span>
              </button>
            </div>

            <div className="pc-grid">
              {pcs.map((pc) => (
                <article className={`pc-card ${pc.featured ? "featured" : ""}`} key={pc.id}>
                  {pc.featured && <div className="featured-badge">★ MAIS VENDIDO</div>}

                  <div className="card-image">
                    <img src={pc.image} alt={pc.name} className="pc-product-image" />
                  </div>

                  <div className="card-content">
                    <p className="card-category">{pc.category}</p>
                    <h3>{pc.name}</h3>

                    <div className={pc.stock ? "stock-ok" : "stock-off"}>
                      {pc.stock ? "🟢 Em estoque" : "🔴 Sem estoque"}
                    </div>

                    <p className="card-description">{pc.description}</p>

                    <div className="specs">
                      <Spec label="PROCESSADOR" value={pc.processor} />
                      <Spec label="PLACA DE VÍDEO" value={pc.gpu} />
                      <Spec label="MEMÓRIA" value={pc.ram} />
                      <Spec label="ARMAZENAMENTO" value={pc.storage} />
                    </div>

                    <div className="card-bottom">
                      <div>
                        <small>A PARTIR DE</small>
                        <strong>{pc.price}</strong>
                      </div>
                      <button type="button" className="details-button" onClick={() => setSelectedPC(pc)}>
                        VER DETALHES <span>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="custom-build" id="sobre">
          <div className="motherboard-visual" aria-hidden="true">
            <img
              src={`${BASE_URL}motherboard-clean.png`}
              alt=""
              className="motherboard-image"
            />
          </div>

          <div className="custom-build-content">
            <p>MONTE O SEU PC</p>
            <h2>DO SEU <span>JEITO!</span></h2>
            <small>Escolha as peças e nós montamos para você ou contrate nossos serviços.</small>
            <button className="hero-custom-pc-button" onClick={() => scrollToSection("pcs")}>
              Monte seu PC do seu jeito <span>→</span>
            </button>
          </div>
        </section>

        <footer id="contato" className="footer">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src={`${BASE_URL}brand/logo-transparent.png.png`} alt="Central TechX" className="footer-brand-logo" />
              </div>
              <p>Computadores, assistência e soluções em tecnologia.</p>
            </div>

            <div className="footer-column">
              <strong>NAVEGAÇÃO</strong>
              <button onClick={() => scrollToSection("inicio")}>Início</button>
              <button onClick={() => scrollToSection("pcs")}>PCs</button>
              <button onClick={() => scrollToSection("sobre")}>Sobre</button>
              <button onClick={() => scrollToSection("contato")}>Contato</button>
            </div>

            <div className="footer-column">
              <strong>ATENDIMENTO</strong>
              <button onClick={() => contactWhatsApp()}>WhatsApp</button>
              <button onClick={() => setPage("orders")}>Meus pedidos</button>
            </div>

            <div className="footer-column footer-employee-column">
              <strong>ACESSO</strong>
              <button type="button" className="employee-access" onClick={() => setPage("admin")}>
                <span>É funcionário?</span>
                Acessar área de funcionários
              </button>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Central TechX. Todos os direitos reservados.</p>
            <button type="button" className="employee-access employee-access-bottom" onClick={() => setPage("admin")}>
              É funcionário? <span>Acessar área de funcionários</span>
            </button>
          </div>
        </footer>
      </main>

      {orderPC && (
        <OrderModal
          pc={orderPC}
          onClose={() => setOrderPC(null)}
          onCreated={(code) => {
            saveOrderCode(code);
            setOrderPC(null);
            setMessage(`Pedido ${code} criado com sucesso!`);
            setPage("orders");
          }}
        />
      )}
    </div>
  );
}

function Header({
  page,
  onHome,
  onOrders,
  onSection,
}: {
  page: string;
  onHome: () => void;
  onOrders: () => void;
  onSection: (id: string) => void;
}) {
  return (
    <header className="navbar">
      <button className="logo logo-button" onClick={onHome} aria-label="Central TechX">
        <img src={`${BASE_URL}brand/logo-transparent.png.png`} alt="Central TechX" className="brand-logo" />
      </button>

      <nav className="nav-links">
        <button className={page === "home" ? "active" : ""} onClick={onHome}>INÍCIO</button>
        <button className={page === "pcs" ? "active" : ""} onClick={() => onSection("pcs")}>PCs</button>
        <button className={page === "orders" ? "active" : ""} onClick={onOrders}>PEDIDOS</button>
        <button onClick={() => onSection("sobre")}>SOBRE</button>
        <button onClick={() => onSection("contato")}>CONTATO</button>
      </nav>

      <button className="whatsapp-button" onClick={() => contactHeaderWhatsApp()}>
        ◉ &nbsp; FALAR NO WHATSAPP
      </button>
    </header>
  );
}

function contactHeaderWhatsApp() {
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Gostaria de falar com a Central TechX.")}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function DetailSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-spec">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OrderModal({
  pc,
  onClose,
  onCreated,
}: {
  pc: PC;
  onClose: () => void;
  onCreated: (code: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    let { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      const { data: anonymousData, error: authError } = await supabase.auth.signInAnonymously();

      if (authError) {
        setError("Não foi possível iniciar o pedido. Verifique a configuração do Supabase.");
        setSaving(false);
        return;
      }

      sessionData = { session: anonymousData.session };
    }

    const userId = sessionData.session?.user.id;

    if (!userId) {
      setError("Sessão do cliente não encontrada.");
      setSaving(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("orders")
      .insert({
        customer_id: userId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
        product_id: pc.id,
        product_name: pc.name,
        product_price: pc.priceValue,
        status: "recebido",
        payment_status: "pendente",
      })
      .select("order_code")
      .single();

    if (insertError || !data) {
      console.error(insertError);
      setError("Não foi possível criar o pedido. Confira se o banco do Supabase foi configurado.");
    } else {
      onCreated(data.order_code);
    }

    setSaving(false);
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="order-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">×</button>
        <p className="section-small">FINALIZAR PEDIDO</p>
        <h2>{pc.name}</h2>
        <p className="modal-price">{money(pc.priceValue)}</p>

        <div className="payment-note">
          💵 <strong>Pagamento na entrega</strong>
          <span>Você paga quando receber seu PC.</span>
        </div>

        <form onSubmit={submit} className="order-form">
          <label>
            Seu nome
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" />
          </label>

          <label>
            WhatsApp
            <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(81) 99999-9999" />
          </label>

          <label>
            Endereço de entrega
            <textarea required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rua, número, bairro e referência" rows={3} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="submit-order" disabled={saving}>
            {saving ? "CRIANDO PEDIDO..." : "CONFIRMAR PEDIDO →"}
          </button>
        </form>
      </div>
    </div>
  );
}

function OrdersPage({
  orders,
  loading,
  onHome,
  onRefresh,
  message,
}: {
  orders: Order[];
  loading: boolean;
  onHome: () => void;
  onRefresh: () => void;
  message: string;
}) {
  return (
    <main className="orders-page">
      <div className="orders-heading">
        <div>
          <p className="section-small">CENTRAL TECHX</p>
          <h1>MEUS <span>PEDIDOS</span></h1>
          <p>Acompanhe o andamento dos seus pedidos em um só lugar.</p>
        </div>
        <button className="secondary-button compact-button" onClick={onRefresh}>↻ ATUALIZAR</button>
      </div>

      {message && <div className="site-message">{message}</div>}

      {loading ? (
        <div className="empty-orders">Carregando seus pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h2>Nenhum pedido por aqui</h2>
          <p>Quando você fizer um pedido, ele aparecerá nesta área.</p>
          <button className="primary-button inline-button" onClick={onHome}>VER PCs</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  const info = statusInfo[order.status];
  const steps: OrderStatus[] = ["recebido", "preparo", "caminho", "entregue"];
  const currentIndex = steps.indexOf(order.status);

  return (
    <article className="order-card">
      <div className="order-card-top">
        <div>
          <span className="order-code">{order.order_code}</span>
          <h2>{order.product_name}</h2>
          <p>Pedido realizado em {new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
        <div className={`status-pill ${info.className}`}>{info.icon} {info.label}</div>
      </div>

      <div className="order-timeline">
        {steps.map((step, index) => (
          <div className={`timeline-step ${index <= currentIndex ? "done" : ""}`} key={step}>
            <div className="timeline-dot">{index <= currentIndex ? "✓" : ""}</div>
            <span>{statusInfo[step].label}</span>
          </div>
        ))}
      </div>

      <div className="order-card-bottom">
        <div>
          <small>PAGAMENTO</small>
          <strong>
            {order.payment_status === "pago"
              ? "🟢 Pago"
              : order.payment_status === "cancelado"
                ? "❌ Cancelado"
                : "💵 Pendente — na entrega"}
          </strong>
        </div>
        <div>
          <small>VALOR</small>
          <strong>{money(Number(order.product_price))}</strong>
        </div>
      </div>
    </article>
  );
}

function AdminPage({
  adminUser,
  adminLoading,
  setAdminLoading,
  orders,
  setOrders,
  onLogin,
  onLogout,
  error,
  setError,
}: {
  adminUser: boolean;
  adminLoading: boolean;
  setAdminLoading: (value: boolean) => void;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  onLogin: () => void;
  onLogout: () => void;
  error: string;
  setError: (value: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [filter, setFilter] = useState<"todos" | OrderStatus>("todos");

  useEffect(() => {
    if (adminUser) void loadAllOrders();
  }, [adminUser]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setAdminLoading(true);
    setError("");

    const cleanEmail = email.trim();

    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (loginError) {
      console.error("ERRO DE LOGIN:", loginError);
      setError(`Erro de login: ${loginError.message}`);
      setAdminLoading(false);
      return;
    }

    const userId = authData.user?.id;

    if (!userId) {
      await supabase.auth.signOut();
      setError("Não foi possível identificar o usuário.");
      setAdminLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("ERRO AO VERIFICAR ADMIN:", profileError);
      await supabase.auth.signOut();
      setError("Não foi possível verificar as permissões da conta.");
      setAdminLoading(false);
      return;
    }

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Esta conta não possui permissão de administrador.");
      setAdminLoading(false);
      return;
    }

    setAdminLoading(false);
    onLogin();
  }

  async function loadAllOrders() {
    const { data, error: loadError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error("Erro ao carregar pedidos do admin:", loadError);
      setError("Não foi possível carregar os pedidos.");
      return;
    }

    setOrders((data || []) as Order[]);
  }

  async function updateOrder(
    id: number,
    changes: Partial<Pick<Order, "status" | "payment_status">>,
  ) {
    setError("");

    const { data, error: updateError } = await supabase
      .from("orders")
      .update(changes)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(updateError);
      setError("Não foi possível atualizar este pedido.");
      return;
    }

    setOrders((current) => current.map((order) => order.id === id ? (data as Order) : order));
  }

  if (!adminUser) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-lock">🔐</div>
          <p className="section-small">ÁREA RESTRITA</p>
          <h1>ADMINISTRAÇÃO</h1>
          <p>Entre com uma conta autorizada para gerenciar os pedidos.</p>

          <form onSubmit={login} className="order-form">
            <label>
              E-mail
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@centraltechx.com" />
            </label>

            <label>
              Senha
              <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="submit-order" disabled={adminLoading}>
              {adminLoading ? "ENTRANDO..." : "ENTRAR NO PAINEL →"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const filtered = filter === "todos" ? orders : orders.filter((order) => order.status === filter);

  const stats = {
    total: orders.length,
    recebido: orders.filter((order) => order.status === "recebido").length,
    preparo: orders.filter((order) => order.status === "preparo").length,
    caminho: orders.filter((order) => order.status === "caminho").length,
    entregue: orders.filter((order) => order.status === "entregue").length,
  };

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="section-small">CENTRAL TECHX</p>
          <h1>PAINEL <span>ADMIN</span></h1>
          <p>Gerencie pedidos e atualize o cliente em tempo real.</p>
        </div>
        <button className="secondary-button compact-button" onClick={onLogout}>SAIR</button>
      </div>

      {error && <div className="form-error admin-error">{error}</div>}

      <div className="admin-stats">
        <Stat label="TOTAL" value={stats.total} />
        <Stat label="RECEBIDOS" value={stats.recebido} />
        <Stat label="EM PREPARO" value={stats.preparo} />
        <Stat label="A CAMINHO" value={stats.caminho} />
        <Stat label="ENTREGUES" value={stats.entregue} />
      </div>

      <div className="admin-toolbar">
        <div className="admin-filters">
          {[
            ["todos", "Todos"],
            ["recebido", "Recebidos"],
            ["preparo", "Em preparo"],
            ["caminho", "A caminho"],
            ["entregue", "Entregues"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value as "todos" | OrderStatus)}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="secondary-button compact-button" onClick={loadAllOrders}>↻ ATUALIZAR</button>
      </div>

      <div className="admin-orders">
        {filtered.length === 0 ? (
          <div className="empty-orders">Nenhum pedido nesta categoria.</div>
        ) : (
          filtered.map((order) => (
            <AdminOrderRow key={order.id} order={order} onUpdate={updateOrder} />
          ))
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AdminOrderRow({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (id: number, changes: Partial<Pick<Order, "status" | "payment_status">>) => void;
}) {
  const info = statusInfo[order.status];

  return (
    <article className="admin-order-row">
      <div className="admin-order-main">
        <div>
          <span className="order-code">{order.order_code}</span>
          <h2>{order.product_name}</h2>
          <p><strong>{order.customer_name}</strong> · {order.customer_phone}</p>
          <p className="admin-address">{order.customer_address}</p>
        </div>

        <div className={`status-pill ${info.className}`}>{info.icon} {info.label}</div>
      </div>

      <div className="admin-actions">
        <label>
          STATUS
          <select
            value={order.status}
            onChange={(event) => onUpdate(order.id, { status: event.target.value as OrderStatus })}
          >
            <option value="recebido">📦 Pedido recebido</option>
            <option value="preparo">🛠️ Pedido em preparo</option>
            <option value="caminho">🚚 A caminho</option>
            <option value="entregue">✅ Entregue</option>
          </select>
        </label>

        <label>
          PAGAMENTO
          <select
            value={order.payment_status}
            onChange={(event) => onUpdate(order.id, { payment_status: event.target.value as PaymentStatus })}
          >
            <option value="pendente">💵 Pendente</option>
            <option value="pago">🟢 Pago</option>
            <option value="cancelado">❌ Cancelado</option>
          </select>
        </label>

        <div className="admin-price">
          <small>VALOR</small>
          <strong>{money(Number(order.product_price))}</strong>
        </div>
      </div>
    </article>
  );
}

export default App;
