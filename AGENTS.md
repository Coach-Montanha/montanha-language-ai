<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Regras de Automação do Projeto (Obrigatório)

### 1. Envio Automático para o GitHub (Sem Necessidade de Aprovação Posterior)
- **Direcionamento Automático**: Todas as alterações, melhorias, novas features e correções feitas no projeto devem ser **automaticamente commitadas e enviadas ao GitHub (`git add`, `git commit` e `git push origin main`)** ao final de cada tarefa.
- **Sem Bloqueios de Aprovação**: Proceder de forma autônoma e contínua. Não solicitar aprovações posteriores ou permissões para commitar/enviar o código ao repositório remoto.
- **Validação de Build Prévia**: Antes de realizar o commit e push, sempre validar a integridade do código executando `npm run build` (garantindo exit code 0).
- **Compatibilidade com Lovable**: Nunca utilizar `git push --force`, `rebase` ou reescrever histórico de commits já publicados. Sempre realizar commits lineares descritivos diretamente no branch `main`.

### 2. Publicação Automática no Lovable
- **Sincronização Contínua**: O projeto está integrado ao Lovable via Git Sync no branch `main`. Todas as alterações enviadas ao GitHub sincronizam instantaneamente com o workspace do Lovable.
- **Publicação Automática de Ponta a Ponta**: A publicação automática no site em produção (`smart-language.lovable.app`) deve ocorrer sem necessidade de cliques manuais em "Update" ou "Publish", mantendo o site público sempre atualizado com a versão mais recente do branch `main`.

