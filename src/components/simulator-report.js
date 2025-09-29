import { LitWithTwindElement } from "../twind-setup.js";
import { html, css } from "lit";
import { repeat } from "lit/directives/repeat";
import { Water, Coffee, Heat, Timer } from "@coffee-machine/core";
import { EspressoMachine } from "@coffee-machine/core/machines";

function getStepLabel(step) {
  switch (step) {
    case "heat-water":
      return "Heat water";
    case "pre-brew":
      return "Pre-heating portfilter";
    case "pre-infusion":
      return "Pre-infusion";
    case "pressure-buildup":
      return "Pressure build";
    case "extraction":
      return "Extracting";
    default:
      return `${step}`;
  }
}

const ReportTypes = {
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  INFO: "info",
  HEADING: "heading",
};

class SimulatorReport extends LitWithTwindElement {
  static properties = {
    _statusReports: { type: Array, state: true },
    _status: { type: String, state: true },
  };
  // --tw-enter-translate-y

  static get styles() {
    return css`
      @keyframes enter {
        from {
          transform: translate3d(0, 50%, 0);
        }
      }

      .animate-in {
        animation: enter 150ms ease 0s 1 normal none;
      }
    `;
  }

  constructor() {
    super();
    this._statusReports = [];
    this._status = "idle";
  }

  newReport(message, type = "") {
    const now = new Date();
    const report = {
      type,
      time: now.toLocaleTimeString(),
      message,
    };
    this._statusReports = [report, ...this._statusReports];
    this.requestUpdate();
  }

  async execute(args) {
    if (this._status === "running") {
      this.newReport("Simulation already running", ReportTypes.ERROR);
      return;
    }
    this._status = "running";

    const {
      timeScale = 1,
      coffeeType,
      coffeeGrindSize,
      coffeeNominalWeightG,
      waterNominalVolumeMl,
      waterNominalTempC,
      heatSource,
      heatPowerW,
    } = args;

    this.newReport("Simulation started", ReportTypes.HEADING);
    Timer.setTimeScale(timeScale);

    const machine = new EspressoMachine();
    const coffee = new Coffee({
      type: coffeeType,
      grindSize: coffeeGrindSize,
      nominalWeightG: coffeeNominalWeightG,
    });
    const water = new Water({
      nominalVolumeMl: waterNominalVolumeMl,
      nominalTempC: waterNominalTempC,
    });
    const heat = new Heat({
      heatSource: heatSource,
      heatPowerW: heatPowerW,
    });
    this.newReport(
      `Setup - water ${water.actualVolumeMl.toFixed(1)}ml @ ${water.actualTempC.toFixed(1)}°C • coffee ${coffee.actualWeightG}g ${coffee.type} (${coffee.grindSize}) • heater ${heat.heatPowerW}W`,
      ReportTypes.INFO,
    );

    try {
      this.newReport("Assembling machine...", ReportTypes.WARNING);
      await machine.assembleMachine(coffee, water, heat);
      this.newReport("Machine ready", ReportTypes.SUCCESS);

      this.newReport("Brewing espresso...", ReportTypes.WARNING);

      const generator = machine.brew();
      let result;

      while (true) {
        const { value: step, done } = await generator.next();

        if (done) {
          result = step;
          break;
        }

        let output = getStepLabel(step.step);

        if (step.pressureBars) {
          output += ` - ${step.pressureBars} bar`;
        }

        if (step.temperatureC) {
          output += ` ${step.pressureBars ? "•" : "-"} ${step.temperatureC.toFixed(1)}°C`;
        }

        if (step.timeRemainingMs > 0) {
          output += ` • left ${Math.round(step.timeRemainingMs / 1000)}s`;
        }

        this.newReport(output);
      }

      if (result) {
        const brewInfo = result.getBrewInfo();

        this.newReport(
          `Brew complete - TDS ${brewInfo.tds} • Ext ${brewInfo.extraction} • ${brewInfo.temperature} • ${brewInfo.volume} • ${brewInfo.category}`,
          ReportTypes.SUCCESS,
        );
      } else {
        this.newReport("Brew complete", ReportTypes.SUCCESS);
      }
    } catch (error) {
      this.newReport(`Error: ${error.message}`, ReportTypes.ERROR);
    }

    // resets
    Timer.resetTimeScale();
    this._status = "idle";
  }

  resetStatusReports() {
    this._statusReports = [];
  }

  #getMessageByType(report) {
    switch (report.type) {
      case ReportTypes.ERROR:
        return html`<span class="text-red-600">${report.message}</span>`;
      case ReportTypes.INFO:
        return html`<span class="text-blue-600">${report.message}</span>`;
      case ReportTypes.WARNING:
        return html`<span class="text-yellow-600">${report.message}</span>`;
      case ReportTypes.SUCCESS:
        return html`<span class="text-green-600">${report.message}</span>`;
      case ReportTypes.HEADING:
        return html`<span class="font-bold uppercase">${report.message}</span>`;
      default:
        return html`<span>${report.message}</span>`;
    }
  }

  render() {
    return html`
      <div class="flex-1 flex flex-col gap-6 rounded-xl border py-6 shadow-md">
        <div class="px-6 gap-1.5 grid auto-rows-min  items-start">
          <span class="leading-none font-semibold text-lg"
            >Simulator Status Report</span
          >
        </div>
        <div class="flex-1 px-6 flex flex-col">
          <div
            class="flex-1 overflow-y-auto space-y-2 rounded-lg p-4 font-mono text-sm max-h-[calc(100vh-300px)]"
          >
            ${this._statusReports.length === 0
              ? html`
                  <div class="text-center text-gray-500">
                    Press "Start Brewing!" button to start simulation
                  </div>
                `
              : html`
                  <ul>
                      ${repeat(
                        this._statusReports,
                        (report) => report.time,
                        (report) => html`
                          <li class="flex items-start gap-2 animate-in">
                            <span class="text-gray-400 text-xs shrink-0 mt-0.5"
                              >${report.time}</span
                            >
                            ${this.#getMessageByType(report)}
                          </li>
                        `,
                      )}
                  </ul
                `}
          </div>
        </div>
        ${this._statusReports.length > 0
          ? html`
              <div class="px-6 pt-6 border-t border-gray-200">
                <button
                  @click=${this.resetStatusReports}
                  class="w-full border py-1 rounded"
                >
                  Clean reports
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }
}

customElements.define("simulator-report", SimulatorReport);
