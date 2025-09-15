const priceSlider = document.getElementById("price-range");
const priceValue = document.getElementById("price-value");
const durationSlider = document.getElementById("duration-range");
const durationValue = document.getElementById("duration-value");
const clearButton = document.getElementById("clear-filters");
const checkboxes = document.querySelectorAll(".destination-checkbox");

priceSlider.addEventListener("input", () => {
  priceValue.textContent = `$${priceSlider.value}`;
});

durationSlider.addEventListener("input", () => {
  durationValue.textContent = `${durationSlider.value} Days`;
});

clearButton.addEventListener("click", () => {
  checkboxes.forEach(cb => cb.checked = false);
  priceSlider.value = 3500;
  durationSlider.value = 14;
  priceValue.textContent = `$3500`;
  durationValue.textContent = `14 Days`;
});
