import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, Car, ArrowLeft } from "lucide-react";

type EstoqueItem = {
  id: number | string;
  placa?: string | null;
  marca?: string | null;
  modelo?: string | null;
  carroceria?: string | null;
  combustivel?: string | null;
  cor?: string | null;
  tipo?: string | null;
  cambio?: string | null;
  anoFabricacao?: number | string | null;
  anoModelo?: number | string | null;
  preco?: number | string | null;
};

const capFirst = (v?: string | null) => {
  const s = (v ?? "").trim();
  if (!s) return "-";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const brl = (n?: number | string | null) => {
  if (n === null || n === undefined || n === "") return "-";
  const num =
    typeof n === "number"
      ? n
      : Number(
          String(n)
            .replace(/[^\d,.-]/g, "")
            .replace(/\.(?=\d{3}(?:\D|$))/g, "")
            .replace(",", ".")
        );
  if (!Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(num);
};

// Helper simples. Se você já tem global, troque por ele.
const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3001";
const getApiUrl = (p: string) => `${API_BASE}${p}`;

const Estoque = () => {
  const [data, setData] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(getApiUrl("/estoque"));
        const json = await resp.json();
        setData(Array.isArray(json) ? json : []);
      } catch (e) {
        console.error("Erro ao carregar estoque:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
              Estoque de Veículos
            </h1>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando estoque...</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum veículo no estoque.
          </p>
        ) : (
          <div className="grid gap-6">
            {data.map((v) => (
              <Card key={v.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      {v.marca ?? "-"} {v.modelo ?? "-"}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <Badge variant="default">Disponível</Badge>

                      {v.placa && (
                        <div className="text-sm text-muted-foreground">
                          Placa: {v.placa}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 text-foreground">
                        Informações do Veículo
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Marca:</span>{" "}
                          {v.marca ?? "-"}
                        </p>
                        <p>
                          <span className="font-medium">Modelo:</span>{" "}
                          {v.modelo ?? "-"}
                        </p>
                        <p>
                          <span className="font-medium">Ano:</span>{" "}
                          {v.anoModelo
                            ? `${v.anoModelo} ${v.combustivel ?? ""}`.trim()
                            : "-"}
                        </p>
                        <p>
                          <span className="font-medium">Cor:</span>{" "}
                          {capFirst(v.cor)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-foreground">
                        Detalhes
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Carroceria:</span>{" "}
                          {v.carroceria ?? "-"}
                        </p>
                        <p>
                          <span className="font-medium">Câmbio:</span>{" "}
                          {v.cambio ?? "-"}
                        </p>
                        <p>
                          <span className="font-medium">Tipo:</span>{" "}
                          {v.tipo ?? "-"}
                        </p>
                        <p>
                          <span className="font-medium">Preço:</span>{" "}
                          {brl(v.preco)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Estoque;
