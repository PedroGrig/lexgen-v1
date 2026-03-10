export interface FieldSchema {
    id: string;
    label: string;
    type: "text" | "textarea" | "date" | "number" | "select" | "currency";
    placeholder?: string;
    required: boolean;
    options?: string[];
    section?: string;
}

export interface DocumentSchema {
    label: string;
    icon: string;
    fields: FieldSchema[];
}

// Campos reutilizáveis
const camposAdvogado: FieldSchema[] = [
    { id: "advogado_nome", label: "Nome do Advogado", type: "text", required: true, section: "Advogado" },
    { id: "advogado_oab", label: "OAB do Advogado", type: "text", required: true, section: "Advogado" },
];

const camposReclamante: FieldSchema[] = [
    { id: "reclamante_nome", label: "Nome completo do Reclamante", type: "text", required: true, section: "Dados do Reclamante" },
    { id: "reclamante_cpf", label: "CPF do Reclamante", type: "text", required: true, section: "Dados do Reclamante" },
    { id: "reclamante_rg", label: "RG do Reclamante", type: "text", required: false, section: "Dados do Reclamante" },
    { id: "reclamante_endereco", label: "Endereço completo do Reclamante", type: "text", required: true, section: "Dados do Reclamante" },
    { id: "reclamante_estado_civil", label: "Estado Civil", type: "select", options: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União estável"], required: true, section: "Dados do Reclamante" },
    { id: "reclamante_profissao", label: "Profissão / Cargo ocupado", type: "text", required: true, section: "Dados do Reclamante" },
];

const camposReclamado: FieldSchema[] = [
    { id: "reclamado_razao_social", label: "Razão Social do Reclamado (Empresa)", type: "text", required: true, section: "Dados do Reclamado" },
    { id: "reclamado_cnpj", label: "CNPJ do Reclamado", type: "text", required: true, section: "Dados do Reclamado" },
    { id: "reclamado_endereco", label: "Endereço do Reclamado", type: "text", required: true, section: "Dados do Reclamado" },
];

const camposContrato: FieldSchema[] = [
    { id: "data_admissao", label: "Data de Admissão", type: "date", required: true, section: "Contrato de Trabalho" },
    { id: "data_demissao", label: "Data de Demissão / Rescisão", type: "date", required: true, section: "Contrato de Trabalho" },
    { id: "motivo_rescisao", label: "Motivo da Rescisão", type: "select", options: ["Dispensa sem justa causa", "Dispensa por justa causa", "Pedido de demissão", "Rescisão indireta", "Rescisão por acordo mútuo (art. 484-A CLT)", "Término de contrato por prazo determinado"], required: true, section: "Contrato de Trabalho" },
    { id: "salario", label: "Último salário (R$)", type: "currency", required: true, section: "Contrato de Trabalho" },
    { id: "jornada_contratual", label: "Jornada contratual (ex: 44h semanais)", type: "text", required: true, section: "Contrato de Trabalho" },
    { id: "jornada_real", label: "Jornada real praticada", type: "textarea", required: true, section: "Contrato de Trabalho" },
];

const camposVerbas: FieldSchema[] = [
    { id: "verbas_rescisorias", label: "Verbas rescisórias não pagas", type: "textarea", required: false, section: "Verbas Pleiteadas" },
    { id: "horas_extras", label: "Horas extras pleiteadas", type: "textarea", required: false, section: "Verbas Pleiteadas" },
    { id: "adicional_insalubridade", label: "Adicional de insalubridade / periculosidade?", type: "select", options: ["Não", "Insalubridade", "Periculosidade"], required: false, section: "Verbas Pleiteadas" },
    { id: "fgts", label: "FGTS não depositado?", type: "select", options: ["Não", "Sim, parcialmente", "Sim, integralmente"], required: false, section: "Verbas Pleiteadas" },
    { id: "outras_verbas", label: "Outras verbas pleiteadas", type: "textarea", required: false, section: "Verbas Pleiteadas" },
];

const camposProcesso: FieldSchema[] = [
    { id: "numero_processo", label: "Número do Processo", type: "text", required: true, section: "Dados do Processo" },
    { id: "vara_trabalho", label: "Vara do Trabalho / Comarca", type: "text", required: true, section: "Dados do Processo" },
];

export const documentSchemas: Record<string, DocumentSchema> = {
    peticao_inicial: {
        label: "Reclamação Trabalhista (Rito Ordinário)",
        icon: "⚖️",
        fields: [
            ...camposReclamante,
            ...camposReclamado,
            ...camposContrato,
            ...camposVerbas,
            { id: "descricao_fatos", label: "Descrição dos fatos (narrativa do caso)", type: "textarea", required: true, section: "Fatos" },
            ...camposAdvogado,
            { id: "vara_trabalho", label: "Vara do Trabalho / Comarca", type: "text", required: true, section: "Advogado" },
        ],
    },

    peticao_inicial_sumarissimo: {
        label: "Reclamação Trabalhista (Rito Sumaríssimo)",
        icon: "⚡",
        fields: [
            ...camposReclamante,
            ...camposReclamado,
            ...camposContrato,
            ...camposVerbas,
            { id: "valor_causa", label: "Valor da Causa (até 40 salários mínimos)", type: "currency", required: true, section: "Valores" },
            { id: "pedido_certo_determinado", label: "Pedido certo e determinado (obrigatório no sumaríssimo)", type: "textarea", required: true, section: "Pedidos" },
            { id: "descricao_fatos", label: "Descrição dos fatos (narrativa do caso)", type: "textarea", required: true, section: "Fatos" },
            ...camposAdvogado,
            { id: "vara_trabalho", label: "Vara do Trabalho / Comarca", type: "text", required: true, section: "Advogado" },
        ],
    },

    contestacao: {
        label: "Contestação",
        icon: "🛡️",
        fields: [
            ...camposProcesso,
            ...camposReclamado,
            { id: "reclamante_nome", label: "Nome do Reclamante", type: "text", required: true, section: "Dados do Reclamante" },
            { id: "resumo_peticao_inicial", label: "Resumo dos pedidos da petição inicial", type: "textarea", required: true, section: "Contestação" },
            { id: "preliminares", label: "Preliminares (se houver)", type: "textarea", required: false, section: "Contestação" },
            { id: "contestacao_merito", label: "Contestação ao mérito (argumentação detalhada)", type: "textarea", required: true, section: "Contestação" },
            { id: "documentos_prova", label: "Documentos/provas a anexar", type: "textarea", required: false, section: "Provas" },
            ...camposAdvogado,
        ],
    },

    replica_contestacao: {
        label: "Réplica à Contestação",
        icon: "↩️",
        fields: [
            ...camposProcesso,
            { id: "reclamante_nome", label: "Nome do Reclamante", type: "text", required: true, section: "Dados do Reclamante" },
            { id: "reclamado_razao_social", label: "Razão Social do Reclamado", type: "text", required: true, section: "Dados do Reclamado" },
            { id: "resumo_contestacao", label: "Resumo dos argumentos da contestação", type: "textarea", required: true, section: "Réplica" },
            { id: "refutacao", label: "Refutação ponto a ponto", type: "textarea", required: true, section: "Réplica" },
            { id: "fatos_novos", label: "Fatos novos (se houver)", type: "textarea", required: false, section: "Réplica" },
            ...camposAdvogado,
        ],
    },

    alegacoes_finais: {
        label: "Alegações Finais / Memorial",
        icon: "📋",
        fields: [
            ...camposProcesso,
            { id: "reclamante_nome", label: "Nome do Reclamante", type: "text", required: true, section: "Partes" },
            { id: "reclamado_razao_social", label: "Razão Social do Reclamado", type: "text", required: true, section: "Partes" },
            { id: "resumo_instrucao", label: "Resumo da instrução processual", type: "textarea", required: true, section: "Alegações Finais" },
            { id: "provas_produzidas", label: "Provas produzidas e depoimentos relevantes", type: "textarea", required: true, section: "Alegações Finais" },
            { id: "argumentacao_final", label: "Argumentação final", type: "textarea", required: true, section: "Alegações Finais" },
            { id: "pedidos_finais", label: "Pedidos finais", type: "textarea", required: true, section: "Pedidos" },
            ...camposAdvogado,
        ],
    },

    recurso_ordinario: {
        label: "Recurso Ordinário",
        icon: "📤",
        fields: [
            ...camposProcesso,
            { id: "vara_origem", label: "Vara de Origem", type: "text", required: true, section: "Dados do Recurso" },
            { id: "data_sentenca", label: "Data da Sentença", type: "date", required: true, section: "Dados do Recurso" },
            { id: "data_intimacao", label: "Data da Intimação", type: "date", required: true, section: "Dados do Recurso" },
            { id: "recorrente", label: "Nome do Recorrente", type: "text", required: true, section: "Partes" },
            { id: "recorrido", label: "Nome do Recorrido", type: "text", required: true, section: "Partes" },
            { id: "resumo_sentenca", label: "Resumo da sentença recorrida", type: "textarea", required: true, section: "Recurso" },
            { id: "razoes_recurso", label: "Razões do recurso (fundamentação detalhada)", type: "textarea", required: true, section: "Recurso" },
            { id: "pedido_reforma", label: "Pedido de reforma (o que se pretende)", type: "textarea", required: true, section: "Pedidos" },
            ...camposAdvogado,
        ],
    },

    recurso_revista: {
        label: "Recurso de Revista",
        icon: "📑",
        fields: [
            ...camposProcesso,
            { id: "tribunal_origem", label: "TRT de Origem", type: "text", required: true, section: "Dados do Recurso" },
            { id: "data_acordao", label: "Data do Acórdão", type: "date", required: true, section: "Dados do Recurso" },
            { id: "recorrente", label: "Nome do Recorrente", type: "text", required: true, section: "Partes" },
            { id: "recorrido", label: "Nome do Recorrido", type: "text", required: true, section: "Partes" },
            { id: "resumo_acordao", label: "Resumo do acórdão recorrido", type: "textarea", required: true, section: "Recurso" },
            { id: "divergencia_jurisprudencial", label: "Divergência jurisprudencial (arestos paradigmas)", type: "textarea", required: true, section: "Recurso" },
            { id: "violacao_legal", label: "Violação de lei federal ou Constituição", type: "textarea", required: true, section: "Recurso" },
            { id: "prequestionamento", label: "Prequestionamento", type: "textarea", required: true, section: "Recurso" },
            ...camposAdvogado,
        ],
    },

    agravo_instrumento: {
        label: "Agravo de Instrumento",
        icon: "🔧",
        fields: [
            ...camposProcesso,
            { id: "recorrente", label: "Nome do Agravante", type: "text", required: true, section: "Partes" },
            { id: "recorrido", label: "Nome do Agravado", type: "text", required: true, section: "Partes" },
            { id: "decisao_agravada", label: "Decisão agravada (despacho denegatório)", type: "textarea", required: true, section: "Agravo" },
            { id: "razoes_agravo", label: "Razões do agravo", type: "textarea", required: true, section: "Agravo" },
            { id: "demonstracao_pressupostos", label: "Demonstração dos pressupostos de admissibilidade", type: "textarea", required: true, section: "Agravo" },
            ...camposAdvogado,
        ],
    },

    agravo_regimental: {
        label: "Agravo Regimental",
        icon: "⚙️",
        fields: [
            ...camposProcesso,
            { id: "recorrente", label: "Nome do Agravante", type: "text", required: true, section: "Partes" },
            { id: "recorrido", label: "Nome do Agravado", type: "text", required: true, section: "Partes" },
            { id: "decisao_monocratica", label: "Decisão monocrática agravada", type: "textarea", required: true, section: "Agravo" },
            { id: "razoes_agravo", label: "Razões do agravo regimental", type: "textarea", required: true, section: "Agravo" },
            ...camposAdvogado,
        ],
    },

    embargos_declaracao: {
        label: "Embargos de Declaração",
        icon: "❓",
        fields: [
            ...camposProcesso,
            { id: "embargante", label: "Nome do Embargante", type: "text", required: true, section: "Partes" },
            { id: "embargado", label: "Nome do Embargado", type: "text", required: true, section: "Partes" },
            { id: "decisao_embargada", label: "Decisão embargada (sentença/acórdão)", type: "textarea", required: true, section: "Embargos" },
            { id: "tipo_vicio", label: "Tipo de vício", type: "select", options: ["Omissão", "Contradição", "Obscuridade", "Erro material"], required: true, section: "Embargos" },
            { id: "fundamentacao_embargos", label: "Fundamentação dos embargos", type: "textarea", required: true, section: "Embargos" },
            { id: "prequestionamento", label: "Prequestionamento (se aplicável)", type: "textarea", required: false, section: "Embargos" },
            ...camposAdvogado,
        ],
    },

    embargos_execucao: {
        label: "Embargos à Execução",
        icon: "🚫",
        fields: [
            ...camposProcesso,
            { id: "executado", label: "Nome do Executado (Embargante)", type: "text", required: true, section: "Partes" },
            { id: "exequente", label: "Nome do Exequente (Embargado)", type: "text", required: true, section: "Partes" },
            { id: "valor_execucao", label: "Valor da execução (R$)", type: "currency", required: true, section: "Execução" },
            { id: "garantia_juizo", label: "Garantia do juízo (penhora/depósito)", type: "textarea", required: true, section: "Execução" },
            { id: "materia_embargos", label: "Matéria dos embargos", type: "select", options: ["Excesso de execução", "Erro de cálculo", "Prescrição", "Compensação", "Outra"], required: true, section: "Embargos" },
            { id: "fundamentacao", label: "Fundamentação detalhada", type: "textarea", required: true, section: "Embargos" },
            ...camposAdvogado,
        ],
    },

    execucao_sentenca: {
        label: "Petição de Execução de Sentença",
        icon: "💰",
        fields: [
            ...camposProcesso,
            { id: "exequente", label: "Nome do Exequente", type: "text", required: true, section: "Partes" },
            { id: "executado", label: "Nome do Executado", type: "text", required: true, section: "Partes" },
            { id: "data_transito_julgado", label: "Data do trânsito em julgado", type: "date", required: true, section: "Execução" },
            { id: "valor_execucao", label: "Valor da execução (R$)", type: "currency", required: true, section: "Execução" },
            { id: "parcelas_devidas", label: "Parcelas devidas (detalhamento)", type: "textarea", required: true, section: "Execução" },
            { id: "calculos_atualizados", label: "Memória de cálculos atualizada", type: "textarea", required: true, section: "Cálculos" },
            ...camposAdvogado,
        ],
    },

    impugnacao_calculos: {
        label: "Impugnação aos Cálculos de Liquidação",
        icon: "🧮",
        fields: [
            ...camposProcesso,
            { id: "impugnante", label: "Nome do Impugnante", type: "text", required: true, section: "Partes" },
            { id: "impugnado", label: "Nome do Impugnado", type: "text", required: true, section: "Partes" },
            { id: "valor_apresentado", label: "Valor dos cálculos apresentados (R$)", type: "currency", required: true, section: "Cálculos" },
            { id: "valor_correto", label: "Valor que entende correto (R$)", type: "currency", required: true, section: "Cálculos" },
            { id: "erros_apontados", label: "Erros apontados nos cálculos", type: "textarea", required: true, section: "Impugnação" },
            { id: "fundamentacao", label: "Fundamentação da impugnação", type: "textarea", required: true, section: "Impugnação" },
            ...camposAdvogado,
        ],
    },

    impugnacao_sentenca_liquidacao: {
        label: "Impugnação à Sentença de Liquidação",
        icon: "📊",
        fields: [
            ...camposProcesso,
            { id: "impugnante", label: "Nome do Impugnante", type: "text", required: true, section: "Partes" },
            { id: "impugnado", label: "Nome do Impugnado", type: "text", required: true, section: "Partes" },
            { id: "resumo_sentenca_liquidacao", label: "Resumo da sentença de liquidação", type: "textarea", required: true, section: "Impugnação" },
            { id: "pontos_impugnados", label: "Pontos impugnados", type: "textarea", required: true, section: "Impugnação" },
            { id: "fundamentacao", label: "Fundamentação jurídica", type: "textarea", required: true, section: "Impugnação" },
            ...camposAdvogado,
        ],
    },

    tutela_urgencia: {
        label: "Pedido de Tutela de Urgência",
        icon: "🚨",
        fields: [
            ...camposProcesso,
            { id: "requerente", label: "Nome do Requerente", type: "text", required: true, section: "Partes" },
            { id: "requerido", label: "Nome do Requerido", type: "text", required: true, section: "Partes" },
            { id: "tipo_tutela", label: "Tipo de tutela", type: "select", options: ["Tutela antecipada", "Tutela cautelar", "Tutela de evidência"], required: true, section: "Tutela" },
            { id: "fumus_boni_iuris", label: "Probabilidade do direito (fumus boni iuris)", type: "textarea", required: true, section: "Tutela" },
            { id: "periculum_in_mora", label: "Perigo de dano / risco ao resultado útil", type: "textarea", required: true, section: "Tutela" },
            { id: "medida_pretendida", label: "Medida pretendida (pedido específico)", type: "textarea", required: true, section: "Pedidos" },
            ...camposAdvogado,
        ],
    },

    mandado_seguranca: {
        label: "Mandado de Segurança Trabalhista",
        icon: "🏛️",
        fields: [
            { id: "impetrante", label: "Nome do Impetrante", type: "text", required: true, section: "Partes" },
            { id: "impetrante_qualificacao", label: "Qualificação do Impetrante", type: "textarea", required: true, section: "Partes" },
            { id: "autoridade_coatora", label: "Autoridade Coatora", type: "text", required: true, section: "Partes" },
            { id: "ato_coator", label: "Ato coator (descrição detalhada)", type: "textarea", required: true, section: "Mandado de Segurança" },
            { id: "direito_liquido_certo", label: "Direito líquido e certo violado", type: "textarea", required: true, section: "Mandado de Segurança" },
            { id: "fundamentacao", label: "Fundamentação jurídica", type: "textarea", required: true, section: "Mandado de Segurança" },
            { id: "pedido_liminar", label: "Pedido liminar (se houver)", type: "textarea", required: false, section: "Pedidos" },
            ...camposAdvogado,
        ],
    },

    acao_rescisoria: {
        label: "Ação Rescisória Trabalhista",
        icon: "🔓",
        fields: [
            { id: "numero_processo_originario", label: "Nº do Processo Originário", type: "text", required: true, section: "Dados do Processo" },
            { id: "autor", label: "Nome do Autor da Rescisória", type: "text", required: true, section: "Partes" },
            { id: "reu", label: "Nome do Réu", type: "text", required: true, section: "Partes" },
            { id: "data_transito_julgado", label: "Data do trânsito em julgado", type: "date", required: true, section: "Dados do Processo" },
            { id: "hipotese_rescisao", label: "Hipótese de rescisão (art. 966 CPC)", type: "select", options: ["Violação manifesta de norma jurídica", "Prova falsa", "Prova nova", "Erro de fato", "Colusão entre as partes", "Incompetência absoluta", "Outra"], required: true, section: "Rescisória" },
            { id: "fundamentacao", label: "Fundamentação detalhada", type: "textarea", required: true, section: "Rescisória" },
            { id: "deposito_previo", label: "Depósito prévio (20%)", type: "currency", required: true, section: "Valores" },
            ...camposAdvogado,
        ],
    },

    acordo_judicial: {
        label: "Petição de Acordo Judicial",
        icon: "🤝",
        fields: [
            ...camposProcesso,
            { id: "reclamante_nome", label: "Nome do Reclamante", type: "text", required: true, section: "Partes" },
            { id: "reclamado_razao_social", label: "Razão Social do Reclamado", type: "text", required: true, section: "Partes" },
            { id: "valor_acordo", label: "Valor total do acordo (R$)", type: "currency", required: true, section: "Acordo" },
            { id: "forma_pagamento", label: "Forma de pagamento", type: "textarea", required: true, section: "Acordo" },
            { id: "parcelas", label: "Número de parcelas (se parcelado)", type: "number", required: false, section: "Acordo" },
            { id: "multa_descumprimento", label: "Multa por descumprimento", type: "textarea", required: false, section: "Acordo" },
            { id: "quitacao", label: "Extensão da quitação (parcial/geral)", type: "select", options: ["Quitação geral do contrato de trabalho", "Quitação parcial (apenas das parcelas objeto do acordo)"], required: true, section: "Acordo" },
            { id: "honorarios", label: "Honorários advocatícios no acordo", type: "textarea", required: false, section: "Acordo" },
            ...camposAdvogado,
        ],
    },

    acordo_extrajudicial: {
        label: "Acordo Extrajudicial (art. 855-B CLT)",
        icon: "📝",
        fields: [
            { id: "empregado_nome", label: "Nome do Empregado", type: "text", required: true, section: "Partes" },
            { id: "empregado_cpf", label: "CPF do Empregado", type: "text", required: true, section: "Partes" },
            { id: "empregador_razao_social", label: "Razão Social do Empregador", type: "text", required: true, section: "Partes" },
            { id: "empregador_cnpj", label: "CNPJ do Empregador", type: "text", required: true, section: "Partes" },
            { id: "advogado_empregado", label: "Advogado do Empregado", type: "text", required: true, section: "Advogados" },
            { id: "oab_advogado_empregado", label: "OAB do Advogado do Empregado", type: "text", required: true, section: "Advogados" },
            { id: "advogado_empregador", label: "Advogado do Empregador", type: "text", required: true, section: "Advogados" },
            { id: "oab_advogado_empregador", label: "OAB do Advogado do Empregador", type: "text", required: true, section: "Advogados" },
            { id: "objeto_acordo", label: "Objeto do acordo", type: "textarea", required: true, section: "Acordo" },
            { id: "valor_acordo", label: "Valor do acordo (R$)", type: "currency", required: true, section: "Acordo" },
            { id: "forma_pagamento", label: "Forma de pagamento", type: "textarea", required: true, section: "Acordo" },
            { id: "vara_trabalho", label: "Vara do Trabalho para homologação", type: "text", required: true, section: "Acordo" },
        ],
    },

    peticao_avulsa: {
        label: "Petição Avulsa / Intermediária",
        icon: "📄",
        fields: [
            ...camposProcesso,
            { id: "peticionante", label: "Nome do Peticionante", type: "text", required: true, section: "Partes" },
            { id: "qualidade", label: "Qualidade (Reclamante/Reclamado)", type: "select", options: ["Reclamante", "Reclamado", "Terceiro interessado"], required: true, section: "Partes" },
            { id: "objeto_peticao", label: "Objeto da petição", type: "textarea", required: true, section: "Petição" },
            { id: "fundamentacao", label: "Fundamentação", type: "textarea", required: true, section: "Petição" },
            { id: "pedido", label: "Pedido", type: "textarea", required: true, section: "Pedidos" },
            ...camposAdvogado,
        ],
    },

    peticao_diligencia: {
        label: "Petição de Diligência",
        icon: "🔍",
        fields: [
            ...camposProcesso,
            { id: "peticionante", label: "Nome do Peticionante", type: "text", required: true, section: "Partes" },
            { id: "tipo_diligencia", label: "Tipo de diligência", type: "select", options: ["Penhora", "Avaliação", "Citação", "Intimação", "Busca e apreensão", "Outra"], required: true, section: "Diligência" },
            { id: "descricao_diligencia", label: "Descrição da diligência pretendida", type: "textarea", required: true, section: "Diligência" },
            { id: "justificativa", label: "Justificativa", type: "textarea", required: true, section: "Diligência" },
            ...camposAdvogado,
        ],
    },

    excecao_incompetencia: {
        label: "Exceção de Incompetência",
        icon: "📍",
        fields: [
            ...camposProcesso,
            { id: "excipiente", label: "Nome do Excipiente", type: "text", required: true, section: "Partes" },
            { id: "excepto", label: "Nome do Excepto", type: "text", required: true, section: "Partes" },
            { id: "vara_incompetente", label: "Vara arguida como incompetente", type: "text", required: true, section: "Exceção" },
            { id: "vara_competente", label: "Vara que entende competente", type: "text", required: true, section: "Exceção" },
            { id: "fundamentacao", label: "Fundamentação (local da prestação de serviços, etc.)", type: "textarea", required: true, section: "Exceção" },
            ...camposAdvogado,
        ],
    },

    notificacao_extrajudicial: {
        label: "Notificação Extrajudicial",
        icon: "📬",
        fields: [
            { id: "notificante_nome", label: "Nome do Notificante", type: "text", required: true, section: "Partes" },
            { id: "notificante_qualificacao", label: "Qualificação do Notificante", type: "textarea", required: true, section: "Partes" },
            { id: "notificado_nome", label: "Nome do Notificado", type: "text", required: true, section: "Partes" },
            { id: "notificado_endereco", label: "Endereço do Notificado", type: "text", required: true, section: "Partes" },
            { id: "objeto_notificacao", label: "Objeto da notificação", type: "textarea", required: true, section: "Notificação" },
            { id: "prazo_resposta", label: "Prazo para resposta/cumprimento", type: "text", required: true, section: "Notificação" },
            { id: "consequencias", label: "Consequências do não cumprimento", type: "textarea", required: true, section: "Notificação" },
            ...camposAdvogado,
        ],
    },

    carta_preposicao: {
        label: "Carta de Preposição",
        icon: "👤",
        fields: [
            { id: "empresa_razao_social", label: "Razão Social da Empresa", type: "text", required: true, section: "Empresa" },
            { id: "empresa_cnpj", label: "CNPJ da Empresa", type: "text", required: true, section: "Empresa" },
            { id: "representante_legal", label: "Nome do Representante Legal", type: "text", required: true, section: "Empresa" },
            { id: "cargo_representante", label: "Cargo do Representante Legal", type: "text", required: true, section: "Empresa" },
            { id: "preposto_nome", label: "Nome do Preposto", type: "text", required: true, section: "Preposto" },
            { id: "preposto_cpf", label: "CPF do Preposto", type: "text", required: true, section: "Preposto" },
            { id: "preposto_rg", label: "RG do Preposto", type: "text", required: true, section: "Preposto" },
            { id: "preposto_cargo", label: "Cargo do Preposto", type: "text", required: true, section: "Preposto" },
            { id: "numero_processo", label: "Número do Processo", type: "text", required: true, section: "Processo" },
            { id: "vara_trabalho", label: "Vara do Trabalho", type: "text", required: true, section: "Processo" },
            { id: "data_audiencia", label: "Data da Audiência", type: "date", required: true, section: "Processo" },
        ],
    },

    procuracao: {
        label: "Procuração (Ad Judicia)",
        icon: "📜",
        fields: [
            { id: "outorgante_nome", label: "Nome do Outorgante", type: "text", required: true, section: "Outorgante" },
            { id: "outorgante_nacionalidade", label: "Nacionalidade", type: "text", required: true, section: "Outorgante" },
            { id: "outorgante_estado_civil", label: "Estado Civil", type: "select", options: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União estável"], required: true, section: "Outorgante" },
            { id: "outorgante_profissao", label: "Profissão", type: "text", required: true, section: "Outorgante" },
            { id: "outorgante_cpf", label: "CPF", type: "text", required: true, section: "Outorgante" },
            { id: "outorgante_rg", label: "RG", type: "text", required: true, section: "Outorgante" },
            { id: "outorgante_endereco", label: "Endereço completo", type: "text", required: true, section: "Outorgante" },
            { id: "advogado_nome", label: "Nome do Advogado (Outorgado)", type: "text", required: true, section: "Outorgado" },
            { id: "advogado_oab", label: "OAB do Advogado", type: "text", required: true, section: "Outorgado" },
            { id: "advogado_endereco", label: "Endereço profissional do Advogado", type: "text", required: true, section: "Outorgado" },
            { id: "poderes_especiais", label: "Poderes especiais (além do ad judicia)", type: "textarea", required: false, section: "Poderes" },
        ],
    },

    substabelecimento: {
        label: "Substabelecimento",
        icon: "🔄",
        fields: [
            { id: "substabelecente_nome", label: "Nome do Substabelecente", type: "text", required: true, section: "Substabelecente" },
            { id: "substabelecente_oab", label: "OAB do Substabelecente", type: "text", required: true, section: "Substabelecente" },
            { id: "substabelecido_nome", label: "Nome do Substabelecido", type: "text", required: true, section: "Substabelecido" },
            { id: "substabelecido_oab", label: "OAB do Substabelecido", type: "text", required: true, section: "Substabelecido" },
            { id: "tipo_substabelecimento", label: "Tipo", type: "select", options: ["Com reserva de poderes", "Sem reserva de poderes"], required: true, section: "Substabelecimento" },
            { id: "outorgante_nome", label: "Nome do cliente (Outorgante original)", type: "text", required: true, section: "Cliente" },
            { id: "numero_processo", label: "Número do Processo (se houver)", type: "text", required: false, section: "Processo" },
        ],
    },

    contrato_honorarios: {
        label: "Contrato de Honorários Advocatícios",
        icon: "💼",
        fields: [
            { id: "contratante_nome", label: "Nome do Contratante", type: "text", required: true, section: "Contratante" },
            { id: "contratante_cpf", label: "CPF do Contratante", type: "text", required: true, section: "Contratante" },
            { id: "contratante_endereco", label: "Endereço do Contratante", type: "text", required: true, section: "Contratante" },
            { id: "advogado_nome", label: "Nome do Advogado / Escritório", type: "text", required: true, section: "Contratado" },
            { id: "advogado_oab", label: "OAB do Advogado", type: "text", required: true, section: "Contratado" },
            { id: "advogado_endereco", label: "Endereço do Escritório", type: "text", required: true, section: "Contratado" },
            { id: "objeto_contrato", label: "Objeto do contrato (serviço a ser prestado)", type: "textarea", required: true, section: "Contrato" },
            { id: "tipo_honorarios", label: "Tipo de honorários", type: "select", options: ["Percentual sobre êxito", "Valor fixo", "Misto (fixo + êxito)", "Por hora"], required: true, section: "Honorários" },
            { id: "percentual_exito", label: "Percentual sobre êxito (%)", type: "number", required: false, section: "Honorários" },
            { id: "valor_fixo", label: "Valor fixo (R$)", type: "currency", required: false, section: "Honorários" },
            { id: "forma_pagamento", label: "Forma de pagamento", type: "textarea", required: true, section: "Honorários" },
            { id: "clausula_rescisao", label: "Cláusula de rescisão", type: "textarea", required: false, section: "Cláusulas" },
        ],
    },
};

// Helper: retorna as seções únicas de um schema
export function getSections(slug: string): string[] {
    const schema = documentSchemas[slug];
    if (!schema) return [];
    const sections: string[] = [];
    for (const field of schema.fields) {
        const section = field.section || "Geral";
        if (!sections.includes(section)) {
            sections.push(section);
        }
    }
    return sections;
}

// Helper: retorna campos de uma seção
export function getFieldsBySection(slug: string, section: string): FieldSchema[] {
    const schema = documentSchemas[slug];
    if (!schema) return [];
    return schema.fields.filter((f) => (f.section || "Geral") === section);
}
