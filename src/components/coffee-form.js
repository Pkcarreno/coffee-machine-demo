import { LitWithTwindElement } from "../twind-setup.js";
import { html } from "lit";
import { CoffeeType, GrindSize } from "@coffee-machine/core";

class CoffeeForm extends LitWithTwindElement {
  _onSubmitCallback;

  static properties = {
    _isDisabled: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this._onSubmitCallback = undefined;
    this._isDisabled = false;
  }

  setSubmitCallback(callback) {
    if (!callback || typeof callback !== "function") {
      console.error("Invalid callback provided");
      return;
    }
    this._onSubmitCallback = callback;
  }

  async _onSubmit(e) {
    e.preventDefault();

    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());

    if (!this._onSubmitCallback) {
      console.error("No submit callback set");
      return;
    }

    this._isDisabled = true;
    await this._onSubmitCallback(data);
    this._isDisabled = false;
  }

  render() {
    return html`
      <form class="flex-1" @submit=${this._onSubmit}>
        <div class="flex flex-col gap-6 rounded-xl border py-6 shadow-md">
          <div class="px-6 gap-1.5 grid auto-rows-min  items-start">
            <span class="leading-none font-semibold text-lg"
              >Machine Setup</span
            >
          </div>
          <div class="px-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="flex gap-2 flex-col">
              <span class="text-gray-500 uppercase">Machine Info</span>
              <div class="flex gap-2 flex-col">
                <label class="font-semibold" for="machine-type"
                  >Machine Type:</label
                >
                <select
                  id="machine-type"
                  ?disabled=${this._isDisabled}
                  name="machine-type"
                  class="transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option selected value="espresso">Espresso</option>
                </select>
              </div>
            </div>

            <div class="flex gap-2 flex-col">
              <span class="text-gray-500 uppercase">Heat System Info</span>
              <div class="flex gap-2 flex-col">
                <label class="font-semibold" for="heat-power"
                  >Electric Boiler Power (Watts):</label
                >
                <input
                  type="number"
                  min="1000"
                  max="1900"
                  value="1500"
                  ?disabled=${this._isDisabled}
                  id="heat-power"
                  name="heat-power"
                  class="transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div class="flex gap-2 flex-col">
              <span class="text-gray-500 uppercase">Coffee Info</span>
              <div class="flex gap-2 flex-col">
                <label class="font-semibold" for="coffee-type"
                  >Coffee Type:</label
                >
                <select
                  id="coffee-type"
                  ?disabled=${this._isDisabled}
                  name="coffee-type"
                  class="transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option selected value="${CoffeeType.ARABICA}">
                    Arabica
                  </option>
                  <option value="${CoffeeType.ROBUSTA}">Robusta</option>
                  <option value="${CoffeeType.BLEND}">Blend</option>
                </select>
              </div>
              <div class="flex gap-2 flex-col">
                <label class="font-semibold" for="coffee-grind-size"
                  >Grind Size:</label
                >
                <select
                  id="coffee-grind-size"
                  ?disabled=${this._isDisabled}
                  name="coffee-grind-size"
                  class="transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="${GrindSize.EXTRA_FINE}">Extra Fine</option>
                  <option selected value="${GrindSize.FINE}">Fine</option>
                  <option value="${GrindSize.MEDIUM}">Medium</option>
                  <option value="${GrindSize.COARSE}">Coarse</option>
                  <option value="${GrindSize.EXTRA_COARSE}">
                    Extra Coarse
                  </option>
                </select>
              </div>
              <div class="flex gap-2 flex-col">
                <label class="font-semibold" for="coffee-weight"
                  >Amount (grams):</label
                >
                <input
                  type="number"
                  min="15"
                  max="45"
                  value="20"
                  ?disabled=${this._isDisabled}
                  id="coffee-weight"
                  name="coffee-weight"
                  class="transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div class="flex gap-2 flex-col">
              <span class="text-gray-500 uppercase">Water Info</span>
              <div class="flex gap-2 flex-col">
                <label class="font-semibold" for="water-temp"
                  >Temperature (Celsius):</label
                >
                <input
                  type="number"
                  min="80"
                  max="91"
                  value="90"
                  ?disabled=${this._isDisabled}
                  id="water-temp"
                  name="water-temp"
                  class="transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div class="flex gap-2 flex-col">
                <label class="font-semibold" for="water-volume"
                  >Volume (milliliters):</label
                >
                <input
                  type="number"
                  min="31"
                  max="60"
                  value="36"
                  ?disabled=${this._isDisabled}
                  id="water-volume"
                  name="water-volume"
                  class="transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
          <div class="px-6">
            <button
              type="submit"
              ?disabled=${this._isDisabled}
              class="bg-gray-900 hover:bg-gray-900/80 transition-all text-white w-full border py-1 rounded disabled:pointer-events-none disabled:opacity-50 "
            >
              Start Brewing!
            </button>
          </div>
        </div>
      </form>
    `;
  }
}

customElements.define("coffee-form", CoffeeForm);
