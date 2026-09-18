import { useState } from 'react';
import api from '../services/api';

export default function FormEndereco({ usuarioId, onEnderecoAdicionado }) {
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [isPrincipal, setIsPrincipal] = useState(false);
    const [mensagem, setMensagem] = useState('');

    const handleCepBlur = async () => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length === 8) {
            try {
                const response = await api.get(`/enderecos/consulta-cep/${cepLimpo}`);
                setLogradouro(response.data.logradouro || '');
                setBairro(response.data.bairro || '');
                setCidade(response.data.localidade || '');
                setEstado(response.data.uf || '');
                setMensagem('');
            } catch (err) {
                setMensagem('CEP não encontrado.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem('');

        try {
            await api.post('/enderecos', {
                cep: cep.replace(/\D/g, ''),
                logradouro,
                bairro,
                cidade,
                estado,
                numero,
                complemento,
                isPrincipal,
                usuarioId: Number(usuarioId),
                usuario: { id: Number(usuarioId) }
            });

            setMensagem('Endereço cadastrado com sucesso!');
            setCep('');
            setNumero('');
            setComplemento('');
            setLogradouro('');
            setBairro('');
            setCidade('');
            setEstado('');
            setIsPrincipal(false);

            if (onEnderecoAdicionado) onEnderecoAdicionado();
        } catch (err) {
            if (err.response) {
                // Trata erro retornado pelo Spring (ex: 400, 403, 500)
                setMensagem(`Erro (${err.response.status}): ${err.response.data?.message || err.response.data}`);
            } else {
                // Trata falha de rede/CORS
                setMensagem('Erro de conexão com o servidor. Verifique se o Backend está ativo.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ background: '#f8fafc', border: '1px solid var(--card-border)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Adicionar Novo Endereço</h3>
            {mensagem && <p style={{ color: mensagem.includes('sucesso') ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{mensagem}</p>}

            <div className="form-grid">
                <div>
                    <label>CEP:</label>
                    <input type="text" value={cep} onChange={(e) => setCep(e.target.value)} onBlur={handleCepBlur} placeholder="00000-000" required />
                </div>

                <div>
                    <label>Número:</label>
                    <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} required />
                </div>

                <div>
                    <label>Logradouro:</label>
                    <input type="text" value={logradouro} readOnly disabled />
                </div>

                <div>
                    <label>Bairro:</label>
                    <input type="text" value={bairro} readOnly disabled />
                </div>

                <div>
                    <label>Cidade:</label>
                    <input type="text" value={cidade} readOnly disabled />
                </div>

                <div>
                    <label>Estado:</label>
                    <input type="text" value={estado} readOnly disabled />
                </div>

                <div className="full-width">
                    <label>Complemento:</label>
                    <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                </div>
            </div>

            <div style={{ marginTop: '15px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={isPrincipal} onChange={(e) => setIsPrincipal(e.target.checked)} style={{ width: 'auto' }} />
                    Definir como endereço principal
                </label>
            </div>

            <button type="submit" className="btn-success" style={{ marginTop: '15px' }}>Cadastrar Endereço</button>
        </form>
    );
}