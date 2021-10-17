import msmc from "./index"
export default msmc;
export function setFetch(fetchIn) { return msmc.setFetch(fetchIn) }
export function mojangAuthToken(prompt) { return msmc.mojangAuthToken(prompt) }
export function createLink(token) { return msmc.createLink(token) }
export function createLink(prompt) { return msmc.createLink(prompt) }
export function authenticate(code, MStoken, updates) { return msmc.authenticate(code, MStoken, updates) }
export function refresh(profile, updates, MStoken) { return msmc.refresh(profile, updates, MStoken) }
export function validate(profile) { msmc.validate(profile) };
export function login(token, getlink, updates) { msmc.login(token, getlink, updates) }
export function launch(type, token, updates, properties) { msmc.launch(type, token, updates, properties) }
export function fastLaunch(type, updates, prompt, properties) { return msmc.fastLaunch(type, updates, prompt, properties) }
export function getMCLC() { return msmc.getMCLC() }
export function errorCheck(result) { msmc.errorCheck(result) }
export function isDemoUser(profile) { return msmc.isDemoUser(profile) };
export function getExceptional() { return msmc.getExceptional() }
export function getCallback() { return msmc.getCallback() }
