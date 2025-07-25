import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import carBackground from '@/assets/car-bg.jpg';

const Form = () => {
  // Lead Information
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');

  // Desired Vehicle
  const [desiredType, setDesiredType] = useState('');
  const [desiredBrand, setDesiredBrand] = useState('');
  const [desiredYear, setDesiredYear] = useState('');
  const [desiredModel, setDesiredModel] = useState('');
  const [desiredColor, setDesiredColor] = useState('');
  const [desiredBody, setDesiredBody] = useState('');
  const [desiredCondition, setDesiredCondition] = useState('');
  const [desiredArmor, setDesiredArmor] = useState('');
  const [desiredKmMin, setDesiredKmMin] = useState('');
  const [desiredKmMax, setDesiredKmMax] = useState('');
  const [desiredPriceMin, setDesiredPriceMin] = useState('');
  const [desiredPriceMax, setDesiredPriceMax] = useState('');
  const [desiredObservations, setDesiredObservations] = useState('');

  // Current Vehicle (Tá na mão)
  const [currentType, setCurrentType] = useState('');
  const [currentBrand, setCurrentBrand] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [currentBody, setCurrentBody] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');
  const [currentArmor, setCurrentArmor] = useState('');
  const [currentKm, setCurrentKm] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currentObservations, setCurrentObservations] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', {
      lead: { leadName, leadEmail, leadPhone },
      desired: {
        desiredType, desiredBrand, desiredYear, desiredModel, desiredColor, 
        desiredBody, desiredCondition, desiredArmor, desiredKmMin, desiredKmMax,
        desiredPriceMin, desiredPriceMax, desiredObservations
      },
      current: {
        currentType, currentBrand, currentYear, currentModel, currentColor,
        currentBody, currentCondition, currentArmor, currentKm, currentPrice, currentObservations
      }
    });
  };

  return (
    <div 
      className="min-h-screen bg-black bg-cover bg-center relative"
      style={{ backgroundImage: `url(${carBackground})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="relative z-10 container mx-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
          
          {/* Lead Information Section */}
          <div className="bg-black/80 rounded-lg p-6 shadow-outset border border-white">
            <h2 className="text-2xl font-bold text-white mb-6">Informações do Lead</h2>
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
            <h2 className="text-2xl font-bold text-white mb-6">Veículo Desejado</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select value={desiredType} onValueChange={setDesiredType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo do veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                </SelectContent>
              </Select>

              <Select value={desiredBrand} onValueChange={setDesiredBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="honda">Honda</SelectItem>
                  <SelectItem value="ford">Ford</SelectItem>
                  <SelectItem value="chevrolet">Chevrolet</SelectItem>
                  <SelectItem value="volkswagen">Volkswagen</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Ano"
                value={desiredYear}
                onChange={(e) => setDesiredYear(e.target.value)}
              />

              <Input
                placeholder="Modelo"
                value={desiredModel}
                onChange={(e) => setDesiredModel(e.target.value)}
              />

              <Select value={desiredColor} onValueChange={setDesiredColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branco">Branco</SelectItem>
                  <SelectItem value="preto">Preto</SelectItem>
                  <SelectItem value="prata">Prata</SelectItem>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="vermelho">Vermelho</SelectItem>
                </SelectContent>
              </Select>

              <Select value={desiredBody} onValueChange={setDesiredBody}>
                <SelectTrigger>
                  <SelectValue placeholder="Carroceria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="hatch">Hatch</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="coupe">Coupe</SelectItem>
                </SelectContent>
              </Select>

              <Select value={desiredCondition} onValueChange={setDesiredCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Novo ou Usado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={desiredArmor} onValueChange={setDesiredArmor}>
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
                  <SelectItem value="caminhao">Caminhão</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentBrand} onValueChange={setCurrentBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="honda">Honda</SelectItem>
                  <SelectItem value="ford">Ford</SelectItem>
                  <SelectItem value="chevrolet">Chevrolet</SelectItem>
                  <SelectItem value="volkswagen">Volkswagen</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Ano"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
              />

              <Input
                placeholder="Modelo"
                value={currentModel}
                onChange={(e) => setCurrentModel(e.target.value)}
              />

              <Select value={currentColor} onValueChange={setCurrentColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branco">Branco</SelectItem>
                  <SelectItem value="preto">Preto</SelectItem>
                  <SelectItem value="prata">Prata</SelectItem>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="vermelho">Vermelho</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentBody} onValueChange={setCurrentBody}>
                <SelectTrigger>
                  <SelectValue placeholder="Carroceria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="hatch">Hatch</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="coupe">Coupe</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentCondition} onValueChange={setCurrentCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Novo ou Usado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentArmor} onValueChange={setCurrentArmor}>
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
            <Button type="submit" size="lg" className="px-12">
              Enviar Formulário
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Form;