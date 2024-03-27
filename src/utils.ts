import fs from "fs";

// sleep method
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// save an object to file
export async function saveObject(fileName: string, data: Object, dir?: string) {
  try {
    // save/load file directory
    const path = `./${dir ? dir : "output"}/${fileName}`;
    // save new tokens object
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(err);
    console.log("saving error");
  }
}

// load an object from file
export async function loadObject(fileName: string) {
  try {
    // read data from file
    const path = `./output/${fileName}`;
    const data = fs.readFileSync(path, { encoding: "utf8" });
    // return JSON
    return JSON.parse(data);
  } catch (err) {
    console.log("loading error");
    console.log(err);
    return [];
  }
}
