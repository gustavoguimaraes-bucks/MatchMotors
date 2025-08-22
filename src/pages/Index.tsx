import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import carBackground from "@/assets/car-bg.jpg";

const Index = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center relative"
      style={{ backgroundImage: `url(${carBackground})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      <div className="relative z-10 text-center">
        <h1 id="matchMotors" className="text-5xl font-light text-white mb-8">
          Bem-vindo ao <div className="font-bold">MatchMotors!</div>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Encontre o carro dos seus sonhos ou venda o seu
        </p>

        <div className="space-x-4">
          <Link to="/login">
            <Button size="lg" className="px-8">
              Login
            </Button>
          </Link>
          {/* <Link to="/signup">
            <Button size="lg" className="px-8">
              Cadastro
            </Button>
          </Link> */}
          <Link to="/form">
            <Button size="lg" className="px-8">
              Formulário
            </Button>
          </Link>
          <Link to="/history">
            <Button size="lg" className="px-8">
              Histórico
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
