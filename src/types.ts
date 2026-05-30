/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PartCategory = "cooker" | "heater";

export interface Part {
  id: number;
  name: string;
  cat: PartCategory;
  price: number;
  icon: string;
  img: string;
  desc: string;
  avail: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  icon: string;
  img: string;
  qty: number;
}

export interface MaintenanceData {
  deviceType: "بوتجاز" | "سخان غاز" | "";
  serviceType: string;
  brand: string;
  problem: string;
  customProblem: string;
  name: string;
  phone: string;
  address: string;
  city: string;
}

export interface TradeInData {
  requestType: "sell" | "renew" | "";
  deviceType: string;
  brand: string;
  age: string;
  condition: string;
  name: string;
  phone: string;
  city: string;
  notes: string;
}
