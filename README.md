# La Bella Donna – Pizzeria Delivery · Tramandaí/RS

Site one-page cinematográfico (HTML + CSS + JS puro, sem build). Fundo preto, turquoise da marca,
dourado e vermelho batom, com animações de rolagem em GSAP/ScrollTrigger.

## Como ver no seu computador

```bash
# dentro da pasta do projeto
python -m http.server 8000
# abra http://localhost:8000
```

(ou qualquer servidor estático: `npx serve`, extensão Live Server do VS Code etc.)

## O que falta preencher

Tudo em **`js/config.js`**:

| Campo              | O que colocar                                   | Exemplo                       |
|--------------------|--------------------------------------------------|-------------------------------|
| `whatsapp`         | DDI + DDD + número, só dígitos                   | `"5551999999999"`             |
| `telefoneExibicao` | Como o telefone aparece na seção "Onde estamos"  | `"(51) 99999-9999"`           |
| `horario`          | Horário de funcionamento                         | `"Ter a dom, das 18h às 23h"` |

Enquanto estiverem vazios, aparece `[INSERIR]` na seção de contato e os botões de WhatsApp abrem só o WhatsApp.

Depois de publicar, preencha também no `index.html` (no `<head>`): `<link rel="canonical">` e
`<meta property="og:image">` com a URL final do site, e, no JSON-LD, os campos `telephone`,
`openingHours` e `url`.

## Trocar as fotos

As imagens ficam em **`assets/img/`** (WebP). Cada "espaço" tem um nome fixo: basta substituir o
arquivo mantendo o mesmo nome (ou atualizar o `src` no `index.html`).

| Arquivo                         | Onde aparece                         | Proporção ideal |
|---------------------------------|--------------------------------------|-----------------|
| `hero-poster.webp`              | Hero: imagem de reserva (reduzir movimento / sem JS) | vertical 9:16 |
| `cena1-poster.webp`             | Cena 1: imagem de reserva            | vertical 9:16   |
| `card-carne-desfiada.webp`      | Card "Carne desfiada com gorgonzola" | 5:4             |
| `card-pepperoni.webp`           | Card "Pepperoni"                     | 5:4             |
| `card-quatro-queijos.webp`      | Card "Quatro queijos"                | 5:4             |
| `card-chocolate-mms.webp`       | Card "Chocolate com M&M's"           | 5:4             |
| `card-chocolate-morangos.webp`  | Card "Chocolate com morangos"        | 5:4             |
| `sabores-salgadas.webp`         | Metade "Salgadas"                    | livre (cobre)   |
| `sabores-doces.webp`            | Metade "Doces"                       | livre (cobre)   |
| `manifesto-maos-fatias.webp`    | Cena 4 – foto grande                 | vertical 3:4    |
| `manifesto-detalhe-unhas.webp`  | Cena 4 – foto de detalhe             | quadrada        |
| `caixa-pizza-aberta.webp`       | Cena 5 – pizza dentro da caixa       | paisagem ~16:9  |
| `galeria-01.webp` … `galeria-08.webp` | Mosaico da galeria (01 e 04 são verticais, 05 e 08 são largas) | ver `index.html` |

> **Importante:** as fotos atuais são recortes das 3 imagens enviadas (≈400 px de largura, ampliadas 2×).
> Para o resultado final, use as fotos originais em alta resolução (ideal: 1600 px de largura ou mais,
> exportadas em WebP, qualidade 80–85). No hero e na cena 1, a imagem é ampliada em tela cheia.

## Estrutura

```
index.html        conteúdo, SEO local e schema Restaurant
css/style.css     identidade visual e layout
js/config.js      WhatsApp, telefone e horário
js/main.js        intro, rolagem, carrossel, cursor, caixa de pizza, créditos
assets/           imagens WebP e favicon
```

## Acessibilidade e desempenho

- `prefers-reduced-motion`: sem intro, sem cena fixada e sem parallax; todo o conteúdo fica visível.
- Se o GSAP (CDN) não carregar, o site continua funcionando sem animações.
- Navegação por teclado (links de pular, foco visível, carrossel e cards focáveis), `alt` em todas as imagens.
- Imagens com `loading="lazy"` e dimensões declaradas; fontes do Google Fonts com `display=swap`.
- No celular: cursor personalizado desligado, grão estático e animações mais curtas.

## Publicar

Site estático: funciona em GitHub Pages, Vercel, Netlify ou qualquer hospedagem.
No GitHub Pages: *Settings → Pages → Deploy from a branch → `main` / root*.

## Links usados

- Pedidos: https://labelladonnapizzaria.saipos.com/la-bella-donna-tramandai
- Instagram: https://www.instagram.com/labelladonnatramandai/
- Mapa: https://share.google/WYURP3n5nlxX6kI5b

## Vídeo da abertura (hero + cena 1)
O início do site toca um reel em frames conforme a rolagem: `assets/frames/f_0001.webp … f_0090.webp` (720×1280). Para trocar o vídeo: `ffmpeg -i novo.mp4 -vf "fps=90/<duração>,scale=720:1280" -c:v libwebp -quality 48 assets/frames/f_%04d.webp` e ajustar `SEQ.total` em `js/main.js`. O vídeo original fica em `fonte/` (ignorada pelo Git).
