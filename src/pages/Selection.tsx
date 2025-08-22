import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import carBackground from '@/assets/car-bg.jpg';

type VehicleType = 'carro' | 'moto' | null;
type BusinessType = 'procura-se' | 'ta-na-mao' | null;
type HasTrade = 'sim' | 'nao' | null;

const Selection = () => {
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<VehicleType>(null);
  const [businessType, setBusinessType] = useState<BusinessType>(null);
  const [hasTrade, setHasTrade] = useState<HasTrade>(null);
  const navigate = useNavigate();

  const handleVehicleTypeSelection = (type: VehicleType) => {
    setVehicleType(type);
    setStep(2);
  };

  const handleBusinessTypeSelection = (type: BusinessType) => {
    setBusinessType(type);
    
    if (type === 'ta-na-mao') {
      // Ir direto para o formulário
      navigate(`/form?vehicleType=${vehicleType}&businessType=${type}`);
    } else {
      // Ir para a próxima etapa (Tem troca?)
      setStep(3);
    }
  };

  const handleTradeSelection = (trade: HasTrade) => {
    setHasTrade(trade);
    navigate(`/form?vehicleType=${vehicleType}&businessType=${businessType}&hasTrade=${trade}`);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setBusinessType(null);
    } else if (step === 3) {
      setStep(2);
      setHasTrade(null);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center relative"
      style={{ backgroundImage: `url(${carBackground})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="relative z-10 text-center max-w-md w-full mx-4">
        {step === 1 && (
          <div>
            <h1 className="text-4xl font-light text-white mb-2">
              Escolha o tipo do <span className="font-bold">veículo</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Selecione a categoria do seu interesse
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => handleVehicleTypeSelection('carro')}
                size="lg" 
                className="w-full text-lg py-6"
              >
                Carro
              </Button>
              <Button 
                onClick={() => handleVehicleTypeSelection('moto')}
                size="lg" 
                className="w-full text-lg py-6"
              >
                Moto
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-4xl font-light text-white mb-2">
              Tipo de <span className="font-bold">negociação</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              O que você pretende fazer?
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => handleBusinessTypeSelection('procura-se')}
                size="lg" 
                className="w-full text-lg py-6"
              >
                Procura-se
              </Button>
              <Button 
                onClick={() => handleBusinessTypeSelection('ta-na-mao')}
                size="lg" 
                className="w-full text-lg py-6"
              >
                Tá na mão
              </Button>
            </div>
            
            <Button 
              onClick={handleBack}
              variant="outline"
              className="mt-6"
            >
              Voltar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-4xl font-light text-white mb-2">
              Tem <span className="font-bold">troca?</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Você possui um veículo para trocar?
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => handleTradeSelection('sim')}
                size="lg" 
                className="w-full text-lg py-6"
              >
                Sim
              </Button>
              <Button 
                onClick={() => handleTradeSelection('nao')}
                size="lg" 
                className="w-full text-lg py-6"
              >
                Não
              </Button>
            </div>
            
            <Button 
              onClick={handleBack}
              variant="outline"
              className="mt-6"
            >
              Voltar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Selection;