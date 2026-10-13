import "./style.css";

import { fetchCountries } from "./api/countries";

import { renderCountryGrid } from "./render/countryGrid";

import type { Country } from "./type/country";

import { filterCountries } from "./utils/filter";

import { renderEmpty, renderError, renderLoading } from "./render/states";

import { fetchCountryByCode } from "./api/countries";

import { renderDetail } from "./render/detail";

const countriesContainer: HTMLElement | null =
  document.querySelector<HTMLElement>("#countries-container");

  const countrySearch: HTMLInputElement | null =
  document.querySelector<HTMLInputElement>(
    "#country-search",
  );

  const regionFilter: HTMLSelectElement | null =
  document.querySelector<HTMLSelectElement>(
    "#region-filter",
  );

  const homeView: HTMLElement | null = 
  document.querySelector("#home-view");

  const detailView: HTMLElement | null = 
  document.querySelector("#detail-view");

let allCountries: Country[] = [];

async function loadCountries(): Promise<void> {
  if (!countriesContainer) {
    console.error("No se encontró #countries-container.");
    return;
  }

  countriesContainer.innerHTML = renderLoading();

  try {
    allCountries = await fetchCountries();

    countriesContainer.innerHTML =
    renderCountryGrid(allCountries);

    if (allCountries.length === 0) {
      countriesContainer.innerHTML = renderEmpty("");
      return;
    }

  } catch (error: unknown) {
    const message: string = error instanceof Error
      ? error.message
      : "Ocurrió un error desconocido.";
     console.error("Error al cargar los países:", message);

    countriesContainer.innerHTML = renderError(
      "Verifica tu conexión e inténtalo nuevamente.",
    );

    const retryButton: HTMLButtonElement | null =
      document.querySelector<HTMLButtonElement>(
        "#retry-button",
      );

    retryButton?.addEventListener(
      "click",
      (): void => {
        void loadCountries();
      });
    }
  }


function applyFilter (): void {
  if (
      !countrySearch ||
      !regionFilter ||
      !countriesContainer
    ) {
      return;
    }
const query: string =
countrySearch.value;

const region: string =
regionFilter.value;

const filteredCountries: Country[] =
  filterCountries(
  allCountries,
  query,
  region,
 );

 if (filteredCountries.length === 0) {
    countriesContainer.innerHTML =
    renderEmpty(query);
    return;
  }


 countriesContainer.innerHTML =
 renderCountryGrid(filteredCountries);

}

function debounce(
  callback: () => void,
  delay: number,
): () => void {
  let timer: ReturnType<typeof setTimeout>;

  return () => {
    clearTimeout(timer);
    timer = setTimeout(callback, delay);
  };
}

const debouncedApplyFilter = debounce(applyFilter, 300);

countrySearch ?.addEventListener(
  "input",
  debouncedApplyFilter
)

regionFilter?.addEventListener(
  "change",
  applyFilter
)

void loadCountries();

async function router(): Promise<void> {

  if (!homeView || !detailView) {
    console.error("Faltan #home-view o #detail-view.");
    return;
  }

  // La ruta de detalle requiere un código de dos letras.
  const hash = window.location.hash;
  const match = hash.match(/^#\/country\/([A-Za-z]{2})$/);

  if (!match) {
    homeView.hidden = false;
    detailView.hidden = true;
    return;
  }

  const code = match[1] ?? "";
  homeView.hidden = true;
  detailView.hidden = false;
  detailView.innerHTML = "<p>Cargando detalle del país…</p>";

  try {
    const country = await fetchCountryByCode(code);
    
    if (window.location.hash !== hash) return;
    detailView.innerHTML = renderDetail(country);
  } catch (error: unknown) {
    if (window.location.hash !== hash) return;
    console.error("Error al cargar el detalle:", error);
    detailView.innerHTML =
      '<p>No fue posible cargar el país.</p>' +
      '<a href="#/">Volver a países</a>';
  }
}

window.addEventListener("hashchange", () => {
  void router();
});

void router();