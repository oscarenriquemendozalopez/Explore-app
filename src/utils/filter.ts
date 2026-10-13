import type { Country } from "../type/country";

export function filterCountries(
  countries: Country[],
  query: string,
  region: string,
): Country[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedRegion = region.trim().toLowerCase();

  return countries.filter((country: Country): boolean => {
    const countryName = country.names.common.toLowerCase();
    const countryRegion = country.region.toLowerCase();

    const matchesName = countryName.includes(normalizedQuery);
    const matchesRegion =
      normalizedRegion === "" || countryRegion === normalizedRegion;

    return matchesName && matchesRegion;
  });
}