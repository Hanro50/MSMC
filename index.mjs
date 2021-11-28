/*MIT License

Copyright (c) 2021 Hanro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/


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
