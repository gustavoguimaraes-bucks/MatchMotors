import React, { useState } from "react";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import carBackground from "@/assets/car-bg.jpg";
import { apiRequest, getApiUrl } from "@/config/api";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const Form = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get parameters from URL
  const vehicleType = searchParams.get("vehicleType");
  const businessType = searchParams.get("businessType");
  const hasTrade = searchParams.get("hasTrade");

  // Redirect to selection if no parameters
  useEffect(() => {
    if (!vehicleType || !businessType) {
      navigate("/selection");
    }
  }, [vehicleType, businessType, navigate]);

  const showLeadInfo = true;
  const showDesiredVehicle = businessType === "procura-se";
  const showCurrentVehicle =
    businessType === "ta-na-mao" ||
    (businessType === "procura-se" && hasTrade === "sim");

  // Lead Information
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  // Desired Vehicle - desiredType será definido pelo vehicleType da URL
  const [desiredType, setDesiredType] = useState("");
  const [desiredBrand, setDesiredBrand] = useState("");
  const [brands, setBrands] = useState<{ code: string; name: string }[]>([]);
  const [desiredYear, setDesiredYear] = useState("");
  const [years, setYears] = useState<{ code: string; name: string }[]>([]);
  const [desiredModel, setDesiredModel] = useState("");
  const [models, setModels] = useState<{ code: string; name: string }[]>([]);
  const [desiredColor, setDesiredColor] = useState("");
  const [desiredCarroceria, setdesiredCarroceria] = useState("");
  const [desiredCondition, setDesiredCondition] = useState("");
  const [desiredBlindagem, setdesiredBlindagem] = useState("");
  const [desiredKmMin, setDesiredKmMin] = useState("");
  const [desiredKmMax, setDesiredKmMax] = useState("");
  const [desiredPriceMin, setDesiredPriceMin] = useState("");
  const [desiredPriceMax, setDesiredPriceMax] = useState("");
  const [desiredObservations, setDesiredObservations] = useState("");

  const [selectedSeller, setSelectedSeller] = useState("");

  // Current Vehicle - currentType será definido pelo vehicleType da URL
  const [currentType, setCurrentType] = useState("");
  const [currentBrand, setCurrentBrand] = useState("");
  const [brandsCurrent, setBrandsCurrent] = useState<
    { code: string; name: string }[]
  >([]);
  const [currentYear, setCurrentYear] = useState("");
  const [yearsCurrent, setYearsCurrent] = useState<
    { code: string; name: string }[]
  >([]);
  const [currentModel, setCurrentModel] = useState("");
  const [modelsCurrent, setModelsCurrent] = useState<
    { code: string; name: string }[]
  >([]);
  const [currentColor, setCurrentColor] = useState("");
  const [currentCarroceria, setcurrentCarroceria] = useState("");
  const [currentCondition, setCurrentCondition] = useState("");
  const [currentBlindagem, setcurrentBlindagem] = useState("");
  const [currentKm, setCurrentKm] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [currentObservations, setCurrentObservations] = useState("");

  const getNomeCompletoDoCarro = async (
    tipo: string,
    marcaCode: string,
    anoCode: string,
    modeloCode: string
  ) => {
    const tipoAPI = tipo === "carro" ? "cars" : "motorcycles";

    try {
      // Consulta modelo (retorna nome da marca e modelo)
      const modeloResponse = await fetch(
        getApiUrl(
          `/fipe/${tipoAPI}/brands/${marcaCode}/years/${anoCode}/models`
        )
      );
      const modeloData = await modeloResponse.json();

      const nomeModelo =
        modeloData.find((m) => m.code === modeloCode)?.name || modeloCode;

      // Consulta marca
      const marcasResponse = await fetch(getApiUrl(`/fipe/${tipoAPI}/brands`));
      const marcasData = await marcasResponse.json();

      const nomeMarca =
        marcasData.find((m) => m.code === marcaCode)?.name || marcaCode;

      // Consulta ano
      const anosResponse = await fetch(
        getApiUrl(`/fipe/${tipoAPI}/brands/${marcaCode}/years`)
      );
      const anosData = await anosResponse.json();

      const nomeAno = anosData.find((a) => a.code === anoCode)?.name || anoCode;

      return `${nomeMarca} ${nomeModelo} ${nomeAno}`;
    } catch (error) {
      console.error("Erro ao buscar nome completo do carro:", error);
      return `${marcaCode} ${modeloCode} ${anoCode}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSeller) {
      alert("Por favor, selecione um vendedor antes de continuar.");
      return;
    }

    // Pelo menos um contato do lead é obrigatório (email OU telefone)
    const emailOk = (leadEmail || "").trim().length > 0; // type=email já valida formato se preenchido
    const phoneDigits = (leadPhone || "").replace(/\D/g, "");
    const phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 11; // BR: 10~11 dígitos
    if (!emailOk && !phoneOk) {
      alert("Informe pelo menos Email ou Telefone do lead.");
      return;
    }

    const desired = {
      desiredType,
      desiredBrand,
      desiredYear,
      desiredModel,
      desiredColor,
      desiredCarroceria,
      desiredCondition,
      desiredBlindagem,
      desiredKmMin,
      desiredKmMax,
      desiredPriceMin,
      desiredPriceMax,
      desiredObservations,
    };

    const current = {
      currentType,
      currentBrand,
      currentYear,
      currentModel,
      currentColor,
      currentCarroceria,
      currentCondition,
      currentBlindagem,
      currentKm,
      currentPrice,
      currentObservations,
    };

    // Anexa o vendedor dentro do bloco correspondente
    if (showDesiredVehicle) {
      (desired as any).vendedor_responsavel = selectedSeller;
    }
    if (showCurrentVehicle) {
      (current as any).vendedor_responsavel = selectedSeller;
    }

    // Envia somente os blocos realmente usados
    const payload: any = { lead: { leadName, leadEmail, leadPhone } };
    if (showDesiredVehicle) payload.desired = desired;
    if (showCurrentVehicle) payload.current = current;

    if (!vehicleType || !businessType) {
      return null;
    }

    try {
      const response = await apiRequest("/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao enviar os dados");

      const result = await response.json();
      console.log("Lead enviado com sucesso:", result);

      if (result.reverseMatch && result.reverseMatch.found) {
        const leadQueDeseja = result.reverseMatch.lead;
        alert(
          `🎯 MATCH ENCONTRADO!\n\nO veículo que você acabou de cadastrar é desejado por um cliente já registrado!\n\n👤 Nome do Cliente: ${leadQueDeseja.nome}\n📞 Telefone: ${leadQueDeseja.telefone}\n✉️ Email: ${leadQueDeseja.email}`
        );
        return;
      }

      if (showDesiredVehicle) {
        try {
          const matchResponse = await apiRequest("/match", {
            method: "POST",
            body: JSON.stringify({ desired, leadId: result.idLead }),
          });

          const matchData = await matchResponse.json();
          console.log("Resposta do match:", matchData);

          if (matchData.found) {
            const carro = matchData.carro;

            const normalizedAvailable = {
              id: carro.id,
              placa: carro.placa_completa || carro.placa,
              marca: carro.marca,
              modelo: carro.modelo_nome || carro.modelo,
              ano_fabricacao: carro.anofabricacao || carro.ano_fabricacao,
              ano_modelo: carro.anomodelo || carro.ano_modelo,
              cor: carro.cor || null,
              preco: carro.preco || carro.venda_com_desconto,
              combustivel: carro.combustivel || null,
              cambio: carro.cambio || null,
              carroceria: carro.carroceria || null,
              vendedor: carro.vendedor || null,
            };

            try {
              await apiRequest("/matches", {
                method: "POST",
                body: JSON.stringify({
                  leadId: result.idLead,
                  matchedLeadId:
                    matchData.source === "troca" ? carro.lead_id : null,
                  desired,
                  available: normalizedAvailable, // Enviando o objeto padronizado
                  source: matchData.source,
                  vendedor_responsavel: selectedSeller,
                }),
              });
              console.log("Match salvo com sucesso na tabela de histórico.");
            } catch (saveError) {
              console.error("Falha ao salvar o match na tabela:", saveError);
            }

            // Tratamento diferenciado baseado na fonte do match
            if (matchData.source === "estoque") {
              // Match encontrado no estoque KKA
              const matchType =
                carro.match_type === "flexible" ? " (busca flexível)" : "";
              const precoFormatado = carro.preco
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(carro.preco)
                : "Consultar";

              alert(
                `🎯 MATCH ENCONTRADO NO ESTOQUE KKA!${matchType}

🚗 Veículo: ${carro.marca} ${carro.modelo_nome}
📅 Ano Fabricação: ${carro.anofabricacao}
📅 Ano Modelo: ${carro.anomodelo}
🎨 Cor: ${carro.cor}
🚘 Carroceria: ${carro.carroceria}
⛽ Combustível: ${carro.combustivel}
🔧 Câmbio: ${carro.cambio}
💰 Preço: ${precoFormatado}
🏷️ Placa: ${carro.placa_completa}

📍 Fonte: Estoque KKA
🟢 Status: Disponível`
              );
            } else if (matchData.source === "historico") {
              // NEW: Match encontrado no histórico de vendas KKA
              const matchType =
                carro.match_type === "flexible"
                  ? " (busca flexível)"
                  : carro.match_type === "brand_only"
                  ? " (busca por marca)"
                  : "";

              const precoFormatado = carro.venda_com_desconto
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(carro.venda_com_desconto)
                : "Não informado";

              alert(
                `📊 MATCH ENCONTRADO NO HISTÓRICO KKA!${matchType}

🚗 Veículo: ${carro.marca} ${carro.modelo}
📅 Ano Fabricação: ${carro.ano_fabricacao}
📅 Ano Modelo: ${carro.ano_modelo}
🏷️ Placa: ${carro.placa}
💰 Preço de Venda: ${precoFormatado}
👤 Vendedor: ${carro.vendedor || "Não informado"}
➡️ Cliente de Saída: ${carro.cliente_saida || "Não informado"}
⬅️ Cliente de Entrada: ${carro.cliente_entrada || "Não informado"}
${carro.diferenca_anos ? `📏 Diferença de anos: ${carro.diferenca_anos}` : ""}

📍 Fonte: Histórico de Vendas KKA
📈 Status: Referência de Preço`
              );
            } else if (matchData.source === "troca") {
              // Match encontrado em carros de troca
              const leadMatch = matchData.lead;

              const nomeCompleto = await getNomeCompletoDoCarro(
                carro.tipo || "carro",
                carro.marca,
                carro.ano,
                carro.modelo
              );

              alert(
                `🔄 MATCH ENCONTRADO PARA TROCA!

🚗 Veículo: ${nomeCompleto}
👤 Proprietário: ${leadMatch.nome}
📞 Contato: ${leadMatch.telefone}
✉️ Email: ${leadMatch.email}

💱 Modalidade: Troca entre leads`
              );
            }
          } else {
            alert(
              `Lead cadastrado com sucesso! 

❌ Nenhum match encontrado no momento.

Fontes consultadas:
✅ Estoque KKA da concessionária  
✅ Histórico de vendas KKA
✅ Carros disponíveis para troca`
            );
          }
        } catch (error) {
          console.error("Erro ao buscar match:", error);
          alert(
            "Lead cadastrado com sucesso, mas houve erro ao buscar match. Verifique os logs do servidor."
          );
        }
      } else {
        // For "ta-na-mao" without search
        alert("Lead cadastrado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      alert("Erro ao cadastrar lead. Verifique sua conexão e tente novamente.");
    }
  };

  const mapVehicleType = (tipo: string) => {
    if (tipo === "carro") return "cars";
    if (tipo === "moto") return "motorcycles";
    return "";
  };

  useEffect(() => {
    const logado = localStorage.getItem("logado");
    if (logado !== "true") {
      navigate("/login");
    }
  }, []);

  // UseEffect para definir o tipo do veículo baseado na URL
  useEffect(() => {
    if (vehicleType) {
      setDesiredType(vehicleType);
      setCurrentType(vehicleType);
    }
  }, [vehicleType]);

  // Desired Vehicle useEffects
  useEffect(() => {
    // Quando a marca mudar, limpa os campos dependentes
    setDesiredYear("");
    setDesiredModel("");
    setYears([]);
    setModels([]);
  }, [desiredBrand]);

  // Quando o vehicleType da URL mudar, limpa todos os campos do veículo desejado
  useEffect(() => {
    setDesiredBrand("");
    setDesiredYear("");
    setDesiredModel("");
    setYears([]);
    setModels([]);
  }, [vehicleType]);

  // UseEffect para buscar marcas da API (Desired Vehicle)
  useEffect(() => {
    if (!showDesiredVehicle) return; // Only fetch if showing desired vehicle section

    const fetchBrands = async () => {
      const tipoAPI = mapVehicleType(vehicleType || ""); // Usa vehicleType da URL
      if (!tipoAPI) return;

      try {
        const response = await fetch(getApiUrl(`/fipe/${tipoAPI}/brands`));
        const data = await response.json();

        // Verifica se houve dados antes de setar
        if (!data || !data.length) {
          setBrands([]);
          setYears([]);
          setModels([]);
          setDesiredBrand("");
          setDesiredYear("");
          setDesiredModel("");
          return;
        }

        // Se os dados forem válidos, define normalmente
        setBrands(data);
      } catch (error) {
        console.error("Erro ao buscar marcas:", error);
        setBrands([]);
      }
    };

    fetchBrands();
  }, [vehicleType, showDesiredVehicle]); // Mudou de desiredType para vehicleType

  // UseEffect para buscar anos da API (Desired Vehicle)
  useEffect(() => {
    if (!showDesiredVehicle) return; // Only fetch if showing desired vehicle section

    const fetchYears = async () => {
      const tipoAPI = mapVehicleType(vehicleType || ""); // Usa vehicleType da URL
      if (!tipoAPI) return;

      try {
        const response = await fetch(
          getApiUrl(`/fipe/${tipoAPI}/brands/${desiredBrand}/years`)
        );
        const data = await response.json();
        setYears(data);
      } catch (error) {
        console.error("Erro ao buscar anos:", error);
      }
      setYears;
    };

    fetchYears();
  }, [vehicleType, desiredBrand, showDesiredVehicle]); // Mudou de desiredType para vehicleType

  // UseEffect para buscar modelos da API (Desired Vehicle)
  useEffect(() => {
    if (!showDesiredVehicle) return; // Only fetch if showing desired vehicle section

    const tipoAPI = mapVehicleType(vehicleType || ""); // Usa vehicleType da URL
    if (!tipoAPI || !desiredBrand || !desiredYear) return;

    const fetchModels = async () => {
      const response = await fetch(
        getApiUrl(
          `/fipe/${tipoAPI}/brands/${desiredBrand}/years/${desiredYear}/models`
        )
      );
      const data = await response.json();
      setModels(data);
    };

    fetchModels();
  }, [vehicleType, desiredBrand, desiredYear, showDesiredVehicle]); // Mudou de desiredType para vehicleType

  // Current Vehicle useEffects
  useEffect(() => {
    // Quando a marca atual mudar, limpa os campos dependentes
    setCurrentYear("");
    setCurrentModel("");
    setYearsCurrent([]);
    setModelsCurrent([]);
  }, [currentBrand]);

  // Quando o vehicleType da URL mudar, limpa todos os campos do veículo atual
  useEffect(() => {
    setCurrentBrand("");
    setCurrentYear("");
    setCurrentModel("");
    setYearsCurrent([]);
    setModelsCurrent([]);
  }, [vehicleType]);

  // UseEffect para buscar marcas do veículo atual
  useEffect(() => {
    if (!showCurrentVehicle) return; // Only fetch if showing current vehicle section

    const fetchCurrentBrands = async () => {
      const tipoAPI = mapVehicleType(vehicleType || ""); // Usa vehicleType da URL
      if (!tipoAPI) return;

      try {
        const response = await fetch(getApiUrl(`/fipe/${tipoAPI}/brands`));
        const data = await response.json();
        setBrandsCurrent(data);
      } catch (error) {
        console.error("Erro ao buscar marcas do veículo atual:", error);
        setBrandsCurrent([]);
      }
    };

    fetchCurrentBrands();
  }, [vehicleType, showCurrentVehicle]); // Mudou de currentType para vehicleType

  // UseEffect para buscar anos do veículo atual
  useEffect(() => {
    if (!showCurrentVehicle) return; // Only fetch if showing current vehicle section

    const fetchCurrentYears = async () => {
      const tipoAPI = mapVehicleType(vehicleType || ""); // Usa vehicleType da URL
      if (!tipoAPI || !currentBrand) return;

      try {
        const response = await fetch(
          getApiUrl(`/fipe/${tipoAPI}/brands/${currentBrand}/years`)
        );
        const data = await response.json();
        setYearsCurrent(data);
      } catch (error) {
        console.error("Erro ao buscar anos do veículo atual:", error);
        setYearsCurrent([]);
      }
    };
    fetchCurrentYears();
  }, [vehicleType, currentBrand, showCurrentVehicle]); // Mudou de currentType para vehicleType

  // UseEffect para buscar modelos do veículo atual
  useEffect(() => {
    if (!showCurrentVehicle) return; // Only fetch if showing current vehicle section

    const tipoAPI = mapVehicleType(vehicleType || ""); // Usa vehicleType da URL
    if (!tipoAPI || !currentBrand || !currentYear) return;

    const fetchCurrentModels = async () => {
      try {
        const response = await fetch(
          getApiUrl(
            `/fipe/${tipoAPI}/brands/${currentBrand}/years/${currentYear}/models`
          )
        );
        const data = await response.json();
        setModelsCurrent(data);
      } catch (error) {
        console.error("Erro ao buscar modelos do veículo atual:", error);
        setModelsCurrent([]);
      }
    };
    fetchCurrentModels();
  }, [vehicleType, currentBrand, currentYear, showCurrentVehicle]); // Mudou de currentType para vehicleType

  if (!vehicleType || !businessType) {
    return null; // Will redirect via useEffect
  }

  return (
    <div
      className="min-h-screen bg-black bg-cover bg-center relative"
      style={{ backgroundImage: `url(${carBackground})` }}
    >
      <div
        className="imagemlogo"
        style={{ marginTop: "50px", display: "flex", justifyContent: "center" }}
      >
        <Link to="/">
          <img
            src={logo}
            width="400px"
            height="10000px"
            alt="Logo MatchMotors"
            className="h-16"
          />
        </Link>
      </div>

      <Link to="/">
        <Button variant="outline" size="sm">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </Link>

      <div className="relative z-10 container mx-auto mt-6 flex justify-center">
        <Select value={selectedSeller} onValueChange={setSelectedSeller}>
          <SelectTrigger className="w-[250px] bg-black/80 border border-white">
            <SelectValue placeholder="Selecione um vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alessandra">Alessandra</SelectItem>
            <SelectItem value="diego-cardoso">Diego Cardoso</SelectItem>
            <SelectItem value="dulio-tunin">Dúlio Tunin</SelectItem>
            <SelectItem value="jose">José</SelectItem>
            <SelectItem value="matheus-tavares">Matheus Tavares</SelectItem>
            <SelectItem value="nathan-dias">Nathan Dias</SelectItem>
            <SelectItem value="rogerio-marcitelli">
              Rogerio Marcitelli
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative z-10 container mx-auto p-8">
        <div className="max-w-4xl mx-auto mb-6">
          <Button
            onClick={() => navigate("/selection")}
            variant="outline"
            className="mb-4"
          >
            ← Voltar para seleção
          </Button>
          <h1 className="text-3xl font-bold text-white text-center">
            Formulário - {vehicleType === "carro" ? "Carro" : "Moto"}
          </h1>
          <p className="text-center text-gray-300 mt-2">
            {businessType === "procura-se" ? "Procura-se" : "Tá na mão"}
            {hasTrade &&
              businessType === "procura-se" &&
              ` • ${hasTrade === "sim" ? "Com troca" : "Sem troca"}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
          {/* Lead Information Section - Always show */}
          {showLeadInfo && (
            <div className="bg-black/80 rounded-lg p-6 shadow-outset border border-white">
              <h2 className="text-2xl font-bold text-white mb-6">
                Informações do Lead
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Nome"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Telefone"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Desired Vehicle Section - Show only for "procura-se" */}
          {showDesiredVehicle && (
            <div className="bg-black/80 rounded-lg p-6 shadow-outset border border-white">
              <h2 className="text-2xl font-bold text-white mb-6">
                Veículo Desejado
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Removido o Select de tipo do veículo - será definido pela URL */}

                <Select value={desiredBrand} onValueChange={setDesiredBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.code} value={brand.code}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={desiredYear} onValueChange={setDesiredYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.code} value={y.code}>
                        {y.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={desiredModel} onValueChange={setDesiredModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.code} value={m.code}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={desiredColor} onValueChange={setDesiredColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cada SelectItem representa uma cor disponível para o veículo */}
                    <SelectItem value="qualquer">Qualquer cor</SelectItem>
                    <SelectItem value="amarelo">Amarelo</SelectItem>
                    <SelectItem value="azul">Azul</SelectItem>
                    <SelectItem value="bege">Bege</SelectItem>
                    <SelectItem value="branco">Branco</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="cinza">Cinza</SelectItem>
                    <SelectItem value="dourado">Dourado</SelectItem>
                    <SelectItem value="indefinida">Indefinida</SelectItem>
                    <SelectItem value="laranja">Laranja</SelectItem>
                    <SelectItem value="marrom">Marrom</SelectItem>
                    <SelectItem value="prata">Prata</SelectItem>
                    <SelectItem value="preto">Preto</SelectItem>
                    <SelectItem value="rosa">Rosa</SelectItem>
                    <SelectItem value="roxo">Roxo</SelectItem>
                    <SelectItem value="verde">Verde</SelectItem>
                    <SelectItem value="vermelho">Vermelho</SelectItem>
                    <SelectItem value="vinho">Vinho</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={desiredCarroceria}
                  onValueChange={setdesiredCarroceria}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Carroceria" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cada SelectItem representa um tipo de carroceria disponível */}
                    <SelectItem value="buggy">Buggy</SelectItem>
                    <SelectItem value="conversivel">Conversível</SelectItem>
                    <SelectItem value="cupe">Cupê</SelectItem>
                    <SelectItem value="hatch">Hatch</SelectItem>
                    <SelectItem value="minivan">Minivan</SelectItem>
                    <SelectItem value="perua">Perua/SW</SelectItem>
                    <SelectItem value="picape">Picape</SelectItem>
                    <SelectItem value="sedan">Sedã</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van/Utilitário/Furgão</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={desiredCondition}
                  onValueChange={setDesiredCondition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Novo ou Usado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="usado">Usado</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={desiredBlindagem}
                  onValueChange={setdesiredBlindagem}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blindagem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="indiferente">Indiferente</SelectItem>
                  </SelectContent>
                </Select>

                <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="KM mínima desejada"
                    value={desiredKmMin}
                    onChange={(e) => setDesiredKmMin(e.target.value)}
                  />
                  <Input
                    placeholder="KM máxima desejada"
                    value={desiredKmMax}
                    onChange={(e) => setDesiredKmMax(e.target.value)}
                  />
                </div>

                <div className="lg:col-span-2 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Preço mínimo"
                    value={desiredPriceMin}
                    onChange={(e) => setDesiredPriceMin(e.target.value)}
                  />
                  <Input
                    placeholder="Preço máximo"
                    value={desiredPriceMax}
                    onChange={(e) => setDesiredPriceMax(e.target.value)}
                  />
                </div>

                <div className="lg:col-span-3">
                  <Textarea
                    placeholder="Observações"
                    value={desiredObservations}
                    onChange={(e) => setDesiredObservations(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Current Vehicle Section - Show for "ta-na-mao" or "procura-se" with trade */}
          {showCurrentVehicle && (
            <div className="bg-black/80 rounded-lg p-6 shadow-outset border border-white">
              <h2 className="text-2xl font-bold text-white mb-6">Tá na Mão</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Removido o Select de tipo do veículo - será definido pela URL */}

                <Select value={currentBrand} onValueChange={setCurrentBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandsCurrent.map((brand) => (
                      <SelectItem key={brand.code} value={brand.code}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={currentYear} onValueChange={setCurrentYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearsCurrent.map((year) => (
                      <SelectItem key={year.code} value={year.code}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={currentModel} onValueChange={setCurrentModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelsCurrent.map((model) => (
                      <SelectItem key={model.code} value={model.code}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={currentColor} onValueChange={setCurrentColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cada SelectItem representa uma cor disponível para o veículo */}
                    <SelectItem value="qualquer">Qualquer cor</SelectItem>
                    <SelectItem value="amarelo">Amarelo</SelectItem>
                    <SelectItem value="azul">Azul</SelectItem>
                    <SelectItem value="bege">Bege</SelectItem>
                    <SelectItem value="branco">Branco</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="cinza">Cinza</SelectItem>
                    <SelectItem value="dourado">Dourado</SelectItem>
                    <SelectItem value="indefinida">Indefinida</SelectItem>
                    <SelectItem value="laranja">Laranja</SelectItem>
                    <SelectItem value="marrom">Marrom</SelectItem>
                    <SelectItem value="prata">Prata</SelectItem>
                    <SelectItem value="preto">Preto</SelectItem>
                    <SelectItem value="rosa">Rosa</SelectItem>
                    <SelectItem value="roxo">Roxo</SelectItem>
                    <SelectItem value="verde">Verde</SelectItem>
                    <SelectItem value="vermelho">Vermelho</SelectItem>
                    <SelectItem value="vinho">Vinho</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={currentCarroceria}
                  onValueChange={setcurrentCarroceria}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Carroceria" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cada SelectItem representa um tipo de carroceria disponível */}
                    <SelectItem value="buggy">Buggy</SelectItem>
                    <SelectItem value="conversivel">Conversível</SelectItem>
                    <SelectItem value="cupe">Cupê</SelectItem>
                    <SelectItem value="hatch">Hatch</SelectItem>
                    <SelectItem value="minivan">Minivan</SelectItem>
                    <SelectItem value="perua">Perua/SW</SelectItem>
                    <SelectItem value="picape">Picape</SelectItem>
                    <SelectItem value="sedan">Sedã</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van/Utilitário/Furgão</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={currentCondition}
                  onValueChange={setCurrentCondition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Novo ou Usado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="usado">Usado</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={currentBlindagem}
                  onValueChange={setcurrentBlindagem}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blindagem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="indiferente">Indiferente</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Kilometragem"
                  value={currentKm}
                  onChange={(e) => setCurrentKm(e.target.value)}
                />

                <Input
                  placeholder="Preço"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                />

                <div className="lg:col-span-3">
                  <Textarea
                    placeholder="Observações"
                    value={currentObservations}
                    onChange={(e) => setCurrentObservations(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button onClick={handleSubmit} type="submit" className="px-12">
              Match!
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
