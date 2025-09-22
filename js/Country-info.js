import countryFlags from "js/country-flags.json" assert { type: "json" };

export function showCountryInfo(countryId) {
  const iso = countryFlags[countryId];
  const container = document.getElementById("info-window");

  // clear old content
  container.innerHTML = "";

  if (!iso) {
    container.textContent = `No data available for ${countryId}`;
    return;
  }

  // add flag
  const flagImg = document.createElement("img");
  flagImg.src = `flags/${iso}.svg`;
  flagImg.alt = `Flag of ${countryId}`;
  flagImg.className = "flag";

  // add country name
  const title = document.createElement("h2");
  title.textContent = countryId.replace(/-/g, " "); // make it prettier

  container.appendChild(flagImg);
  container.appendChild(title);

  // later we’ll add: history, national dish, “more options” button, etc.
}
