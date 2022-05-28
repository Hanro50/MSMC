import fetch from "node-fetch";
export class xplayer {
    auth: social;
    score: number;
    xuid: string;
    gamerTag: string;
    name: string;
    profilePictureURL: string;
    constructor(user: { id: string; settings: any[]; }, auth: social) {
        this.xuid = user.id;
        this.gamerTag = user.settings.find(s => s.id == "Gamertag")?.value;
        this.name = user.settings.find(s => s.id == "GameDisplayName")?.value;
        this.profilePictureURL = user.settings.find(s => s.id == "GameDisplayPicRaw").value;
        this.score = user.settings.find(s => s.id == "Gamerscore").value;
        this.auth = auth;
    }
    getFriends() { return this.auth.getFriends(this.xuid) }
}
export default class social {

    auth: string;
    constructor(auth: string) {
        this.auth = auth;
    }
    async getProfile(xuid?: string) {
        const profile = await this.xGet("/profile/settings?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag", xuid);
        return new xplayer(profile.profileUsers[0], this);
    }
    async getFriends(xuid?: string) {
        const friends = await this.xGet("/profile/settings/people/people?settings=GameDisplayName,GameDisplayPicRaw,Gamerscore,Gamertag", xuid)
        let R: xplayer[] = [];
        friends.profileUsers.forEach((element: { id: string; settings: any[]; }) => {
            R.push(new xplayer(element, this));
        });
        return R;
    }
    async xGet(enpoint: string, xuid?: string) {
        const target = xuid ? `xuid(${xuid})` : "me";
        let profileRaw = await fetch(`https://profile.xboxlive.com/users/${target}/${enpoint}`, {
            headers: {
                "Content-Type": "application/json",
                "x-xbl-contract-version": '2',
                Authorization: this.auth,
            }
        });
        return await profileRaw.json();
    }
}