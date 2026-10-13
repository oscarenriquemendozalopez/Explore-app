import type { CountriesResponse, Country } from "../type/country";
import type { CountryDetail } from "../type/country-detail";

interface DetailResponse {
  data: {
    objects: CountryDetail[];
  };
}

const API_KEY = import.meta.env.VITE_REST_COUNTRIES_API_KEY;
const API_URL = "https://api.restcountries.com/countries/v5";
const PAGE_SIZE = 100;

function getAuthHeaders(): HeadersInit {
  if (!API_KEY) {
    throw new Error("No se encontró la API key de REST Countries.");
  }

  return {
    Authorization: `Bearer ${API_KEY}`,
  };
}

export async function fetchCountries(): Promise<Country[]> {
  const allCountries: Country[] = [];
  let offset = 0;
  let hasMoreCountries = true;

  while (hasMoreCountries) {
    const url = new URL(API_URL);

    url.searchParams.set(
      "response_fields",
      [
        "names.common",
        "codes.alpha_2",
        "flag.url_svg",
        "flag.description",
        "population",
        "region",
        "capitals",
      ].join(","),
    );

    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("offset", String(offset));

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP al cargar países: ${response.status}`);
    }

    const result: CountriesResponse = await response.json();

    allCountries.push(...result.data.objects);
    hasMoreCountries = result.data.meta.more;
    offset += PAGE_SIZE;
  }

  return allCountries;
}

export async function fetchCountryByCode(
  code: string,
): Promise<CountryDetail> {
  const url = new URL(
    `${API_URL}/codes.alpha_2/${encodeURIComponent(code)}`,
  );

  url.searchParams.set(
    "response_fields",
    [
      "names.common",
      "names.native",
      "codes.alpha_2",
      "flag.url_svg",
      "flag.description",
      "population",
      "region",
      "subregion",
      "capitals",
      "tlds",
      "currencies",
      "languages",
      "borders",
    ].join(","),
  );

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP al cargar detalle: ${response.status}`);
  }

  const payload: DetailResponse = await response.json();
  const country = payload.data.objects[0];

  if (!country) {
    throw new Error("No se encontró el país solicitado.");
  }

  return country;
}