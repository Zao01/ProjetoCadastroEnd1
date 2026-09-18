import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Cadastro() {
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    // COLE O CÓDIGO DA FUNÇÃO AQUI:
    const handleCadastro = async (e) => {
        e.preventDefault();
        setMensagem('');
        setErro('');

        // Garante que a data está no formato YYYY-MM-DD exigido pelo Spring Boot
        const dataFormatada = dataNascimento ? new Date(dataNascimento).toISOString().split('T')[0] : null;

        try {
            await api.post('/usuarios', {
                nome,
                cpf: cpf.replace(/\D/g, ''), // Envia apenas os números do CPF
                dataNascimento: dataFormatada,
                senha,
                role: 'ROLE_USUARIO'
            });

            setMensagem('Usuário cadastrado com sucesso! Redirecionando para o login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data) {
                setErro(typeof err.response.data === 'string' ? err.response.data : 'Erro ao cadastrar usuário. Verifique os dados.');
            } else {
                setErro('Erro de conexão com o servidor. Verifique se o Backend está rodando.');
            }
        }
    };

    return (
        <div style={{ maxWidth: '450px', margin: '40px auto', padding: '25px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Cadastro de Usuário</h2>
            {mensagem && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensagem}</p>}
            {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}

            <form onSubmit={handleCadastro}>
                <div style={{ marginBottom: '12px' }}>
                    <label>Nome Completo:</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label>CPF:</label>
                    <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="Apenas números ou formato padrão"
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label>Data de Nascimento:</label>
                    <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '18px' }}>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                        required
                    />
                </div>

                <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Cadastrar
                </button>
            </form>

            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Já possui conta? <Link to="/login">Faça Login</Link>
            </p>
        </div>
    );
}