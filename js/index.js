"use strict";

let countries = [];

const countriesContainer = document.querySelector(".countries");
const contentContainer = document.querySelector(".content");

const inputSearch = document.querySelector(".content__search-input");

let curPage = 1;
let recordsPerPage = 8;

function getData(url) {
	return new Promise((res, rej) => {
		fetch(url)
			.then((res) => res.json())
			.then((data) => res(data))
			.catch((err) => {
				console.log(`Sorry for Inconvinience, We couldn't get the data`, "\n", `Reason: ${err}`);
			});
	});
}

function renderHTML(parentEl, HTML, position, clean = false) {
	clean ? (parentEl.innerHTML = "") : "nothing";
	return parentEl.insertAdjacentHTML(position, HTML);
}

function joinTemplate(arr, template) {
	const newArr = arr.map((el) => template(el));
	return newArr;
}

function createProperties(data) {
	const newData = data.map((el) => {
		el.slug = el.name.trim().toLowerCase().replaceAll(" ", "-");
		el.population = el.population.toLocaleString("en-US");
		return el;
	});
	return newData;
}

function createCountryCardTemplate(data) {
	return `
        <div class="country">
			<div class="country__img-box">
				<img src="${data.flags.png}" alt="Image of the ${data.name}" class="country__img" />
			</div>

			<div class="country__info">
				<h3 class="heading-tertiary country__name">${data.name}</h3>
				<!-- <a href="/country/${data.slug}">${data.name}</a> -->
				<p class="country__population"><span>Population:</span>${data.population}</p>
				<p class="country__region"><span>Region:</span> ${data.region}</p>
				<p class="country__capital"><span>Capital:</span> ${data.capital}</p>
			</div>
		</div>
    `;
}

function createDetailPageTemplate(data) {
	return `
			<div class="detail">
				<header class="detail__header">
					<a href="/" class="btn btn-back">&larr; Back</a>
				</header>

				<div class="detail__country">
					<div class="detail__img-box">
						<img src="${data.flags.svg}" alt="Image of the ${data.name} flag" />
					</div>

					<div class="detail__country-info-box">
						<h2 class="heading-secondary detail__name">${data.name}</h2>
						<div class="detail__country-info">
							<div>
								<p class="detail__item detail__original-name"><strong>Native Name:</strong> ${data.nativeName}</p>
								<p class="detail__item detail__population"><strong>Population:</strong> ${data.population}</p>
								<p class="detail__item detail__region"><strong>Region:</strong> ${data.region}</p>
								<p class="detail__item detail__sub-region">
									<strong>Sub-Region:</strong> ${data.subregion}
								</p>
								<p class="detail__item detail__capital"><strong>Capital:</strong> ${data.capital}</p>
							</div>

							<div>
								<p class="detail__item detail__domain"><strong>Top Level Domain:</strong> ${data.topLevelDomain[0]}</p>
								<p class="detail__item detail__currency"><strong>Currencies:</strong> ${data.currencies[0].name}</p>
								<p class="detail__item detail__languages">
									<strong>Languages:</strong> ${data.languages.map((lan) => lan.name).join(", ")}
								</p>
							</div>
						</div>

						<div class="detail__border-countries-box">
							<p><strong>Border Countries:</strong></p>
							<div class="detail__border-countries">
								${
									data.borders
										? data.borders
												.map((bor) => `<p class="detail__border-country">${bor}</p>`)
												.join(" ")
										: `${data.name} doesn't have any border countries.`
								}
							</div>
						</div>
					</div>
				</div>
			</div>
	`;
}

function numPages(data) {
	return Math.ceil(data.length / recordsPerPage);
}

function changePage(page, totalCountries) {
	const btnNext = document.querySelector(".btn-pagination--next");
	const btnPrev = document.querySelector(".btn-pagination--prev");
	const pageSpan = document.querySelector(".pagination__page");
	const numOfPages = numPages(totalCountries);

	if (page < 1) page = 1;
	if (page > numOfPages) page = numOfPages;

	countriesContainer.innerHTML = "";

	for (let i = (page - 1) * recordsPerPage; i < page * recordsPerPage && i < totalCountries.length; i++) {
		renderHTML(countriesContainer, createCountryCardTemplate(totalCountries[i]), "afterbegin");
	}
	pageSpan.textContent = page;

	if (page == 1) btnPrev.classList.add("content--hidden-1");
	else btnPrev.classList.remove("content--hidden-1");

	if (page == numOfPages) btnNext.classList.add("content--hidden-1");
	else btnNext.classList.remove("content--hidden-1");

	return page;
}

function prevPage() {
	if (curPage > 1) {
		curPage--;
		return changePage(curPage, countries);
	}
}

function nextPage() {
	if (curPage < numPages(countries)) {
		curPage++;
		return changePage(curPage, countries);
	}
}

function deletePagination() {
	const btnNext = document.querySelector(".btn-pagination--next");
	const btnPrev = document.querySelector(".btn-pagination--prev");
	const pageSpan = document.querySelector(".pagination__page");

	btnNext.classList.add("content--hidden-1");
	btnPrev.classList.add("content--hidden-1");
	pageSpan.classList.add("content--hidden-1");
}

function searchForCountries(searchInput) {
	if (!searchInput) return;
	const searchResults = countries.filter((obj) => obj.name.toLowerCase().includes(searchInput));

	if (!searchResults.length) {
		deletePagination();
		return renderHTML(
			countriesContainer,
			`<p class="error-msg">Sorry, We weren't able to find country named "${searchInput}".</p>`,
			"afterbegin",
			true
		);
	}

	if (searchResults.length < 8) deletePagination();

	return renderHTML(
		countriesContainer,
		joinTemplate(searchResults, createCountryCardTemplate).join(" "),
		"afterbegin",
		true
	);
}

getData("/data.json").then((data) => (countries = createProperties(data)));

document.body.addEventListener("click", (e) => {
	const { target } = e;

	if (target.matches(".btn-pagination--next")) return nextPage();

	if (target.matches(".btn-pagination--prev")) return prevPage();

	if (target.matches(".country__name")) {
		const curCountry = target.textContent;

		if (!curCountry) return;
		const curCountryData = countries.find((obj) => obj.name === curCountry);

		return renderHTML(contentContainer, createDetailPageTemplate(curCountryData), "afterbegin", true);
	}

	// if (target.matches(".btn-back")) return window.location.reload();

	if (target.matches(".icon-search")) {
		const searchValue = inputSearch.value.trim().toLowerCase();
		deletePagination();
		return searchForCountries(searchValue);
	}

	if (target.matches(".filter__text") || target.matches(".filter")) {
		const selectionList = document.querySelector(".filter__selection");
		return selectionList.classList.toggle("content--hidden-2");
	}

	if (target.matches(".filter__item")) {
		const {
			dataset: { value },
		} = target;

		const filteredCountries = countries.filter((country) => country.region === value);
		deletePagination();
		return renderHTML(
			countriesContainer,
			joinTemplate(filteredCountries, createCountryCardTemplate).join(" "),
			"afterbegin",
			true
		);
	}
});

window.onload = () => changePage(1, countries);
