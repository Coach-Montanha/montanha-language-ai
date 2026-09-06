# Publicação Automática das Alterações

## Objetivo
Fazer com que todas as alterações do projeto Smart Language sejam refletidas no site publicado (`smart-language.lovable.app`) sem necessidade de clicar em "Update" manualmente a cada mudança.

## O que será feito

1. **Ativar a atualização automática do site publicado** nas configurações de publicação do projeto. Com isso, cada nova versão do app entra no ar automaticamente, sem clique manual.

2. **Confirmar o estado de publicação atual** — verificar as configurações atuais (visibilidade, badge, trust center) e ajustar para que o site permaneça público e sempre atualizado.

## Detalhes técnicos
- A ativação usa as configurações de publicação do próprio Lovable (Publish Settings), sem alteração de código no projeto.
- Mudanças de backend continuam sendo publicadas instantaneamente; mudanças de interface passam a ser atualizadas automaticamente também.

## Observação
A automação de commits/push para o GitHub já está prevista nas regras do projeto (GEMINI.md) e continua valendo. Este plano cobre especificamente a publicação do app.
