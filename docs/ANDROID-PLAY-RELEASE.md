# Preparação Android e Google Play — versão 1.0

## Identidade e estado validado

- Package ID: `com.lalix28.eixo`.
- Domínio associado: `eixo-steel.vercel.app`.
- Uma versão de teste da TWA já foi validada, incluindo instalação, abertura sem barra do navegador e funcionamento offline.
- O APK direto é o pacote usado para sideload/testes fora da Google Play.
- O AAB será o formato de envio à Google Play; nenhum APK ou AAB foi gerado nesta rodada.

## Instalação direta e instalação pela Google Play

A instalação do APK direto exige que o usuário autorize a fonte externa usada para abrir o pacote, como o navegador ou o gerenciador de arquivos. Essa autorização, normalmente apresentada pelo Android como **Permitir desta fonte**, é uma proteção da plataforma e não pode ser removida ou desativada pelo Eixo.

A instalação distribuída pela Google Play não exige que o usuário ative **Permitir desta fonte**. O APK direto permanece destinado a testes e distribuição direta; o AAB é o artefato enviado à Google Play para processamento e distribuição pela loja.

## Digital Asset Links e certificados

O Digital Asset Links já está publicado em `/.well-known/assetlinks.json`. A fingerprint atualmente publicada corresponde ao APK de teste e deve ser preservada enquanto esse APK direto continuar sendo distribuído.

Quando a Google Play passar a assinar a versão distribuída pela loja, será necessário adicionar ao `assetlinks.json` a fingerprint da **Play app signing key**. Não se deve substituir a fingerprint atual: quando o APK direto e a versão da Play precisarem coexistir, manter ambas as fingerprints aplicáveis.

O arquivo `assetlinks.json` não foi alterado nesta rodada.

## Upload key e Play app signing key

- A **upload key** identifica o envio do AAB pelo responsável à Play Console. Ela autoriza uploads, mas não é necessariamente o certificado que assina o APK entregue aos usuários.
- A **Play app signing key** é mantida pela Google Play e assina os artefatos distribuídos pela loja. É a fingerprint desse certificado de distribuição que deve ser associada ao domínio para a TWA instalada pela Play.

Keystores, chaves privadas, senhas, arquivos de configuração de assinatura e tokens devem permanecer fora do Git, com backup seguro e acesso restrito.

Se o APK de teste estiver instalado e a versão da Play for assinada com um certificado diferente, o Android pode impedir a atualização direta. Nesse caso, pode ser necessário desinstalar o APK de teste antes de instalar a versão da Play, o que pode remover os dados locais do aplicativo. Fazer uma exportação JSON antes dessa troca reduz o risco de perda do arquivo de dados, embora a versão auditada não possua importação/restauração automática.

## Pendências antes da publicação

- Política pública de privacidade: **pendente**.
- Ficha da loja: **pendente**.
- Declaração de Data Safety: **pendente**.
- Declaração de saúde: **pendente**.
- Configuração e revisão no Play Console: **pendente**.
- E-mail público de suporte: **pendente de definição pelo responsável**.
- Fingerprint da Play app signing key no Digital Asset Links: **pendente quando a chave estiver disponível**.
- Ativos reais da loja: **pendentes**, conforme `docs/STORE-ASSETS.md`.

As declarações e os requisitos devem ser confirmados contra a versão efetivamente enviada e as regras vigentes da Google Play no momento da publicação.

## Materiais sensíveis

Este documento não contém senha, chave privada, keystore, token, segredo ou conteúdo de arquivos locais de informação de assinatura. Nenhum desses materiais deve ser adicionado ao repositório.
