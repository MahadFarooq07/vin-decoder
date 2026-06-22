import type { Vehicle } from "@/lib/normalize";

/** A field key in the common model, paired with a human label. */
export interface FieldDef {
  key: keyof Vehicle;
  label: string;
}

/** Vehicle fields organised into the groups the card renders. */
export interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    title: "Identity",
    fields: [
      { key: "vin", label: "VIN" },
      { key: "make", label: "Make" },
      { key: "model", label: "Model" },
      { key: "year", label: "Year" },
      { key: "manufacturer", label: "Manufacturer" },
      { key: "plantCountry", label: "Plant country" },
    ],
  },
  {
    title: "Classification",
    fields: [
      { key: "vehicleType", label: "Vehicle type" },
      { key: "bodyClass", label: "Body class" },
      { key: "gvwrClass", label: "GVWR class" },
      { key: "gvwrRange", label: "GVWR range" },
      { key: "doors", label: "Doors" },
    ],
  },
  {
    title: "Powertrain",
    fields: [
      { key: "fuelTypePrimary", label: "Fuel — primary" },
      { key: "fuelTypeSecondary", label: "Fuel — secondary" },
      { key: "engineCylinders", label: "Cylinders" },
      { key: "displacementL", label: "Displacement (L)" },
      { key: "driveType", label: "Drive type" },
    ],
  },
  {
    title: "Data quality",
    fields: [
      { key: "errorCode", label: "Error code" },
      { key: "errorText", label: "Error text" },
    ],
  },
];

/** Render a common-model value for display; `null` becomes an em dash. */
export function displayValue(value: string | number | null): string {
  if (value === null) return "—";
  return String(value);
}

/** A clean VIN was flagged clean by vPIC when ErrorCode is exactly "0". */
export function isCleanDecode(vehicle: Vehicle): boolean {
  return vehicle.errorCode === "0";
}

export interface ExampleVin {
  vin: string;
  label: string;
  hint: string;
}

/**
 * Three demo VINs, each verified to return a Make from the live vPIC API:
 * a heavy truck, a pickup, and a passenger car.
 */
export const EXAMPLE_VINS: ExampleVin[] = [
  { vin: "1FUJGLDR5CLBP8834", label: "Heavy truck", hint: "Freightliner Cascadia · Class 8" },
  { vin: "1FTFW1ET5DFC10312", label: "Pickup", hint: "Ford F-150" },
  { vin: "1HGCM82633A004352", label: "Passenger car", hint: "Honda Accord" },
];
