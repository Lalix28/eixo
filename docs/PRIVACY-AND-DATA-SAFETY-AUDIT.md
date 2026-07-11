# Auditoria de privacidade e Data Safety

## Escopo e método

Esta auditoria técnica descreve o comportamento observado no código da versão 1.0 em preparação. Foram pesquisadas APIs e bibliotecas de rede, analytics, rastreamento, compartilhamento, permissões e armazenamento; também foram inspecionados o modelo de dados, o repositório Dexie/IndexedDB, o fluxo de exportação e as dependências usadas pela aplicação.

Este documento não é a política de privacidade pública final e não substitui a revisão das declarações no Play Console.

## Dados preenchidos e gerados

### Onboarding e ponto de partida

O onboarding persiste um registro de baseline com:

- nível informado;
- dor lombar e dor no adutor, em escala numérica;
- lado com atrofia e lado de maior limitação;
- possibilidade de fazer tiros;
- disponibilidade de bicicleta;
- minutos diários disponíveis;
- objetivo escolhido;
- identificador local e data de criação.

### Sessões de treino

Cada sessão pode armazenar:

- identificador da sessão e referência ao dia do plano;
- índice e data local do dia;
- horários de início e conclusão;
- status de conclusão;
- data de criação.

### Registros pós-treino, dor, RPE e observações

Os registros podem conter:

- dor lombar antes e depois;
- percepção de esforço (RPE);
- tempo de prancha frontal;
- distância das mãos ao chão;
- exercício que incomodou e lado afetado;
- observações livres;
- métricas por lado, incluindo dor no adutor antes/depois e tempos de prancha lateral e sustentação de quadril/core;
- identificadores locais e datas associadas.

### Progresso

O progresso é calculado localmente a partir das sessões, registros e métricas por lado já armazenados. O conteúdo estático do plano de 30 dias e das progressões fica empacotado no código e não é persistido como dado do usuário.

## Local de armazenamento

Os dados do usuário são armazenados no IndexedDB do navegador, no banco local `eixo`, por meio do Dexie. As tabelas são `baselines`, `sessions`, `logs` e `sideMetrics`.

Não foi encontrado uso do `localStorage`, `sessionStorage`, cookies ou outro armazenamento de dados do usuário no código da aplicação. O service worker e o Cache Storage mantêm apenas o shell e os ativos necessários ao funcionamento offline; o código não adiciona dados de saúde ou treino a esses caches.

## Exportação JSON

A exportação lê localmente as quatro tabelas e cria um arquivo JSON versionado contendo metadados da exportação e cópias integrais de `baselines`, `sessions`, `logs` e `sideMetrics`. O navegador cria o arquivo por meio de `Blob` e de uma URL local temporária.

O arquivo é criado e baixado somente após ação explícita do usuário no botão **Exportar JSON**. O fluxo inspecionado não usa rede nem API de compartilhamento. Depois de exportado, o arquivo fica sob controle do usuário e pode conter dados pessoais de saúde e treino; seu armazenamento e eventual compartilhamento fora do aplicativo não são controlados pelo Eixo.

## Coleta, transmissão e compartilhamento

Com base no código auditado:

- não foram identificadas chamadas de rede na lógica da aplicação para transmitir dados do usuário;
- na versão auditada, não foram identificadas rotinas de envio dos dados pessoais e registros de saúde, dor, treino, RPE ou observações para servidores;
- não foram identificadas rotinas de coleta remota;
- não há compartilhamento automático com terceiros;
- não há analytics, telemetria, publicidade ou rastreamento configurados;
- não há conta ou login;
- não há backend;
- não há sincronização local-nuvem ou entre dispositivos;
- não há uso de cookies.

O carregamento inicial da PWA, a verificação/atualização do service worker e o download dos arquivos estáticos dependem do host onde o aplicativo é publicado. Essas transferências técnicas entregam o aplicativo, mas o código auditado não anexa nem envia os registros locais do usuário.

As bibliotecas de produção identificadas servem a persistência local, interface, gráficos e estado. Nenhuma delas foi encontrada configurada para transmitir dados. O pacote transitivo `workbox-google-analytics`, presente no lockfile como parte do conjunto de ferramentas Workbox, não é importado nem configurado pela aplicação ou pelo service worker gerado.

## Como apagar os dados locais

A interface atual informa o caráter local dos dados, mas não expõe um botão de exclusão. O usuário pode apagar os dados do Eixo pelas configurações de armazenamento/dados do site ou do aplicativo no navegador ou no Android. A desinstalação também normalmente remove os dados locais associados ao aplicativo, conforme o comportamento da plataforma.

Limpar os dados do site/aplicativo, usar ambientes privados ou desinstalar pode apagar permanentemente o histórico local. Como não há backend ou sincronização, o Eixo não consegue recuperar esses registros. Uma exportação JSON feita previamente é apenas um arquivo de backup; a versão auditada não possui fluxo de importação ou restauração.

## Pendência de contato

**E-mail público de suporte ainda não definido pelo responsável.**

Nenhum e-mail obtido de Git, metadados de pacote, conta do sistema ou arquivos locais foi usado neste documento.

## Limitações da auditoria

- A conclusão se limita ao código e às dependências presentes no repositório durante esta execução.
- A auditoria não verifica políticas ou logs operacionais do provedor de hospedagem, da CDN, do navegador, do Android ou da Google Play.
- Mudanças futuras de código, dependências, hospedagem, empacotamento TWA ou configuração do Play Console exigem nova revisão.
- A classificação final de Data Safety e a política pública devem ser revisadas pelo responsável com base na versão efetivamente enviada e nos requisitos vigentes da Google Play.
