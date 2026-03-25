import { loadevent } from "./types";
import EventEmitter from "events";

interface events {
  loadEvent: [event: loadevent];
}

export const emitter = new EventEmitter<events>();
