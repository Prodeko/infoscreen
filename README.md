# Prodeko infoscreen :tv:

Prodekon kiltahuoneen infoscreen - ruokalistat, julkinen liikenne, tiedottaminen, tapahtumamainonta.

---

### Kehittäminen

Paikallinen kehittäminen onnistuu seuraavilla komennoilla:

```
npm install
npm run dev
```

### Koodityyli

Tiedostot src/tsconfig.json, .eslintrc ja .prettierrc sisältävät koodin tyyppi- ja tyylimäärittelyjä. Käytössä on [Typescript](https://www.typescriptlang.org/), [ESLint](https://eslint.org/) ja [Prettier](https://prettier.io/)

## Konfigurointi

Infoscreenin toimintaa on mahdollista muokata src/config kansiosta löytyvien tiedostojen avulla.

Saatavilla olevat muuttujat (tässä dev.env.js):

```
API_URL_ROOT: 'https://prodeko.org/',
API_URL: 'https://prodeko.org/fi/infoscreen/api',
SLIDE_CHANGE_INTERVAL: 5000,
SIDEBAR_SWITCH_INTERVAL: 15000,
FETCH_TIME_INTERVAL: 600000,
FETCH_SLIDES_INTERVAL: 10000,
```

## Käyttöönotto

Production build ja servaus

```
npm run build && npm run start
```

## Rakennuspalikat

- [React](https://reactjs.org/) - Javascript UI-kirjasto
- [Next.js](https://nextjs.org/) - React framework

## Kehittäjät

- Timo Riski

## Lisenssi

MIT lisenssi - [LICENSE](LICENSE).
