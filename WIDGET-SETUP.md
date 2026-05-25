# BJGROUP Suporte — Como Implementar o Widget de Ticket

O widget permite que funcionários abram tickets diretamente do site da empresa, sem precisar acessar o portal de suporte.

---

## Pré-requisito: Configurar o Board

Antes de gerar o snippet, um dev precisa configurar um board no dashboard:

1. Acesse o dashboard em `http://seudominio.com/views/dashboard.php`
2. Crie (ou edite) um board clicando no ícone de lápis ao lado do nome
3. Na configuração do board, ative **"Board Público de Tickets"**
4. Um `Token Público` será gerado automaticamente (ex.: `a1b2c3d4e5f6...`)
5. Copie esse token — ele é necessário para o snippet abaixo

---

## Snippet de Instalação

Cole o código abaixo antes do `</body>` no site da empresa:

```html
<script
  src="https://seudominio.com/assets/js/widget.js"
  data-token="SEU_TOKEN_AQUI"
  data-label="Suporte"
  data-position="bottom-right">
</script>
```

Substitua:
- `https://seudominio.com` pelo endereço real do servidor BJGROUP Suporte
- `SEU_TOKEN_AQUI` pelo token copiado no passo anterior
- `data-label` pelo texto do botão (padrão: `"Suporte"`)
- `data-position` pela posição do botão (ver opções abaixo)

---

## Opções do Atributo `data-position`

| Valor | Posição |
|---|---|
| `bottom-right` | Inferior direito (padrão) |
| `bottom-left` | Inferior esquerdo |
| `top-right` | Superior direito |
| `top-left` | Superior esquerdo |

---

## Como Funciona

1. O script injeta um botão flutuante no canto da página
2. Ao clicar, um overlay escuro abre com um `<iframe>` apontando para `ticket.php?token=TOKEN&embedded=1`
3. O funcionário preenche o formulário em 4 passos:
   - **Categoria**: Bug / Nova Funcionalidade / Acesso / Solicitação Geral
   - **Identificação**: nome e e-mail
   - **Detalhes**: título, descrição e anexos (imagens/PDFs, máx. 5)
   - **Confirmação**: ticket enviado
4. Ao confirmar, o overlay fecha automaticamente e um toast aparece no site
5. Fechar: clique fora do modal ou pressione `ESC`

O ticket aparece automaticamente no Kanban do dev na coluna "A Fazer".

---

## Cada Empresa, um Token Diferente

Para diferenciar de qual empresa veio o ticket, crie um board por empresa e use o token de cada um:

| Empresa | Board sugerido | Token |
|---|---|---|
| Aplicari | "Tickets Aplicari" | `token-da-aplicari` |
| Previnity | "Tickets Previnity" | `token-da-previnity` |
| TaxResearch | "Tickets TaxResearch" | `token-da-taxresearch` |

No dashboard, use a barra de filtro por empresa para visualizar os tickets separados.

---

## Formulário Standalone (sem iframe)

Se preferir um link direto ao formulário (sem widget), use:

```
https://seudominio.com/ticket.php?token=SEU_TOKEN_AQUI
```

Útil para enviar por e-mail ou colocar num botão manual na página.

---

## Teste Rápido

Para validar que o token está correto antes de instalar no site:

```
GET https://seudominio.com/api/boards/public/SEU_TOKEN_AQUI
```

Se retornar `{ "name": "Nome do Board", ... }` o token está válido e o widget vai funcionar.
