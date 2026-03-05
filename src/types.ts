export interface ExtractedData {
    page: string;
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
    "Almirante Tamandaré do Sul": ["EEEM Almirante Tamandaré", "SMEC de Almirante Tamandaré do Sul"],
    "Barra Funda": ["EEEB Antônio João Zandoná", "SMEC de Barra Funda"],
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
        "EEIEF Kame Mre Kanhrukre",
        "SMEC de Carazinho"
    ],
    "Chapada": ["EEEF Aloysio Hofer", "EEEF Israelina Martins Silveira", "IEE Júlia Billiart", "SMEC de Chapada"],
    "Colorado": ["EEEM Armindo Edwino Schwengber", "SMEC de Colorado"],
    "Constantina": ["EEEF Medeiros e Albuquerque", "EEEM São José", "EEIEF Tanhve Kregso", "SMEC de Constantina"],
    "Coqueiros do Sul": ["EEEB José Gomes Portinho", "SMEC de Coqueiros do Sul"],
    "Engenho Velho": ["EEEM Floriano Peixoto", "SMEC de Engenho Velho"],
    "Não-Me-Toque": ["IEE São Francisco Solano", "EEEF Geny Vieira da Cunha", "SMEC de Não-Me-Toque"],
    "Nova Boa Vista": ["EEEM Antonio Mathias Anschau", "SMEC de Nova Boa Vista"],
    "Novo Xingu": ["EEEM Gottfried Thomas Westerich", "SMEC de Novo Xingu"],
    "Ronda Alta": ["EEEB Professor Alfredo Gavioli", "EEEF Herculino Baldissarella", "EEEF Isabel de Orleans", "EEIEF Luiz Kónhko", "SMEC de Ronda Alta"],
    "Rondinha": ["EEEB Conde D'Eu", "SMEC de Rondinha"],
    "Saldanha Marinho": ["EEEB Alfredo Ferrari", "SMEC de Saldanha Marinho"],
    "Santa Bárbara do Sul": ["CE Blau Nunes", "EEEF 19 de Novembro", "SMEC de Santa Bárbara do Sul"],
    "Santo Antônio do Planalto": ["EEEM Santo Antônio", "SMEC de Santo Antônio do Planalto"],
    "Sarandi": [
        "EEEB Dr. José Maria de Castro",
        "EEEF Dom José Coutinho",
        "EEEF Dr João Carlos Machado",
        "EEEM Pe. Manoel Gonzales",
        "EEEF Sepé Tiaraju",
        "EEEM Dr Aldo Conte",
        "SMEC de Sarandi"
    ],
    "Tio Hugo": ["EEEM de Tio Hugo", "SMEC de Tio Hugo"],
    "Três Palmeiras": ["EEEM José Antônio Ferronato", "SMEC de Três Palmeiras"],
    "Trindade do Sul": ["EEEF Antônio Mânica", "EEEM Zenir Ghizzi da Silva", "SMEC de Trindade do Sul"],
    "Victor Graeff": ["JOMAC", "SMEC de Victor Graeff"]
};
