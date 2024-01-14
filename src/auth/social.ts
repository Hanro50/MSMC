import fetch from "node-fetch";
import { XPlayer } from "../util/xPlayer";

export class Social {
  auth: string;
  constructor(auth: string) {
    this.auth = auth;
  }
  async getProfile(xuid?: string) {
    const profile = await this.xGet(
      "/profile/settings?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag",
      xuid,
    );
    return new XPlayer(profile.profileUsers[0], this);
  }
  async getFriends(xuid?: string) {
    const friends = await this.xGet(
      "/profile/settings/people/people?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag",
      xuid,
    );
    let R: XPlayer[] = [];
    friends.profileUsers.forEach((element: { id: string; settings: any[] }) => {
      R.push(new XPlayer(element, this));
    });
    return R;
  }
  async xGet(endpoint: string, xuid?: string) {
    const target = xuid ? `xuid(${xuid})` : "me";
    let profileRaw = await fetch(
      `https://profile.xboxlive.com/users/${target}/${endpoint}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-xbl-contract-version": "2",
          Authorization: this.auth,
        },
      },
    );
    return await profileRaw.json();
  }
}
module.exports.default = Social;
