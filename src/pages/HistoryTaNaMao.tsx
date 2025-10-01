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

type Item = {
  id: number | string;
  lead: { nome: string; email: string; telefone: string };
  vendedor?: string | null;
  veiculoOfertado: {
    marca?: string;
    modelo?: string;
    ano?: string;
    cor?: string;
    versao?: string;
    combustivel?: string;
    km?: string;
    preco?: string;
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

const HistoryTaNaMao = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await fetch(getApiUrl("/history/ta-na-mao"));
        const json = await resp.json();
        setData(json || []);
      } catch (e) {
        console.error("Erro ao buscar histórico Tá na Mão:", e);
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
      const resp = await fetch(getApiUrl(`/history/ta-na-mao/${id}`), {
        method: "DELETE",
      });
      if (!resp.ok && resp.status !== 204)
        throw new Error(`HTTP ${resp.status}`);
      setData((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Falha ao deletar registro (tá na mão):", err);
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
              Histórico - Tá na Mão
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
                    {item.lead?.nome ?? "-"}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        item.status === "Disponível" ? "default" : "secondary"
                      }
                    >
                      {item.status ?? "Disponível"}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(item.dataConsulta).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Vendedor: {formatVendedorName(item.vendedor)}
                    </div>
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
                        {item.lead?.email ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium">Telefone:</span>{" "}
                        {item.lead?.telefone ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">
                      Veículo Ofertado
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Marca:</span>{" "}
                        {item.veiculoOfertado?.marca ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium">Modelo:</span>{" "}
                        {item.veiculoOfertado?.modelo ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium">Ano:</span>{" "}
                        {item.veiculoOfertado?.ano ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium">Cor:</span>{" "}
                        {capFirst(item.veiculoOfertado?.cor)}
                      </p>
                      <p>
                        <span className="font-medium">Combustível:</span>{" "}
                        {item.veiculoOfertado?.combustivel ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium">KM:</span>{" "}
                        {item.veiculoOfertado?.km ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium">Preço:</span>{" "}
                        {item.veiculoOfertado?.preco ?? "-"}
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

export default HistoryTaNaMao;
