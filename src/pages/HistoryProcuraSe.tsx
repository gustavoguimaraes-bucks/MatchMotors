import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Calendar,
  Car,
  User,
  ArrowLeft,
  Trash2,
  Loader2,
} from "lucide-react";
import { getApiUrl } from "@/config/api";

const capFirst = (v?: string | null) => {
  const s = (v ?? "").trim();
  if (!s || s === "-") return s || "-";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatAno = (v?: { anoInicio?: string; anoFim?: string } | null) => {
  if (!v) return "-";
  const a = (v.anoInicio ?? "").toString().trim();
  const b = (v.anoFim ?? "").toString().trim();
  if (!a && !b) return "-";
  if (!b || a === b) return a || b; // mostra um único ano
  return `${a} - ${b}`;
};

type Item = {
  id: number | string;
  lead: { nome: string; email: string; telefone: string };
  vendedor?: string | null;
  veiculoDesejado: {
    marca?: string;
    modelo?: string;
    anoInicio?: string;
    anoFim?: string;
    anoLabel?: string;
    cor?: string;
    versao?: string;
    combustivel?: string;
    km?: string;
    precoMin?: string | number;
    precoMax?: string | number;
  } | null;
  dataConsulta: string;
  status: string;
};

const formatVendedorName = (vendedor?: string | null) => {
  if (!vendedor) return "Não informado";
  return vendedor
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatAnoDesejado = (
  v?: { anoLabel?: string; anoInicio?: string; anoFim?: string } | null
) => {
  if (!v) return "-";
  if (v.anoLabel) return v.anoLabel; // "2023 Gasolina"
  const a = v.anoInicio ?? "";
  const b = v.anoFim ?? "";
  if (!a && !b) return "-";
  if (!b || a === b) return a || b;
  return `${a} - ${b}`;
};

// -------- Helpers de KM e Preço (toleram string/number ou ausência) --------
const toNumber = (v: unknown) => {
  if (typeof v === "number") return v;
  const s = String(v ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};
const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
const formatPrecoDesejado = (v?: { precoMin?: any; precoMax?: any } | null) => {
  if (!v) return "-";
  const minRaw = (v as any).precoMin ?? (v as any).preco_minimo;
  const maxRaw = (v as any).precoMax ?? (v as any).preco_maximo;
  const min = toNumber(minRaw);
  const max = toNumber(maxRaw);
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);
  if (!hasMin && !hasMax) return "-";
  if (hasMin && hasMax) return `${brl(min)} - ${brl(max)}`;
  return hasMin ? brl(min) : brl(max);
};
const formatKmDesejado = (
  v?: { km?: string; kmMin?: any; kmMax?: any } | null
) => {
  if (!v) return "-";
  const km = (v as any).km;
  if (km) return km;
  const a = (v as any).kmMin ?? (v as any).km_min;
  const b = (v as any).kmMax ?? (v as any).km_max;
  if (!a && !b) return "-";
  return a && b ? `${a} - ${b}` : a || b;
};

const HistoryProcuraSe = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await fetch(getApiUrl("/history/procura-se"));
        const json = await resp.json();
        setData(json || []);
      } catch (e) {
        console.error("Erro ao buscar histórico Procura-se:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleDelete = async (id: string | number) => {
    const ok = window.confirm("Tem certeza que deseja deletar este registro?");
    if (!ok) return;
    try {
      setDeletingId(id);
      const resp = await fetch(getApiUrl(`/history/procura-se/${id}`), {
        method: "DELETE",
      });
      if (!resp.ok && resp.status !== 204)
        throw new Error(`HTTP ${resp.status}`);
      setData((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Falha ao deletar registro (procura-se):", err);
      alert("Não foi possível deletar. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-6xl mx-auto">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/history">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Car className="h-8 w-8" />
              Histórico - Procura-se
            </h1>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {data.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {item.lead.nome}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        item.status === "Ativo" ? "default" : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {item.dataConsulta}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Vendedor: {formatVendedorName(item.vendedor)}
                    </div>{" "}
                    <button
                      aria-label="Excluir registro"
                      className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      title="Excluir"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">
                      Informações do Lead
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {item.lead.email}
                      </p>
                      <p>
                        <span className="font-medium">Telefone:</span>{" "}
                        {item.lead.telefone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">
                      Veículo Desejado
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Marca:</span>{" "}
                        {item.veiculoDesejado.marca}
                      </p>
                      <p>
                        <span className="font-medium">Modelo:</span>{" "}
                        {item.veiculoDesejado.modelo}
                      </p>{" "}
                      <p>
                        <span className="font-medium">Ano:</span>{" "}
                        {formatAnoDesejado(item.veiculoDesejado)}{" "}
                      </p>
                      <p>
                        <span className="font-medium">Cor:</span>{" "}
                        {capFirst(item.veiculoDesejado?.cor)}
                      </p>
                      <p>
                        <span className="font-medium">KM desejada:</span>{" "}
                        {formatKmDesejado(item.veiculoDesejado)}
                      </p>
                      <p>
                        <span className="font-medium">Preço desejado:</span>{" "}
                        {formatPrecoDesejado(item.veiculoDesejado)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryProcuraSe;
