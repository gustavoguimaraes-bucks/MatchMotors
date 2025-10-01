import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Car,
  User,
  Calendar,
  Phone,
  Mail,
  Home,
  UserCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "@/config/api";

const History = () => {
  const [matches, setMatches] = useState([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(getApiUrl("/matches"));
        const data = await res.json();

        // Mapear os campos para os nomes esperados pelo front
        const formatado = data.map((match) => ({
          ...match,
          desiredVehicle: {
            brand: match.desiredVehicle.marca,
            model: match.desiredVehicle.modelo,
            year: match.desiredVehicle.ano,
            color: match.desiredVehicle.cor,
            type: match.desiredVehicle.tipo,
            condition: "-",
            priceRange: "-",
          },
          availableVehicle: {
            brand: match.availableVehicle.marca,
            model: match.availableVehicle.modelo,
            year: match.availableVehicle.ano,
            color: match.availableVehicle.cor,
            type: match.availableVehicle.tipo,
            condition: "-", // idem
            price: "-", // idem
          },
        }));

        setMatches(formatado);
      } catch (err) {
        console.error("Erro ao buscar histórico de matches:", err);
      }
    };

    fetchMatches();
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const logado = localStorage.getItem("logado");
    if (logado !== "true") {
      navigate("/login");
    }
  }, []);

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Tem certeza que deseja deletar este registro?");
    if (!ok) return;
    try {
      setDeletingId(id);
      const resp = await fetch(getApiUrl(`/matches/${id}`), {
        method: "DELETE",
      });
      if (!resp.ok && resp.status !== 204)
        throw new Error(`HTTP ${resp.status}`);
      setMatches((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Falha ao deletar match:", err);
      alert("Não foi possível deletar. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  // Função para formatar o nome do vendedor
  const formatVendedorName = (vendedor) => {
    if (!vendedor) return "Não informado";

    // Converter de kebab-case para formato legível
    return vendedor
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-black bg-car-pattern bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex gap-2">
          <Link to="/history-procura-se">
            <Button variant="outline" size="sm">
              Procura-se
            </Button>
          </Link>
          <Link to="/history-ta-na-mao">
            <Button variant="outline" size="sm">
              Tá na Mão
            </Button>
          </Link>

          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">
            Histórico de <span className="font-bold">Matches</span>
          </h1>
        </div>

        <div className="grid gap-6">
          {matches.map((match) => (
            <Card
              key={match.id}
              className="bg-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Match #{match.id} - {match.leadName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        match.status === "Ativo"
                          ? "default"
                          : match.status === "Concluído"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        match.status === "Ativo"
                          ? "bg-green-600 text-white"
                          : match.status === "Concluído"
                          ? "bg-blue-600 text-white"
                          : "bg-yellow-600 text-white"
                      }
                    >
                      {match.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-white/70 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(match.matchDate).toLocaleDateString("pt-BR")}
                    </div>
                    <button
                      aria-label="Excluir match"
                      className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-white/10 disabled:opacity-50"
                      onClick={() => handleDelete(match.id)}
                      disabled={deletingId === match.id}
                      title="Excluir"
                    >
                      {deletingId === match.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Informações do Lead */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações do Lead
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-white/80">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {match.leadEmail}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {match.leadPhone}
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      <span className="font-medium">
                        Vendedor:{" "}
                        {formatVendedorName(match.vendedorResponsavel)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparação de Veículos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Veículo Desejado */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Veículo Desejado
                    </h3>
                    <div className="bg-black/50 border border-white/20 rounded-lg p-4 space-y-2">
                      <div className="text-white/80">
                        <span className="font-medium">
                          {match.desiredVehicle.brand}{" "}
                          {match.desiredVehicle.model}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                        <div>Tipo: {match.desiredVehicle.type}</div>
                        <div>Ano: {match.desiredVehicle.year}</div>
                        <div>Cor: {match.desiredVehicle.color}</div>
                        <div>Condição: {match.desiredVehicle.condition}</div>
                      </div>
                      <div className="text-sm text-white/70 pt-2 border-t border-white/20">
                        Faixa de Preço: {match.desiredVehicle.priceRange}
                      </div>
                    </div>
                  </div>

                  {/* Veículo Disponível */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Veículo Disponível
                    </h3>
                    <div className="bg-black/50 border border-white/20 rounded-lg p-4 space-y-2">
                      <div className="text-white/80">
                        <span className="font-medium">
                          {match.availableVehicle.brand}{" "}
                          {match.availableVehicle.model}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                        <div>Tipo: {match.availableVehicle.type}</div>
                        <div>Ano: {match.availableVehicle.year}</div>
                        <div>Cor: {match.availableVehicle.color}</div>
                        <div>Condição: {match.availableVehicle.condition}</div>
                      </div>
                      <div className="text-sm text-white/70 pt-2 border-t border-white/20">
                        Preço: {match.availableVehicle.price}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {matches.length === 0 && (
          <Card className="bg-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <CardContent className="text-center py-12">
              <Car className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                Nenhum match encontrado
              </h3>
              <p className="text-white/70">
                Quando houver matches, eles aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
