# Prodeko infoscreen :tv:

Prodekon kiltahuoneen infoscreen - ruokalistat, tiedottaminen, tapahtumamainonta.

---

### Kehittäminen

Vaatii Node.js 22 tai uudemman (`.nvmrc`:ssä 24).

```
nvm use
npm install
npm run dev
```

Diat haetaan prodeko.org-sivustolta (`https://prodeko.org/infoscreen/slides.json`). Paikallisesti voi käyttää esimerkkidiojä:

```
SLIDES_URL=http://localhost:3000/dev/slides.json npm run dev
```

### Koodityyli

Käytössä on [TypeScript](https://www.typescriptlang.org/), [ESLint](https://eslint.org/) ja [Prettier](https://prettier.io/). `npm run lint` ja `npm run typecheck` tarkistavat koodin.

## Konfigurointi

- `SLIDES_URL` (ympäristömuuttuja): diojen JSON-syöte. Oletus `https://prodeko.org/infoscreen/slides.json`.
- `lib/config.ts`: diojen vaihtoväli ja päivitystiheydet.

Diasyöte on lista muotoa:

```json
[
  {
    "id": "syysjuhla",
    "title": "Syysjuhla",
    "description": "<p>HTML-sisältö</p>",
    "highlight": false,
    "image": "https://prodeko.org/kuva.jpg"
  }
]
```

`image` on vapaaehtoinen ja aina absoluuttinen URL.

Ruokalistat tulevat [Kanttiinit](https://kanttiinit.fi)-rajapinnasta. Molemmat syötteet välitetään Next.js:n rewritejen kautta (`next.config.ts`), joten selain ei tarvitse CORS-otsakkeita.

## Käyttöönotto

```
npm run build && npm run start
```

## Rakennuspalikat

- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [styled-components](https://styled-components.com/)

## Kehittäjät

- Timo Riski

## Lisenssi

MIT lisenssi - [LICENSE](LICENCE).
