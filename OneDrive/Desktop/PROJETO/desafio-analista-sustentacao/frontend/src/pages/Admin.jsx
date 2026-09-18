import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Admin() {
    const [abaAtiva, setAbaAtiva] = useState('usuarios'); // 'usuarios' | 'enderecos'
    const [usuarios, setUsuarios] = useState([]);
    const [enderecos, setEnderecos] = useState([]);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    // Usuário com endereços expandidos na tabela de usuários
    const [usuarioExpandidoId, setUsuarioExpandidoId] = useState(null);
    // Filtro por usuário na aba de todos os endereços
    const [filtroUsuarioId, setFiltroUsuarioId] = useState('todos');

    // Campos do formulário de usuário
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [senha, setSenha] = useState('');
    const [role, setRole] = useState('ROLE_USUARIO');

    // Campos do formulário de cadastro de endereço
    const [endUsuarioId, setEndUsuarioId] = useState('');
    const [endCep, setEndCep] = useState('');
    const [endLogradouro, setEndLogradouro] = useState('');
    const [endBairro, setEndBairro] = useState('');
    const [endCidade, setEndCidade] = useState('');
    const [endEstado, setEndEstado] = useState('');
    const [endNumero, setEndNumero] = useState('');
    const [endComplemento, setEndComplemento] = useState('');
    const [endIsPrincipal, setEndIsPrincipal] = useState(false);

    // Estado para edição de endereço
    const [editandoEndereco, setEditandoEndereco] = useState(null);
    const [editCep, setEditCep] = useState('');
    const [editLogradouro, setEditLogradouro] = useState('');
    const [editBairro, setEditBairro] = useState('');
    const [editCidade, setEditCidade] = useState('');
    const [editEstado, setEditEstado] = useState('');
    const [editNumero, setEditNumero] = useState('');
    const [editComplemento, setEditComplemento] = useState('');

    const navigate = useNavigate();

    const carregarUsuarios = async () => {
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data);
            if (response.data.length > 0 && !endUsuarioId) {
                setEndUsuarioId(response.data[0].id);
            }
        } catch (err) {
            setErro('Acesso negado ou erro ao carregar lista de usuários.');
        }
    };

    const carregarEnderecos = async () => {
        try {
            const response = await api.get('/enderecos');
            setEnderecos(response.data);
        } catch (err) {
            setErro('Acesso negado ou erro ao carregar endereços.');
        }
    };

    useEffect(() => {
        const userRole = localStorage.getItem('role');
        if (userRole !== 'ROLE_ADMIN') {
            navigate('/login');
        } else {
            carregarUsuarios();
            carregarEnderecos();
        }
    }, []);

    const handleCriarUsuarioAdmin = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        const dataFormatada = dataNascimento ? new Date(dataNascimento).toISOString().split('T')[0] : null;

        try {
            const response = await api.post('/usuarios', {
                nome,
                cpf: cpf.replace(/\D/g, ''),
                dataNascimento: dataFormatada,
                senha,
                role
            });

            setSucesso('Novo usuário cadastrado com sucesso!');
            setNome('');
            setCpf('');
            setDataNascimento('');
            setSenha('');
            setRole('ROLE_USUARIO');

            await carregarUsuarios();
        } catch (err) {
            setErro(err.response?.data?.message || err.response?.data || 'Erro ao cadastrar usuário.');
        }
    };

    const handleExcluirUsuario = async (u) => {
        const loggedId = Number(localStorage.getItem('usuarioId'));
        if (Number(u.id) === loggedId) {
            alert('Você não pode excluir o seu próprio usuário logado.');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir o usuário "${u.nome}" (ID #${u.id})?\nTodos os seus endereços vinculados também serão excluídos!`)) {
            setErro('');
            setSucesso('');
            try {
                await api.delete(`/usuarios/${u.id}`);
                setSucesso(`Usuário "${u.nome}" excluído com sucesso!`);
                await carregarUsuarios();
                await carregarEnderecos();
                if (usuarioExpandidoId === u.id) {
                    setUsuarioExpandidoId(null);
                }
            } catch (err) {
                setErro(err.response?.data?.message || 'Erro ao excluir usuário.');
            }
        }
    };

    const handleCepBlurNovo = async () => {
        const cepLimpo = endCep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            try {
                const response = await api.get(`/enderecos/consulta-cep/${cepLimpo}`);
                setEndLogradouro(response.data.logradouro || '');
                setEndBairro(response.data.bairro || '');
                setEndCidade(response.data.localidade || '');
                setEndEstado(response.data.uf || '');
            } catch (err) {
                // Mantém preenchimento manual
            }
        }
    };

    const handleCriarEnderecoAdmin = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        try {
            await api.post('/enderecos', {
                cep: endCep.replace(/\D/g, ''),
                logradouro: endLogradouro,
                bairro: endBairro,
                cidade: endCidade,
                estado: endEstado,
                numero: endNumero,
                complemento: endComplemento,
                isPrincipal: endIsPrincipal,
                usuarioId: Number(endUsuarioId),
                usuario: { id: Number(endUsuarioId) }
            });

            setSucesso('Endereço cadastrado com sucesso!');
            setEndCep('');
            setEndLogradouro('');
            setEndBairro('');
            setEndCidade('');
            setEndEstado('');
            setEndNumero('');
            setEndComplemento('');
            setEndIsPrincipal(false);

            await carregarEnderecos();
            await carregarUsuarios();
        } catch (err) {
            setErro(err.response?.data?.message || 'Erro ao cadastrar endereço.');
        }
    };

    const iniciarEdicao = (end) => {
        setEditandoEndereco(end);
        setEditCep(end.cep || '');
        setEditLogradouro(end.logradouro || '');
        setEditBairro(end.bairro || '');
        setEditCidade(end.cidade || '');
        setEditEstado(end.estado || '');
        setEditNumero(end.numero || '');
        setEditComplemento(end.complemento || '');
    };

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();
        setErro('');
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
            setSucesso('Endereço atualizado com sucesso!');
            await carregarEnderecos();
            await carregarUsuarios();
        } catch (err) {
            setErro(err.response?.data?.message || 'Erro ao atualizar endereço.');
        }
    };

    const handleDefinirPrincipal = async (id) => {
        try {
            await api.patch(`/enderecos/${id}/principal`);
            setSucesso('Endereço definido como Principal!');
            await carregarEnderecos();
            await carregarUsuarios();
        } catch (err) {
            setErro('Erro ao definir como principal.');
        }
    };

    const handleExcluirEndereco = async (id) => {
        if (confirm('Deseja excluir este endereço?')) {
            setErro('');
            setSucesso('');
            try {
                await api.delete(`/enderecos/${id}`);
                setSucesso('Endereço excluído com sucesso!');
                await carregarEnderecos();
                await carregarUsuarios();
            } catch (err) {
                setErro(err.response?.data?.message || 'Erro ao excluir endereço.');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Endereços filtrados na aba geral
    const enderecosFiltrados = filtroUsuarioId === 'todos'
        ? enderecos
        : enderecos.filter(e => (e.usuario?.id || e.usuarioId) === Number(filtroUsuarioId));

    return (
        <div className="card-container" style={{ maxWidth: '1100px' }}>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Painel do Administrador</h2>
                <button onClick={handleLogout} className="btn-danger">Sair</button>
            </div>

            {/* Navegação por Abas */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => { setAbaAtiva('usuarios'); setErro(''); setSucesso(''); }}
                    style={{
                        padding: '10px 20px',
                        background: abaAtiva === 'usuarios' ? 'var(--primary)' : '#475569',
                        fontWeight: abaAtiva === 'usuarios' ? 'bold' : 'normal',
                        fontSize: '0.95rem'
                    }}>
                    👥 Usuários Cadastrados ({usuarios.length})
                </button>
                <button
                    onClick={() => { setAbaAtiva('enderecos'); setErro(''); setSucesso(''); }}
                    style={{
                        padding: '10px 20px',
                        background: abaAtiva === 'enderecos' ? 'var(--primary)' : '#475569',
                        fontWeight: abaAtiva === 'enderecos' ? 'bold' : 'normal',
                        fontSize: '0.95rem'
                    }}>
                    📍 Todos os Endereços ({enderecos.length})
                </button>
            </div>

            {erro && <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{erro}</p>}
            {sucesso && <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>{sucesso}</p>}

            {/* ABA USUÁRIOS */}
            {abaAtiva === 'usuarios' && (
                <>
                    <div className="admin-form-container" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid var(--card-border)', marginBottom: '25px' }}>
                        <h3 style={{ marginTop: 0 }}>Cadastrar Novo Usuário</h3>
                        <form onSubmit={handleCriarUsuarioAdmin}>
                            <div className="form-grid">
                                <div>
                                    <label>Nome Completo:</label>
                                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
                                </div>

                                <div>
                                    <label>CPF:</label>
                                    <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="Apenas números" required />
                                </div>

                                <div>
                                    <label>Data de Nascimento:</label>
                                    <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required />
                                </div>

                                <div>
                                    <label>Senha:</label>
                                    <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                                </div>

                                <div className="full-width">
                                    <label>Perfil (Permissão):</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="ROLE_USUARIO">Usuário Comum</option>
                                        <option value="ROLE_ADMIN">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-success" style={{ marginTop: '16px' }}>
                                Cadastrar Usuário
                            </button>
                        </form>
                    </div>

                    <h3>Usuários do Sistema</h3>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Perfil</th>
                                    <th>Qtd Endereços</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u) => {
                                    const enderecosDoUsuario = enderecos.filter(end => (end.usuario?.id || end.usuarioId) === u.id);
                                    const estaExpandido = usuarioExpandidoId === u.id;

                                    return (
                                        <>
                                            <tr key={u.id} style={{ background: estaExpandido ? '#f1f5f9' : 'transparent' }}>
                                                <td>#{u.id}</td>
                                                <td><strong>{u.nome}</strong></td>
                                                <td>{u.cpf}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                        background: u.role === 'ROLE_ADMIN' ? '#e0e7ff' : '#f3f4f6',
                                                        color: u.role === 'ROLE_ADMIN' ? '#3730a3' : '#374151',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {u.role === 'ROLE_ADMIN' ? 'Administrador' : 'Usuário Comum'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => setUsuarioExpandidoId(estaExpandido ? null : u.id)}
                                                        style={{ padding: '4px 10px', fontSize: '0.8rem', background: estaExpandido ? '#0284c7' : '#0ea5e9' }}>
                                                        📍 {enderecosDoUsuario.length} Endereço(s) {estaExpandido ? '▲' : '▼'}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleExcluirUsuario(u)}
                                                        className="btn-danger"
                                                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                                        title="Excluir Usuário e seus endereços">
                                                        🗑️ Excluir Usuário
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* LINHA EXPANSÍVEL: ENDEREÇOS DESTE USUÁRIO */}
                                            {estaExpandido && (
                                                <tr key={`expand-${u.id}`}>
                                                    <td colSpan="6" style={{ background: '#f8fafc', padding: '16px', borderLeft: '4px solid #0ea5e9' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                            <h4 style={{ margin: 0, color: '#0369a1' }}>
                                                                📍 Endereços de {u.nome} ({enderecosDoUsuario.length})
                                                            </h4>
                                                            <button
                                                                onClick={() => {
                                                                    setEndUsuarioId(u.id);
                                                                    setAbaAtiva('enderecos');
                                                                }}
                                                                className="btn-success"
                                                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                                                                + Adicionar Endereço para {u.nome}
                                                            </button>
                                                        </div>

                                                        {enderecosDoUsuario.length === 0 ? (
                                                            <p style={{ margin: 0, color: '#64748b' }}>Este usuário ainda não possui nenhum endereço cadastrado.</p>
                                                        ) : (
                                                            <table style={{ width: '100%', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                                <thead>
                                                                    <tr style={{ background: '#f1f5f9' }}>
                                                                        <th>ID</th>
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
                                                                    {enderecosDoUsuario.map(end => (
                                                                        <tr key={end.id}>
                                                                            <td>#{end.id}</td>
                                                                            <td>{end.cep}</td>
                                                                            <td>{end.logradouro}</td>
                                                                            <td>{end.numero}</td>
                                                                            <td>{end.bairro}</td>
                                                                            <td>{end.cidade}/{end.estado}</td>
                                                                            <td>
                                                                                {end.isPrincipal ? (
                                                                                    <span className="badge-principal">★ Principal</span>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => handleDefinirPrincipal(end.id)}
                                                                                        style={{ padding: '3px 6px', fontSize: '0.75rem' }}>
                                                                                        Tornar Principal
                                                                                    </button>
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                                                    <button
                                                                                        onClick={() => iniciarEdicao(end)}
                                                                                        style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#3b82f6' }}>
                                                                                        Editar
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleExcluirEndereco(end.id)}
                                                                                        className="btn-danger"
                                                                                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                                                                                        Excluir Endereço
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ABA ENDEREÇOS */}
            {abaAtiva === 'enderecos' && (
                <>
                    <div className="admin-form-container" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid var(--card-border)', marginBottom: '25px' }}>
                        <h3 style={{ marginTop: 0 }}>Cadastrar Endereço para Usuário</h3>
                        <form onSubmit={handleCriarEnderecoAdmin}>
                            <div className="form-grid">
                                <div className="full-width">
                                    <label>Selecione o Usuário:</label>
                                    <select value={endUsuarioId} onChange={(e) => setEndUsuarioId(e.target.value)} required>
                                        {usuarios.map(u => (
                                            <option key={u.id} value={u.id}>
                                                #{u.id} - {u.nome} (CPF: {u.cpf})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>CEP:</label>
                                    <input type="text" value={endCep} onChange={(e) => setEndCep(e.target.value)} onBlur={handleCepBlurNovo} placeholder="00000-000" required />
                                </div>

                                <div>
                                    <label>Número:</label>
                                    <input type="text" value={endNumero} onChange={(e) => setEndNumero(e.target.value)} required />
                                </div>

                                <div>
                                    <label>Logradouro:</label>
                                    <input type="text" value={endLogradouro} onChange={(e) => setEndLogradouro(e.target.value)} />
                                </div>

                                <div>
                                    <label>Bairro:</label>
                                    <input type="text" value={endBairro} onChange={(e) => setEndBairro(e.target.value)} />
                                </div>

                                <div>
                                    <label>Cidade:</label>
                                    <input type="text" value={endCidade} onChange={(e) => setEndCidade(e.target.value)} />
                                </div>

                                <div>
                                    <label>Estado:</label>
                                    <input type="text" value={endEstado} onChange={(e) => setEndEstado(e.target.value)} />
                                </div>

                                <div className="full-width">
                                    <label>Complemento:</label>
                                    <input type="text" value={endComplemento} onChange={(e) => setEndComplemento(e.target.value)} />
                                </div>
                            </div>

                            <div style={{ marginTop: '12px' }}>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="checkbox" checked={endIsPrincipal} onChange={(e) => setEndIsPrincipal(e.target.checked)} style={{ width: 'auto' }} />
                                    Definir como Principal
                                </label>
                            </div>

                            <button type="submit" className="btn-success" style={{ marginTop: '16px' }}>
                                Cadastrar Endereço
                            </button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>Todos os Endereços Cadastrados</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ margin: 0, fontWeight: 'bold' }}>Filtrar por Usuário:</label>
                            <select
                                value={filtroUsuarioId}
                                onChange={(e) => setFiltroUsuarioId(e.target.value)}
                                style={{ padding: '6px 10px', borderRadius: '4px' }}>
                                <option value="todos">Todos os Usuários ({enderecos.length})</option>
                                {usuarios.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.nome} (#{u.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuário</th>
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
                                {enderecosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Nenhum endereço encontrado.</td>
                                    </tr>
                                ) : (
                                    enderecosFiltrados.map((end) => (
                                        <tr key={end.id}>
                                            <td>#{end.id}</td>
                                            <td><strong>{end.usuario?.nome || `#${end.usuarioId || '-'}`}</strong></td>
                                            <td>{end.cep}</td>
                                            <td>{end.logradouro}</td>
                                            <td>{end.numero}</td>
                                            <td>{end.bairro}</td>
                                            <td>{end.cidade}/{end.estado}</td>
                                            <td>
                                                {end.isPrincipal ? (
                                                    <span className="badge-principal">★ Principal</span>
                                                ) : (
                                                    <button onClick={() => handleDefinirPrincipal(end.id)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                                                        Tornar Principal
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => iniciarEdicao(end)} style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#3b82f6' }}>
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleExcluirEndereco(end.id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                                                        Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Modal de Edição para Admin */}
            {editandoEndereco && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
                }}>
                    <div style={{
                        background: '#ffffff', color: '#333', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '90%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Editar Endereço #{editandoEndereco.id}</h3>
                        <form onSubmit={handleSalvarEdicao}>
                            <div className="form-grid">
                                <div>
                                    <label>CEP:</label>
                                    <input type="text" value={editCep} onChange={(e) => setEditCep(e.target.value)} required />
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