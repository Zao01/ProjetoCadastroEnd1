import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        try {
            const response = await api.post('/auth/login', { cpf, senha });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('usuarioId', response.data.usuarioId);
            localStorage.setItem('nome', response.data.nome);

            if (response.data.role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/perfil');
            }
        } catch (err) {
            setErro('CPF ou senha inválidos.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Login - Sistema de Endereços</h2>
            {erro && <p style={{ color: 'red' }}>{erro}</p>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <label>CPF:</label>
                    <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                        required
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Entrar
                </button>
            </form>

            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Não tem uma conta? <Link to="/cadastro">Cadastre-se aqui</Link>
            </p>
        </div>
    );
}