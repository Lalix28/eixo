# Eixo — checklist do MVP

## Funcionando

- Onboarding local com baseline de nível, desconforto, limitações, rotina e foco.
- Programa de 30 dias com mobilidade, calistenia, condicionamento e quadril/core.
- Dashboard diário com prescrição, progressão e avisos de segurança.
- Execução guiada com exercícios manuais, timer, pausa e avanço de fase.
- Wake Lock e vibração quando o navegador oferece suporte.
- Registro pós-treino com status, dor, esforço, medidas por lado e observações.
- Progresso baseado somente em registros reais, com resumos e gráficos.
- Persistência local em IndexedDB, sem conta ou servidor.
- PWA instalável, shell offline e aviso de atualização.
- Navegação mobile-first entre Hoje, Progresso e Ajustes.

## Fora deste MVP

- Exportação e importação de dados.
- Backend, login, analytics ou planos pagos.
- Sincronização na nuvem ou entre dispositivos.
- Multiusuário, notificações nativas e recursos de IA.
- Router por URL; a navegação atual é local e controlada pelo estado do app.

## Como rodar localmente

Requisitos: Node.js compatível com Vite 8 e npm.

```bash
npm install
npm run dev
```

Para conferir a versão de produção:

```bash
npm run build
npm run preview
```

## Checagens

```bash
npm run typecheck
npm run test
npm run build
npm run lint
```

## Limitações conhecidas

- Os dados existem apenas no armazenamento do navegador atual. Limpar os dados do site, usar navegação privada ou trocar de dispositivo pode causar perda dos registros.
- Ainda não há backup ou restauração.
- Instalação PWA e algumas APIs do dispositivo dependem do navegador e de contexto seguro (`https` ou `localhost`).
- Wake Lock e vibração usam melhoria progressiva: o treino continua funcionando quando essas APIs não estão disponíveis.
- A tela Progresso é carregada sob demanda. O chunk inclui o Recharts e também entra no precache da PWA.

## Próximos passos sugeridos

1. Fase 1.1: exportação JSON local, com formato versionado e teste de integridade.
2. Depois da exportação, avaliar importação/restauração com validação explícita.
3. Fazer uma rodada de uso real em celulares iOS e Android para conferir instalação, áreas seguras e Wake Lock.

