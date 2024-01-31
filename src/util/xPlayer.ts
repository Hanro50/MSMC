import type { Social } from "../auth/social";

export class XPlayer {
  auth: Social;
  score: number;
  xuid: string;
  gamerTag: string;
  name: string;
  profilePictureURL: string;
  constructor(user: { id: string; settings: any[] }, auth: Social) {
    this.xuid = user.id;
    this.gamerTag = user.settings.find((s) => s.id == "Gamertag")?.value;
    this.name = user.settings.find((s) => s.id == "GameDisplayName")?.value;
    this.profilePictureURL = user.settings.find(
      (s) => s.id == "GameDisplayPicRaw",
    ).value;
    this.score = user.settings.find((s) => s.id == "Gamerscore").value;
    this.auth = auth;
  }
  getFriends() {
    return this.auth.getFriends(this.xuid);
  }
}
export default XPlayer;