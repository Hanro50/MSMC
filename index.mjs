/**Generated*/
import msmc from "./index.js"
export default msmc;
console.log("[MSMC]: Loading in ES6 mode!")
export function setFetch(fetchIn) {return msmc.setFetch(fetchIn);};
export function mojangAuthToken(prompt) {return msmc.mojangAuthToken(prompt);};
export function createLink(token) {return msmc.createLink(token);};
export function authenticate(code, MStoken, updates = () => { }) {return msmc.authenticate(code, MStoken, updates );};
export function refresh(profile, updates = () => { }, authToken) {return msmc.refresh(profile, updates , authToken);};
export function validate(profile) {return msmc.validate(profile);};
export function login(token, getlink, updates) {return msmc.login(token, getlink, updates);};
export function fastLaunch(type, updates, prompt = "select_account", properties) {return msmc.fastLaunch(type, updates, prompt , properties);};
export function launch(type, token, updates, Windowproperties) {return msmc.launch(type, token, updates, Windowproperties);};
export function getMCLC() {return msmc.getMCLC();};
export function errorCheck(result) {return msmc.errorCheck(result);};
export function isDemoUser(result) {return msmc.isDemoUser(result);};
export function getExceptional() {return msmc.getExceptional();};
export function getCallback() {return msmc.getCallback();};