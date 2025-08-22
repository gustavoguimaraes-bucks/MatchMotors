import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import carBackground from '@/assets/car-bg.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("logado", "true");
        // Opcional: salvar dados do usuário no localStorage
        localStorage.setItem("userData", JSON.stringify(data.user));
        navigate("/form");
      } else {
        alert(data.error || "Credenciais inválidas.");
      }
    } catch (error) {
      console.error("Erro ao tentar login:", error);
      alert("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-black bg-cover bg-center relative"
      style={{ backgroundImage: `url(${carBackground})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white mb-2">
            Seja bem vindo(a) ao <span className="font-bold">MatchMotors</span>!
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <Link to="/signup" className="text-white hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;