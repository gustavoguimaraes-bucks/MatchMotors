import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, Car, User, ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/config/api";

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
    cor?: string;
    versao?: string;
    combustivel?: string;
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

const HistoryProcuraSe = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

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
                    </div>
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
                      </p>
                      <p>
                        <span className="font-medium">Ano:</span>{" "}
                        {formatAno(item.veiculoDesejado)}{" "}
                      </p>
                      <p>
                        <span className="font-medium">Cor:</span>{" "}
                        {item.veiculoDesejado.cor}
                      </p>
                      <p>
                        <span className="font-medium">Versão:</span>{" "}
                        {item.veiculoDesejado.versao}
                      </p>
                      <p>
                        <span className="font-medium">Combustível:</span>{" "}
                        {item.veiculoDesejado.combustivel}
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
