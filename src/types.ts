export interface ExtractedData {
    page: number;
    subject: string;
    name: string;
    id: string;
    processo?: string; // New field to store Processo separately
    lotacao: string;
    context: string;
    originalText: string;
    selected?: boolean;
}

export interface ReadingProgress {
    currentPage: number;
    totalPages: number;
    status: 'idle' | 'fetching' | 'reading' | 'ready' | 'extracting' | 'done' | 'error';
    error?: string;
}

export interface NoticeConfig {
    number: string;
    year: string;
    city: string;
    school: string;
    date: string;
}

export const DEFAULT_TRIGGERS = [
    "SEDUC -- 39 Coordenadoria Regional de Educação",
    "SEDUC - 39 Coordenadoria Regional de Educação",
    "SEDUC -- 39 CRE",
    "SEDUC - 39 CRE",
    "Secretaria da Educação -- 39 Coordenadoria Regional de Educação",
    "Secretaria da Educação - 39 Coordenadoria Regional de Educação",
    "39ª Coordenadoria Regional de Educação",
    "39a Coordenadoria Regional de Educação",
    "39 Coordenadoria Regional de Educação",
    "39ª CRE",
    "39a CRE",
    "39 CRE",
    "39ª C.R.E.",
    "39a C.R.E.",
    "39 C.R.E.",
    "Coordenadoria de Educação - 39",
    "Coordenadoria de Educação -- 39"
];

export const SCHOOLS_BY_CITY: Record<string, string[]> = {
    "Almirante Tamandaré do Sul": ["EEEM Almirante Tamandaré"],
    "Barra Funda": ["EEEB Antônio João Zandoná"],
    "Carazinho": [
        "EEEB Érico Veríssimo",
        "EEEF Carlinda de Britto",
        "EEEF Dr. Alfredo D'amore",
        "EEEF Manuel Arruda Câmara",
        "EEEF Princesa Isabel",
        "EEEF Rodolfo Bolzani",
        "EEEF São Bento",
        "EEEM Cônego João Batista Sorg",
        "EEEM Ernesta Nunes",
        "EEEM Marquês de Caravelas",
        "EEEM Paulo Frontin",
        "EEEM Veiga Cabral",
        "EEPROCAR",
        "IEE Cruzeiro do Sul",
        "NEEJA Felipe Roberto Sehn",
        "EEIEF Kame Mre Kanhrukre"
    ],
    "Chapada": ["EEEF Aloysio Hofer", "EEEF Israelina Martins Silveira", "IEE Júlia Billiart"],
    "Colorado": ["EEEM Armindo Edwino Schwengber"],
    "Constantina": ["EEEF Medeiros e Albuquerque", "EEEM São José", "EEIEF Tanhve Kregso"],
    "Coqueiros do Sul": ["EEEB José Gomes Portinho"],
    "Engenho Velho": ["EEEM Floriano Peixoto"],
    "Não-Me-Toque": ["IEE São Francisco Solano", "EEEF Geny Vieira da Cunha"],
    "Nova Boa Vista": ["EEEM Antonio Mathias Anschau"],
    "Novo Xingu": ["EEEM Gottfried Thomas Westerich"],
    "Ronda Alta": ["EEEB Professor Alfredo Gavioli", "EEEF Herculino Baldissarella", "EEEF Isabel de Orleans", "EEIEF Luiz Kónhko"],
    "Rondinha": ["EEEB Conde D'Eu"],
    "Saldanha Marinho": ["EEEB Alfredo Ferrari"],
    "Santa Bárbara do Sul": ["CE Blau Nunes", "EEEF 19 de Novembro"],
    "Santo Antônio do Planalto": ["EEEM Santo Antônio"],
    "Sarandi": [
        "EEEB Dr. José Maria de Castro",
        "EEEF Dom José Coutinho",
        "EEEF Dr João Carlos Machado",
        "EEEF Pe. Manoel Gonzales",
        "EEEF Sepé Tiaraju",
        "EEEM Dr Aldo Conte"
    ],
    "Tio Hugo": ["EEEM de Tio Hugo"],
    "Três Palmeiras": ["EEEM José Antônio Ferronato"],
    "Trindade do Sul": ["EEEF Antônio Mânica", "EEEM Zenir Ghizzi da Silva"]
};
