import React, { useState } from "react";
import { useEffect } from "react";
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

const Form = () => {
  // Lead Information
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  // Desired Vehicle
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

  // Current Vehicle (Tá na mão)
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

    // Consulta modelo (retorna nome da marca e modelo)
    const modeloResponse = await fetch(
      `http://localhost:3001/api/fipe/${tipoAPI}/brands/${marcaCode}/years/${anoCode}/models`
    );
    const modeloData = await modeloResponse.json();

    const nomeModelo =
      modeloData.find((m) => m.code === modeloCode)?.name || modeloCode;

    // Consulta marca
    const marcasResponse = await fetch(
      `http://localhost:3001/api/fipe/${tipoAPI}/brands`
    );
    const marcasData = await marcasResponse.json();

    const nomeMarca =
      marcasData.find((m) => m.code === marcaCode)?.name || marcaCode;

    // Consulta ano
    const anosResponse = await fetch(
      `http://localhost:3001/api/fipe/${tipoAPI}/brands/${marcaCode}/years`
    );
    const anosData = await anosResponse.json();

    const nomeAno = anosData.find((a) => a.code === anoCode)?.name || anoCode;

    return `${nomeMarca} ${nomeModelo} ${nomeAno}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const payload = {
      lead: { leadName, leadEmail, leadPhone },
      desired,
      current,
    };

    try {
      const response = await fetch("http://localhost:3001/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao enviar os dados");

      const result = await response.json();
      console.log("Lead enviado com sucesso:", result);

      // 🔍 Após cadastrar o lead, buscar match
      try {
        const matchResponse = await fetch("http://localhost:3001/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ desired }),
        });

        const matchData = await matchResponse.json();

        if (matchData.found) {
          const carro = matchData.carro;
          const leadMatch = matchData.lead;

          const nomeCompleto = await getNomeCompletoDoCarro(
            carro.tipo || "carro",
            carro.marca,
            carro.ano,
            carro.modelo
          );

          alert(
            `✅ MATCH ENCONTRADO!\n\n🚗 Veículo: ${nomeCompleto}\n👤 Dono: ${leadMatch.nome} (${leadMatch.telefone})`
          );
        } else {
          alert(
            "Lead cadastrado com sucesso! Nenhum match encontrado no momento."
          );
        }
      } catch (error) {
        console.error("Erro ao buscar match:", error);
        alert("Lead cadastrado, mas houve erro ao buscar match.");
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      alert("Erro ao cadastrar lead.");
    }
  };

  const mapVehicleType = (tipo: string) => {
    if (tipo === "carro") return "cars";
    if (tipo === "moto") return "motorcycles";
    return "";
  };

  useEffect(() => {
    // Quando o tipo do veículo mudar, limpa os campos dependentes
    setDesiredYear("");
    setDesiredModel("");
    setYears([]);
    setModels([]);
  }, [desiredBrand]);

  useEffect(() => {
    // Quando o tipo do veículo mudar, limpa os campos dependentes
    setDesiredBrand("");
    setDesiredYear("");
    setDesiredModel("");
    setYears([]);
    setModels([]);
  }, [desiredType]);

  // UseEffect para buscar marcas da API
  useEffect(() => {
    const fetchBrands = async () => {
      const tipoAPI = mapVehicleType(desiredType);
      if (!tipoAPI) return;

      try {
        const response = await fetch(
          `http://localhost:3001/api/fipe/${tipoAPI}/brands`
        );
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
  }, [desiredType]);

  // UseEffect para buscar anos da API
  useEffect(() => {
    const fetchYears = async () => {
      const tipoAPI = mapVehicleType(desiredType);
      if (!tipoAPI) return;

      try {
        const response = await fetch(
          `http://localhost:3001/api/fipe/${tipoAPI}/brands/${desiredBrand}/years`
        );
        const data = await response.json();
        setYears(data);
      } catch (error) {
        console.error("Erro ao buscar anos:", error);
      }
      setYears;
    };

    fetchYears();
  }, [desiredType, desiredBrand]);

  // UseEffect para buscar modelos da API
  useEffect(() => {
    const tipoAPI = mapVehicleType(desiredType);
    if (!tipoAPI || !desiredBrand || !desiredYear) return;

    const fetchModels = async () => {
      const response = await fetch(
        `http://localhost:3001/api/fipe/${tipoAPI}/brands/${desiredBrand}/years/${desiredYear}/models`
      );
      const data = await response.json();
      setModels(data);
    };

    fetchModels();
  }, [desiredType, desiredBrand, desiredYear]);

  // UseEffect para buscar marcas do veículo atual
  useEffect(() => {
    const fetchCurrentBrands = async () => {
      const tipoAPI = mapVehicleType(currentType);
      if (!tipoAPI) return;

      try {
        const response = await fetch(
          `http://localhost:3001/api/fipe/${tipoAPI}/brands`
        );
        const data = await response.json();
        setBrandsCurrent(data);
      } catch (error) {
        console.error("Erro ao buscar marcas do veículo atual:", error);
        setBrandsCurrent([]);
      }
    };

    fetchCurrentBrands();
  }, [currentType]);

  // UseEffect para buscar anos do veículo atual
  useEffect(() => {
    const fetchCurrentYears = async () => {
      const tipoAPI = mapVehicleType(currentType);
      if (!tipoAPI || !currentBrand) return;

      try {
        const response = await fetch(
          `http://localhost:3001/api/fipe/${tipoAPI}/brands/${currentBrand}/years`
        );
        const data = await response.json();
        setYearsCurrent(data);
      } catch (error) {
        console.error("Erro ao buscar anos do veículo atual:", error);
        setYearsCurrent([]);
      }
    };
    fetchCurrentYears();
  }, [currentType, currentBrand]);

  // UseEffect para buscar modelos do veículo atual
  useEffect(() => {
    const tipoAPI = mapVehicleType(currentType);
    if (!tipoAPI || !currentBrand || !currentYear) return;

    const fetchCurrentModels = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/fipe/${tipoAPI}/brands/${currentBrand}/years/${currentYear}/models`
        );
        const data = await response.json();
        setModelsCurrent(data);
      } catch (error) {
        console.error("Erro ao buscar modelos do veículo atual:", error);
        setModelsCurrent([]);
      }
    };
    fetchCurrentModels();
  }, [currentType, currentBrand, currentYear]);

  return (
    <div
      className="min-h-screen bg-black bg-cover bg-center relative"
      style={{ backgroundImage: `url(${carBackground})` }}
    >
      <div
        className="imagemlogo"
        style={{ marginTop: "50px", display: "flex", justifyContent: "center" }}
      >
        <img
          src={logo}
          width="400px"
          height="10000px"
          alt="Logo MatchMotors"
          className="h-16"
        />
      </div>

      <div className="relative z-10 container mx-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
          {/* Lead Information Section */}
          <div className="bg-black/80 rounded-lg p-6 shadow-outset border border-white">
            <h2
              className="text-2xl font-bold text-white mb-6"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
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
                required
              />
              <Input
                type="tel"
                placeholder="Telefone"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Desired Vehicle Section */}
          <div className="bg-black/80 rounded-lg p-6 shadow-outset border border-white">
            <h2 className="text-2xl font-bold text-white mb-6">
              Veículo Desejado
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select value={desiredType} onValueChange={setDesiredType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo do veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                </SelectContent>
              </Select>

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

          {/* Current Vehicle Section */}
          <div className="bg-black/80 rounded-lg p-6 shadow-outset border border-white">
            <h2 className="text-2xl font-bold text-white mb-6">Tá na Mão</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select value={currentType} onValueChange={setCurrentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo do veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                </SelectContent>
              </Select>

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
