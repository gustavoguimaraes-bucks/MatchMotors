import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import carBackground from '@/assets/car-bg.jpg';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Combinar nome e sobrenome
    const nome = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          nome, 
          email: email.trim(), 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Usuário cadastrado com sucesso!");
        // Opcional: fazer login automático após o cadastro
        localStorage.setItem("logado", "true");
        navigate("/form");
      } else {
        // Tratar diferentes tipos de erro
        if (response.status === 409) {
          alert("Este email já está cadastrado. Tente fazer login.");
        } else {
          alert(data.error || "Erro ao cadastrar usuário.");
        }
      }
    } catch (error) {
      console.error("Erro ao tentar cadastrar:", error);
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
              type="text"
              placeholder="Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Input
              type="text"
              placeholder="Sobrenome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

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
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-white hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;