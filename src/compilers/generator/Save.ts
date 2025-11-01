import fs from "fs";
import { Class } from "../../components/Class";
import { Random } from "../../components/Random";
import { UUID } from "../../types/objects/Manifest";
type ReturnValue = () => any;

export class Save extends Class {
    static data: Record<string, string> = (() => {
        if (fs.existsSync("cache")) {
            return JSON.parse(fs.readFileSync("cache", "utf-8"));
        } else {
            fs.writeFileSync("cache", "{}", "utf-8");
            return {};
        }
    })();

    private static write(file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView) {
        Save.data[String(file)] = JSON.stringify(data);
    }

    private static read(path: fs.PathOrFileDescriptor) {
        return JSON.parse(Save.data[String(path)]);
    }

    private static exists(path: fs.PathOrFileDescriptor) {
        return Save.data.hasOwnProperty(String(path));
    }

    static createFile(
        path: string,
        data: ReturnValue,
        write: Function = fs.writeFileSync,
        read: Function = fs.readFileSync
    ) {
        if (!this.exists(path)) {
            const $ = data();
            write(path, $, "utf-8");
            return $;
        } else return read(path, "utf-8");
    }

    static createJson(path: string, data: ReturnValue) {
        return Save.createFile(path, data, this.write, this.read);
    }

    static updateFile(
        path: string,
        data: ReturnValue,
        write: Function = fs.writeFileSync,
        read: Function = fs.readFileSync
    ) {
        const backup = read(path, "utf-8");
        write(path, data());
        return backup;
    }

    static updateJson(path: string, data: ReturnValue) {
        return Save.updateFile(path, data, fs.read, fs.readFileSync);
    }

    static uuid(): [UUID, UUID] {
        return <[UUID, UUID]>Save.createJson("uuid", () => ({
            uuid: [Random.getUUID(), Random.getUUID()],
        })).uuid;
    }

    static resource(mcVersion: "stable" | "preview" = "stable") {
        return Save.createJson(`compile-${mcVersion}`, () => ({
            isDevelopment: true,
            folderName: Random.getName(),
        }));
    }

    static getBuildID() {
        return Save.createJson("buildID", () => [Random.genString(16)])[0];
    }

    static build() {
        fs.writeFileSync("cache", JSON.stringify(Save.data), "utf-8");
    }
}
