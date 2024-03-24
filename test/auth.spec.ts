import msmc from "../src/index";

describe("auth", () => {
    describe("console", () => {
        describe("check server-like auth", () => {
            const auth = new msmc.Auth({
                client_id: "9263b99c-b7c7-4c98-ac73-3dd90bc1fa2e",
                redirect: "http://localhost",
            });
            auth.setServer(async (xbla) => {
                it("should return a valid token", async () => {
                    const result = await xbla.refresh(true);
                    console.log(result);
                });
            }, "https://www.hanro50.net.za/msmc/");
        });
    });
});
