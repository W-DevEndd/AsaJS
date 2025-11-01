import { readGithubFile } from "./lib/github";
import JSONC from "jsonc-parser";
import fs from "fs";

type KEYS = "button_id" | "collection_name" | "links" | "grid_dimensions" | "textbox_name" | "slider_name" | "toggle_name" | "bag_binding" | "binding"

(async () => {
    const content: any = JSONC.parse(await readGithubFile("KalmeMarq", "Bugrock-JSON-UI-Schemas", "main", "ui.schema.json")).definitions
    const hardcodeEnumKeys = Object.keys(content).filter(v => v.startsWith("hc:"))
    const data: Record<KEYS, string[]> = {} as any
    
    for (const key of hardcodeEnumKeys) {
        const enumValues = content[key].enum
        data[key.replace("hc:", "")] = enumValues
        console.log(`Loaded ${enumValues.length} values for ${key}`);
    }

    {
        // BindingName.ts
        const enumValues = [ ...data["binding"], ...data["bag_binding"] ].filter((v, i, a) => a.indexOf(v) === i) // unique
        const enumNames = enumValues.map(v => v.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase().slice(1))
        
        const enumFileContent = `// This file is auto-generated. Do not edit manually.
export enum BindingName {
${enumNames.map((name, index) => `    "${name}" = "${enumValues[index]}"`).join(",\n")}
}
`

        fs.promises.writeFile("src/types/enums/BindingName.ts", enumFileContent)
    }
    {
        // Collection.ts
        const enumValues = data["collection_name"].filter(v => v !== "") // remove empty names
        const enumNames = enumValues.map(v => v.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase())

        const enumFileContent = `// This file is auto-generated. Do not edit manually.
export enum Collection {
${enumNames.map((name, index) => `    "${name}" = "${enumValues[index]}"`).join(",\n")}
}
`
        fs.promises.writeFile("src/types/enums/Collection.ts", enumFileContent)
    }
    {
        // Mapping.ts
        const enumValues = data["button_id"].filter(v => v !== "")
        const enumNames = enumValues.map(v => v.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()).map((v, i, a) => {
            // ensure unique names
            let name = v
            let counter = 1
            while (a.indexOf(name) !== i) {
                name = `${v}_${counter}`
                counter++
            }
            console.log(name)
            return name
        })

        console.log(enumNames)

        const enumFileContent = `// This file is auto-generated. Do not edit manually.
export enum Mapping {
${enumNames.map((name, index) => `    "${name}" = "${enumValues[index]}"`).join(",\n")}
}
`
        fs.promises.writeFile("src/types/enums/Mapping.ts", enumFileContent)
    }
})()