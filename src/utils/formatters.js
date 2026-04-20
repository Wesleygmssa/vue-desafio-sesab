/* =========================
   FORMATADORES
========================= */

export function formatCPF(cpf) {
  if (!cpf) return '-';

  cpf = cpf.replace(/\D/g, '');

  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 *
 * @param {*} address
 * @returns
 */
export function formatEndereco(address) {
  if (!address) return 'Não informado';

  return `${address.logradouro || 'Sem logradouro'} 
  - CEP: ${address.cep || 'Sem CEP'}`;
}
