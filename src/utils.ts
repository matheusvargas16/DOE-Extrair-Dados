import type { ExtractedData } from './types';

export const exportToCSV = (data: ExtractedData[], filename: string) => {
    const headers = ['Pagina', 'Nome', 'ID Funcional', 'Lotacao', 'Assunto', 'Contexto'];
    const rows = data.map(item => [
        item.page,
        item.name,
        item.id,
        item.lotacao,
        item.subject,
        item.context
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
