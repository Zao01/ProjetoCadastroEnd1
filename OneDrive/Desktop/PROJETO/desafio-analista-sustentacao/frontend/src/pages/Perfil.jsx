import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormEndereco from '../components/FormEndereco';

export default function Perfil() {
    const [usuario, setUsuario] = useState(null);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);
    const navigate = useNavigate();
    const usuarioId = localStorage.getItem('usuarioId');

    const carregarDados = async () => {
        if (!usuarioId) {
            setErro('Sessão inválida. Por favor, faça login novamente.');
            setCarregando(false);
            return;
        }

        try {
            setCarregando(true);
            const response = await api.get(`/usuarios/${usuarioId}`);
            setUsuario(response.data);
            setErro('');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 403) {
                setErro('Acesso negado. Você não tem permissão para ver estes dados.');
            } else {
                setErro('Erro ao carregar dados do usuário. Verifique se o backend está rodando.');
            }
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (!usuarioId) {
            navigate('/login');
        } else {
            carregarDados();
        }
    }, []);

    const [editandoEndereco, setEditandoEndereco] = useState(null);
    const [editCep, setEditCep] = useState('');
    const [editLogradouro, setEditLogradouro] = useState('');
    const [editBairro, setEditBairro] = useState('');
    const [editCidade, setEditCidade] = useState('');
    const [editEstado, setEditEstado] = useState('');
    const [editNumero, setEditNumero] = useState('');
    const [editComplemento, setEditComplemento] = useState('');
    const [erroEdicao, setErroEdicao] = useState('');

    const iniciarEdicao = (end) => {
        setEditandoEndereco(end);
        setEditCep(end.cep || '');
        setEditLogradouro(end.logradouro || '');
        setEditBairro(end.bairro || '');
        setEditCidade(end.cidade || '');
        setEditEstado(end.estado || '');
        setEditNumero(end.numero || '');
        setEditComplemento(end.complemento || '');
        setErroEdicao('');
    };

    const handleEditCepBlur = async () => {
        const cepLimpo = editCep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            try {
                const response = await api.get(`/enderecos/consulta-cep/${cepLimpo}`);
                setEditLogradouro(response.data.logradouro || '');
                setEditBairro(response.data.bairro || '');
                setEditCidade(response.data.localidade || '');
                setEditEstado(response.data.uf || '');
            } catch (err) {
                // Mantém valores se não achar
            }
        }
    };

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();
        setErroEdicao('');
        try {
            await api.put(`/enderecos/${editandoEndereco.id}`, {
                cep: editCep.replace(/\D/g, ''),
                logradouro: editLogradouro,
                bairro: editBairro,
                cidade: editCidade,
                estado: editEstado,
                numero: editNumero,
                complemento: editComplemento
            });
            setEditandoEndereco(null);
            carregarDados();
        } catch (err) {
            setErroEdicao(err.response?.data?.message || 'Erro ao salvar alterações no endereço.');
        }
    };

    const handleDefinirPrincipal = async (id) => {
        try {
            await api.patch(`/enderecos/${id}/principal`);
            carregarDados();
        } catch (err) {
            alert('Erro ao definir endereço principal.');
        }
    };

    const handleExcluirEndereco = async (id) => {
        if (confirm('Deseja remover este endereço?')) {
            try {
                await api.delete(`/enderecos/${id}`);
                carregarDados();
            } catch (err) {
                alert('Erro ao excluir endereço.');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (carregando) return <p style={{ padding: '20px', color: '#fff' }}>Carregando dados...</p>;

    if (erro) {
        return (
            <div className="card-container" style={{ maxWidth: '500px' }}>
                <h3 style={{ color: 'var(--danger)' }}>Atenção</h3>
                <p>{erro}</p>
                <button onClick={handleLogout} style={{ marginTop: '15px' }}>
                    Voltar para o Login
                </button>
            </div>
        );
    }

    return (
        <div className="card-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Meu Perfil</h2>
                <button onClick={handleLogout} className="btn-danger">Sair</button>
            </div>

            <div className="profile-info">
                <p><strong>Nome:</strong> {usuario?.nome}</p>
                <p><strong>CPF:</strong> {usuario?.cpf}</p>
                <p><strong>Perfil:</strong> {usuario?.role}</p>
            </div>

            <FormEndereco usuarioId={usuarioId} onEnderecoAdicionado={carregarDados} />

            <h3 style={{ marginTop: '25px' }}>Meus Endereços</h3>

            {!usuario?.enderecos || usuario.enderecos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Nenhum endereço cadastrado.</p>
            ) : (
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>CEP</th>
                                <th>Logradouro</th>
                                <th>Número</th>
                                <th>Bairro</th>
                                <th>Cidade/UF</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuario.enderecos.map((end) => (
                                <tr key={end.id}>
                                    <td>{end.cep}</td>
                                    <td>{end.logradouro}</td>
                                    <td>{end.numero}</td>
                                    <td>{end.bairro}</td>
                                    <td>{end.cidade}/{end.estado}</td>
                                    <td>
                                        {end.isPrincipal ? (
                                            <span className="badge-principal">★ Principal</span>
                                        ) : (
                                            <button onClick={() => handleDefinirPrincipal(end.id)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Tornar Principal</button>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => iniciarEdicao(end)} style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#3b82f6' }}>Editar</button>
                                            <button onClick={() => handleExcluirEndereco(end.id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Edição de Endereço */}
            {editandoEndereco && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
                }}>
                    <div style={{
                        background: '#ffffff', color: '#333', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Editar Endereço</h3>
                        {erroEdicao && <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{erroEdicao}</p>}

                        <form onSubmit={handleSalvarEdicao}>
                            <div className="form-grid">
                                <div>
                                    <label>CEP:</label>
                                    <input type="text" value={editCep} onChange={(e) => setEditCep(e.target.value)} onBlur={handleEditCepBlur} required />
                                </div>
                                <div>
                                    <label>Número:</label>
                                    <input type="text" value={editNumero} onChange={(e) => setEditNumero(e.target.value)} required />
                                </div>
                                <div>
                                    <label>Logradouro:</label>
                                    <input type="text" value={editLogradouro} onChange={(e) => setEditLogradouro(e.target.value)} />
                                </div>
                                <div>
                                    <label>Bairro:</label>
                                    <input type="text" value={editBairro} onChange={(e) => setEditBairro(e.target.value)} />
                                </div>
                                <div>
                                    <label>Cidade:</label>
                                    <input type="text" value={editCidade} onChange={(e) => setEditCidade(e.target.value)} />
                                </div>
                                <div>
                                    <label>Estado:</label>
                                    <input type="text" value={editEstado} onChange={(e) => setEditEstado(e.target.value)} />
                                </div>
                                <div className="full-width">
                                    <label>Complemento:</label>
                                    <input type="text" value={editComplemento} onChange={(e) => setEditComplemento(e.target.value)} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setEditandoEndereco(null)} style={{ background: '#64748b' }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-success">
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}