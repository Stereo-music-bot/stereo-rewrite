import fetch from 'node-fetch';

interface TrackInfo {
    flags?: number;
    source: string;
    identifier: string;
    author: string;
    length: bigint;
    isStream: boolean;
    position: bigint;
    title: string;
    uri: string | null;
    version?: number;
    probeInfo?: { raw: string, name: string, parameters: string | null };
}
export default class rest {
    public static async search(track: string) {
        return await (
            await fetch(`http://${process.env.HOST}:${process.env.PORT}/loadtracks?identifier=${track}`, {
                headers: {
                    Authorization: process.env.PASSWORD,
                },
            })
        ).json();
    };
    public static async decode(track: string): Promise<TrackInfo> {
        return await (
            await fetch(`http://${process.env.HOST}:${process.env.PORT}/decodetrack?track=${track}`, {
                headers: {
                    Authorization: process.env.PASSWORD,
                },
            })
        ).json();
    }
};