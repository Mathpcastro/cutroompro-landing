# CutRoom Pro — landing page

Site publicado: [cutroompro.vercel.app](https://cutroompro.vercel.app). O editor está em [Mathpcastro/cutroom](https://github.com/Mathpcastro/cutroom).

Landing pública do [CutRoom](https://github.com/Mathpcastro/cutroom): editor de vídeo gratuito, open source e processado no computador. Este repositório contém somente o site, seus vídeos e imagens de demonstração, e a função que encaminha o formulário de download ao cadastro privado existente.

## Desenvolvimento

Requer Node.js 24 ou superior. Instale as dependências (não há dependências de runtime) e rode os testes:

```sh
npm test
```

Para visualizar os arquivos estáticos, sirva a pasta `public/` com qualquer servidor HTTP. A rota `api/download.js` roda como uma função Node.js na Vercel.

## Publicar na Vercel

O projeto `cutroom-pro` usa este repositório com estas opções:

- Framework: Other
- Root Directory: `/`
- Build Command: vazio
- Install Command: vazio
- Output Directory: `public`
- Runtime da função: Node.js 24

Configure `CUTROOM_SITES_BYPASS_TOKEN` como variável sensível apenas em Production. Ela autoriza a função `/api/download` a encaminhar o formulário ao backend privado existente, que salva os cadastros no Supabase do Pauta.ai. O valor nunca deve entrar no Git ou em logs. O backend continua responsável por validar e armazenar os dados; a função deste repositório só valida origem/tamanho, escolhe um instalador permitido e encaminha o pedido.

A página oferece instaladores de Windows e macOS. A escolha do sistema é enviada junto ao formulário; o instalador só é liberado depois que o backend confirma o cadastro.

## Conteúdo e licenças

O código original do site e da função é MIT, conforme `LICENSE`. As gravações e imagens mostram o produto do autor. A fonte Manrope inclui sua licença OFL. Os ícones de Claude e Codex identificam integrações independentes; as marcas pertencem à Anthropic e à OpenAI e não indicam endosso. Veja os arquivos de licença distribuídos com os ativos e as atribuições na página.

Este repositório não contém o código do editor Electron. O desenvolvimento do aplicativo acontece em [Mathpcastro/cutroom](https://github.com/Mathpcastro/cutroom).
